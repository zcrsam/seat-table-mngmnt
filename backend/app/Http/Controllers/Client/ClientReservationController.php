<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Venue;
use App\Services\WebsocketBroadcaster;
use App\Events\ReservationCreated;
use App\Events\SeatReserved;
use App\Events\TableReserved;
use App\Mail\ReservationStatusMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class ClientReservationController extends Controller
{
    public function index(): JsonResponse
    {
        $reservations = Reservation::orderBy('event_date', 'asc')->get();
        return response()->json($reservations);
    }

    public function store(Request $request): JsonResponse
    {
        \Log::info('Store called, email: ' . $request->email);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|max:255',
            'phone'            => 'required|string|max:20',
            'venue_id'         => 'required|exists:venues,id',
            'table_number'     => 'nullable|string|max:50',
            'seat_number'      => 'nullable|string|max:50',
            'guests_count'     => 'required|integer|min:1',
            'event_date'       => 'required|date',
            'event_time'       => 'required|string|max:50',
            'special_requests' => 'nullable|string',
            'type'             => 'required|in:whole,individual',
        ]);

        $validated['reference_code'] = date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $validated['status']         = 'pending';
        $validated['submitted_at']   = now();

        $reservation = Reservation::create($validated);

        // Send pending confirmation email to the client
        try {
            Mail::to($reservation->email)
                ->send(new ReservationStatusMail($reservation, 'pending'));
        } catch (\Exception $e) {
            \Log::error('Failed to send pending email: ' . $e->getMessage());
        }

        broadcast(new ReservationCreated($reservation))->toOthers();

        WebsocketBroadcaster::broadcast('reservations', 'ReservationCreated', [
            'reservation' => $reservation
        ]);

        if ($reservation->type === 'individual' && $reservation->seat_number) {
            broadcast(new SeatReserved($reservation->seat_number, $reservation->table_number))->toOthers();
            WebsocketBroadcaster::broadcast('reservations', 'SeatReserved', [
                'seatNumber'  => $reservation->seat_number,
                'tableNumber' => $reservation->table_number
            ]);
        } elseif ($reservation->type === 'whole' && $reservation->table_number) {
            broadcast(new TableReserved($reservation->table_number, $reservation->guests_count))->toOthers();
            WebsocketBroadcaster::broadcast('reservations', 'TableReserved', [
                'tableNumber' => $reservation->table_number,
                'guests'      => $reservation->guests_count
            ]);
        }

        return response()->json($reservation, 201);
    }

    public function show(Reservation $reservation): JsonResponse
    {
        $reservation->load(['venue']);
        return response()->json($reservation);
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'email'            => 'sometimes|required|email|max:255',
            'phone'            => 'sometimes|required|string|max:20',
            'guests_count'     => 'sometimes|required|integer|min:1',
            'event_date'       => 'sometimes|required|date',
            'event_time'       => 'sometimes|required|string|max:50',
            'special_requests' => 'sometimes|nullable|string',
            'status'           => 'sometimes|required|in:pending,approved,rejected,reserved',
        ]);

        $reservation->update($validated);
        return response()->json($reservation);
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        $reservation->delete();
        return response()->json(null, 204);
    }

    public function getVenueReservations(Venue $venue): JsonResponse
    {
        $reservations = $venue->reservations()
            ->orderBy('event_date', 'asc')
            ->get();
        return response()->json($reservations);
    }

    public function approve(Reservation $reservation): JsonResponse
    {
        $reservation->update(['status' => 'approved']);
        return response()->json($reservation);
    }

    public function reject(Reservation $reservation): JsonResponse
    {
        $reservation->update(['status' => 'rejected']);
        return response()->json($reservation);
    }
}