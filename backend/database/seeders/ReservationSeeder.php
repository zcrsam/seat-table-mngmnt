<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reservation;
use App\Models\Venue;
use Illuminate\Support\Str;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $venues = Venue::all();
        
        if ($venues->isEmpty()) {
            return;
        }

        $reservations = [
            [
                'name' => 'David Lee',
                'email' => 'david.lee@email.com',
                'phone' => '09155566677',
                'venue_id' => $venues->where('name', '20/20 Function Room C')->first()?->id ?? $venues->first()->id,
                'table_number' => 'T3',
                'seat_number' => null,
                'guests_count' => 4,
                'event_date' => '2026-03-25 18:30:00',
                'event_time' => '6:30 PM',
                'special_requests' => 'Corporate event setup',
                'status' => 'approved',
                'type' => 'whole',
                'submitted_at' => now()->subDays(13),
            ],
            [
                'name' => 'James Reyes',
                'email' => 'james@email.com',
                'phone' => '09555666777',
                'venue_id' => $venues->where('name', 'Business Center')->first()?->id ?? $venues->first()->id,
                'table_number' => 'T2',
                'seat_number' => 'Seat 4',
                'guests_count' => 1,
                'event_date' => '2026-03-08 14:00:00',
                'event_time' => '2:00 PM',
                'special_requests' => 'None',
                'status' => 'rejected',
                'type' => 'individual',
                'submitted_at' => now()->subDays(8),
            ],
            [
                'name' => 'Lia Santos',
                'email' => 'lia.santos@gmail.com',
                'phone' => '09111222333',
                'venue_id' => $venues->where('name', 'Laguna Ballroom')->first()?->id ?? $venues->first()->id,
                'table_number' => 'T3',
                'seat_number' => null,
                'guests_count' => 5,
                'event_date' => '2026-03-10 17:30:00',
                'event_time' => '5:30 PM',
                'special_requests' => 'Birthday setup',
                'status' => 'approved',
                'type' => 'whole',
                'submitted_at' => now()->subDays(5),
            ],
            [
                'name' => 'Anna Tan',
                'email' => 'anna.tan@email.com',
                'phone' => '09222333444',
                'venue_id' => $venues->where('name', '20/20 Function Room B')->first()?->id ?? $venues->first()->id,
                'table_number' => 'T2',
                'seat_number' => null,
                'guests_count' => 3,
                'event_date' => '2026-04-01 20:00:00',
                'event_time' => '8:00 PM',
                'special_requests' => 'Vegan menu',
                'status' => 'pending',
                'type' => 'whole',
                'submitted_at' => now()->subDays(4),
            ],
            [
                'name' => 'Marco dela Cruz',
                'email' => 'marco@email.com',
                'phone' => '09987654321',
                'venue_id' => $venues->where('name', 'Alabang Function Room')->first()?->id ?? $venues->first()->id,
                'table_number' => 'T1',
                'seat_number' => 'Seat 9',
                'guests_count' => 1,
                'event_date' => '2026-03-20 18:00:00',
                'event_time' => '6:00 PM',
                'special_requests' => 'Wheelchair access needed',
                'status' => 'pending',
                'type' => 'individual',
                'submitted_at' => now()->subDays(3),
            ],
            [
                'name' => 'Sarah Kim',
                'email' => 'sarahkim@gmail.com',
                'phone' => '09123456789',
                'venue_id' => $venues->where('name', '20/20 Function Room A')->first()?->id ?? $venues->first()->id,
                'table_number' => 'T1',
                'seat_number' => null,
                'guests_count' => 2,
                'event_date' => '2026-03-15 19:00:00',
                'event_time' => '7:00 PM',
                'special_requests' => 'None',
                'status' => 'pending',
                'type' => 'whole',
                'submitted_at' => now()->subDays(2),
            ],
        ];

        foreach ($reservations as $reservation) {
            Reservation::create([
                'reference_code' => date('Y') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT),
                ...$reservation,
            ]);
        }
    }
}
