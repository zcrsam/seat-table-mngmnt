<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Seat;
use App\Models\Reservation;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SeatMapController extends Controller
{
    /**
     * Get seatmap data for a specific venue/room
     */
    public function getSeatmap(string $wing, string $room): JsonResponse
    {
        try {
            // Find the venue by name and wing
            $venue = Venue::where('name', $room)
                ->where('wing', $wing)
                ->first();

            if (!$venue) {
                return response()->json(['error' => 'Venue not found'], 404);
            }

            // Get all seats for this venue
            $seats = Seat::where('venue_id', $venue->id)->get();

            // Get all reservations for this venue
            $reservations = Reservation::where('venue_id', $venue->id)
                ->whereIn('status', ['pending', 'approved'])
                ->get();

            // Build seatmap data structure
            $seatmapData = [
                'venue' => [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'wing' => $venue->wing,
                    'type' => $venue->type,
                ],
                'seats' => $seats->map(function ($seat) use ($reservations) {
                    // Check if seat is reserved
                    $reservation = $reservations->firstWhere('seat_number', $seat->seat_number);
                    
                    return [
                        'id' => $seat->id,
                        'table_number' => $seat->table_number,
                        'seat_number' => $seat->seat_number,
                        'x_position' => $seat->x_position,
                        'y_position' => $seat->y_position,
                        'status' => $reservation ? 'reserved' : $seat->status,
                        'reservation' => $reservation ? [
                            'id' => $reservation->reference_code,
                            'name' => $reservation->name,
                            'status' => $reservation->status,
                        ] : null,
                    ];
                })->groupBy('table_number'),
                'reservations' => $reservations->map(function ($reservation) {
                    return [
                        'id' => $reservation->reference_code,
                        'name' => $reservation->name,
                        'email' => $reservation->email,
                        'table_number' => $reservation->table_number,
                        'seat_number' => $reservation->seat_number,
                        'guests_count' => $reservation->guests_count,
                        'status' => $reservation->status,
                        'type' => $reservation->type,
                        'event_date' => $reservation->event_date->format('Y-m-d'),
                        'event_time' => $reservation->event_time,
                    ];
                }),
            ];

            return response()->json($seatmapData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
