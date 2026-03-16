<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Venue;
use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminReservationController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);
            
            $reservations = $this->reservationService->getAllReservationsPaginated($page, $perPage);
            
            return response()->json([
                'data' => $reservations->items(),
                'pagination' => [
                    'current_page' => $reservations->currentPage(),
                    'per_page' => $reservations->perPage(),
                    'total' => $reservations->total(),
                    'last_page' => $reservations->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getStats(): JsonResponse
    {
        try {
            $stats = $this->reservationService->getReservationStats();
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'venue_id' => 'required|exists:venues,id',
            'table_number' => 'nullable|string|max:50',
            'seat_number' => 'nullable|string|max:50',
            'guests_count' => 'required|integer|min:1',
            'event_date' => 'required|date',
            'event_time' => 'required|string|max:50',
            'special_requests' => 'nullable|string',
            'type' => 'required|in:whole,individual',
        ]);

        // Generate unique reference code
        $validated['reference_code'] = date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $validated['status'] = 'pending';
        $validated['submitted_at'] = now();

        $reservation = Reservation::create($validated);
        
        return response()->json($reservation, 201);
    }

    public function show(Reservation $reservation): JsonResponse
    {
        $reservation->load(['venue', 'seats']);
        return response()->json($reservation);
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'guests_count' => 'sometimes|required|integer|min:1',
            'event_date' => 'sometimes|required|date',
            'event_time' => 'sometimes|required|string|max:50',
            'special_requests' => 'sometimes|nullable|string',
            'status' => 'sometimes|required|in:pending,approved,rejected,reserved',
        ]);

        $reservation->update($validated);
        return response()->json($reservation);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            // Try to find by ID first, then by reference_code
            $reservation = Reservation::where('id', $id)->first();
            if (!$reservation) {
                $reservation = Reservation::where('reference_code', $id)->firstOrFail();
            }
            
            $this->reservationService->deleteReservation($reservation);
            return response()->json([
                'success' => true,
                'message' => 'Reservation deleted successfully',
                'reservation_id' => $id
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getVenueReservations(Venue $venue): JsonResponse
    {
        $reservations = $venue->reservations()
            ->with(['seats'])
            ->orderBy('event_date', 'asc')
            ->get();
            
        return response()->json($reservations);
    }

    public function approve(int $id): JsonResponse
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $this->reservationService->approveReservation($reservation);
            return response()->json([
                'success' => true,
                'message' => 'Reservation approved successfully',
                'reservation_id' => $reservation->reference_code
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function reject(int $id): JsonResponse
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $this->reservationService->rejectReservation($reservation);
            return response()->json([
                'success' => true,
                'message' => 'Reservation rejected successfully',
                'reservation_id' => $reservation->reference_code
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
