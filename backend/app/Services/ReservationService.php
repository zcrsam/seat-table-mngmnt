<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Seat;
use App\Models\Venue;
use Illuminate\Support\Str;

class ReservationService
{
    /**
     * Create a new reservation with seat assignments
     */
    public function createReservation(array $data): Reservation
    {
        // Generate unique reference code
        $data['reference_code'] = date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $data['status'] = 'pending';
        $data['submitted_at'] = now();

        $reservation = Reservation::create($data);

        // If seats are provided, assign them to the reservation
        if (isset($data['seat_ids']) && is_array($data['seat_ids'])) {
            $this->assignSeatsToReservation($reservation, $data['seat_ids']);
        }

        return $reservation->load(['venue', 'seats']);
    }

    /**
     * Approve a reservation and reserve seats
     */
    public function approveReservation(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'reserved']);

        // Update the specific seat status if seat_number is specified
        if ($reservation->seat_number) {
            Seat::where('venue_id', $reservation->venue_id)
                ->where('table_number', $reservation->table_number)
                ->where('seat_number', $reservation->seat_number)
                ->update(['status' => 'reserved']);
        }

        return $reservation->fresh(['venue']);
    }

    /**
     * Reject a reservation and release seats
     */
    public function rejectReservation(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => 'rejected']);

        // Update the specific seat status back to available if seat_number is specified
        if ($reservation->seat_number) {
            Seat::where('venue_id', $reservation->venue_id)
                ->where('table_number', $reservation->table_number)
                ->where('seat_number', $reservation->seat_number)
                ->update(['status' => 'available']);
        }

        return $reservation->fresh(['venue']);
    }

    /**
     * Assign seats to a reservation
     */
    private function assignSeatsToReservation(Reservation $reservation, array $seatIds): void
    {
        $seats = Seat::whereIn('id', $seatIds)
            ->where('status', 'available')
            ->get();

        foreach ($seats as $seat) {
            $seat->status = 'reserved';
            $seat->reservation_id = $reservation->id;
            $seat->save();
        }
    }

    /**
     * Check if seats are available for a given venue and date
     */
    public function checkSeatAvailability(int $venueId, string $date): array
    {
        $totalSeats = Seat::where('venue_id', $venueId)->count();
        $availableSeats = Seat::where('venue_id', $venueId)
            ->where('status', 'available')
            ->count();

        return [
            'total' => $totalSeats,
            'available' => $availableSeats,
            'reserved' => $totalSeats - $availableSeats,
        ];
    }

    /**
     * Get all reservations with venue information (paginated)
     */
    public function getAllReservationsPaginated(int $page = 1, int $perPage = 10): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Reservation::orderBy('event_date', 'asc')
            ->orderBy('submitted_at', 'asc')
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(
                function ($reservation) {
                    $submittedAt = $reservation->submitted_at ? $reservation->submitted_at->format('M j, Y · g:i A') : '';
                    $submittedAt = preg_replace('/\s+/', ' ', $submittedAt); // Replace all whitespace with single space
                    
                    return [
                        'id' => $reservation->reference_code,
                        'name' => $reservation->name,
                        'email' => $reservation->email,
                        'phone' => $reservation->phone,
                        'room' => $reservation->room ?? 'Alabang Function Room',
                        'table' => $reservation->table_number,
                        'seat' => $reservation->seat_number,
                        'guests' => $reservation->guests_count,
                        'eventDate' => $reservation->event_date->format('F j, Y'),
                        'eventTime' => $reservation->event_time,
                        'specialRequests' => $reservation->special_requests,
                        'status' => $reservation->status,
                        'type' => $reservation->type,
                        'submittedAt' => $submittedAt,
                        'submittedTimestamp' => $reservation->submitted_at ? $reservation->submitted_at->timestamp : 0,
                    ];
                }
            );
    }

    /**
     * Get all reservations with venue information
     */
    public function getAllReservations(): array
    {
        return Reservation::orderBy('event_date', 'asc')
            ->orderBy('submitted_at', 'asc')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->reference_code,
                    'name' => $reservation->name,
                    'email' => $reservation->email,
                    'phone' => $reservation->phone,
                    'room' => $reservation->room ?? 'Alabang Function Room',
                    'table' => $reservation->table_number,
                    'seat' => $reservation->seat_number,
                    'guests' => $reservation->guests_count,
                    'eventDate' => $reservation->event_date->format('F j, Y'),
                    'eventTime' => $reservation->event_time,
                    'specialRequests' => $reservation->special_requests,
                    'status' => $reservation->status,
                    'type' => $reservation->type,
                    'submittedAt' => $reservation->submitted_at->format('M j, Y · g:i A'),
                    'submittedTimestamp' => $reservation->submitted_at->timestamp,
                ];
            })
            ->toArray();
    }

    /**
     * Get reservation statistics
     */
    public function getReservationStats(): array
    {
        $reservations = Reservation::all();

        return [
            'total' => $reservations->count(),
            'pending' => $reservations->where('status', 'pending')->count(),
            'approved' => $reservations->where('status', 'approved')->count(),
            'rejected' => $reservations->where('status', 'rejected')->count(),
        ];
    }

    /**
     * Delete a reservation and release seats
     */
    public function deleteReservation(Reservation $reservation): bool
    {
        // Note: In current schema, seat information is stored directly in reservations table
        // No separate seats table to update - seat status is managed by frontend seat map
        
        return $reservation->delete();
    }

    /**
     * Get reservation statistics for a venue
     */
    public function getVenueStats(int $venueId): array
    {
        $reservations = Reservation::where('venue_id', $venueId);

        return [
            'total' => $reservations->count(),
            'pending' => $reservations->where('status', 'pending')->count(),
            'approved' => $reservations->where('status', 'approved')->count(),
            'rejected' => $reservations->where('status', 'rejected')->count(),
        ];
    }
}
