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
            // URL decode parameters
            $wing = urldecode($wing);
            $room = urldecode($room);
            
            // Debug logging
            \Log::info("SeatMap request - Wing: '$wing', Room: '$room'");
            
            // Find the venue by name and wing
            $venue = Venue::where('name', $room)
                ->where('wing', $wing)
                ->first();

            if (!$venue) {
                \Log::warning("Venue not found - Wing: '$wing', Room: '$room'");
                return response()->json(['success' => false, 'message' => 'Venue not found', 'debug' => ['wing' => $wing, 'room' => $room]], 404);
            }

            // Get all seats for this venue
            $seats = Seat::where('venue_id', $venue->id)->get();

            // Get all reservations for this venue
            $reservations = Reservation::where('venue_id', $venue->id)
                ->whereIn('status', ['pending', 'approved'])
                ->get();

            // Group seats by table to match frontend structure
            $tables = [];
            foreach ($seats as $seat) {
                $tableNumber = $seat->table_number;
                
                // Initialize table if not exists
                if (!isset($tables[$tableNumber])) {
                    $tables[$tableNumber] = [
                        'id' => $tableNumber,
                        'seats' => []
                    ];
                }
                
                // Check if seat is reserved
                $reservation = $reservations->firstWhere('seat_number', $seat->seat_number);
                $status = $reservation ? $reservation->status : ($seat->status ?? 'available');
                
                // Add seat to table
                $tables[$tableNumber]['seats'][] = [
                    'id' => $seat->seat_number,
                    'num' => $seat->seat_number,
                    'status' => $status,
                    'x' => $seat->x_position,
                    'y' => $seat->y_position,
                ];
            }

            // Convert to array and sort by table ID
            $tableArray = array_values($tables);
            usort($tableArray, function($a, $b) {
                return strcasecmp($a['id'], $b['id']);
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'v' => 2,
                    'tables' => $tableArray,
                    'labels' => null,
                    'standaloneSeats' => []
                ],
                'venue' => [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'wing' => $venue->wing,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get seatmap data by venue ID
     */
    public function getSeatmapById(int $venueId): JsonResponse
    {
        try {
            // Find venue by ID
            $venue = Venue::find($venueId);

            if (!$venue) {
                return response()->json(['success' => false, 'message' => 'Venue not found'], 404);
            }

            // Get all seats for this venue
            $seats = Seat::where('venue_id', $venue->id)->get();

            // Get all reservations for this venue
            $reservations = Reservation::where('venue_id', $venue->id)
                ->whereIn('status', ['pending', 'approved'])
                ->get();

            // Group seats by table to match frontend structure
            $tables = [];
            foreach ($seats as $seat) {
                $tableNumber = $seat->table_number;
                
                // Initialize table if not exists
                if (!isset($tables[$tableNumber])) {
                    $tables[$tableNumber] = [
                        'id' => $tableNumber,
                        'seats' => []
                    ];
                }
                
                // Check if seat is reserved
                $reservation = $reservations->firstWhere('seat_number', $seat->seat_number);
                $status = $reservation ? $reservation->status : ($seat->status ?? 'available');
                
                // Add seat to table
                $tables[$tableNumber]['seats'][] = [
                    'id' => $seat->seat_number,
                    'num' => $seat->seat_number,
                    'status' => $status,
                    'x' => $seat->x_position,
                    'y' => $seat->y_position,
                ];
            }

            // Convert to array and sort by table ID
            $tableArray = array_values($tables);
            usort($tableArray, function($a, $b) {
                return strcasecmp($a['id'], $b['id']);
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'v' => 2,
                    'tables' => $tableArray,
                    'labels' => null,
                    'standaloneSeats' => []
                ],
                'venue' => [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'wing' => $venue->wing,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
