<?php

namespace Tests\Feature;

use App\Mail\ReservationStatusMail;
use App\Models\Reservation;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminRejectReservationReasonTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_reservation_notifications_send_for_reserved_and_rejected_states(): void
    {
        Mail::fake();

        $venue = Venue::create([
            'name' => 'Main Hall',
            'wing' => 'Main Wing',
            'type' => 'function room',
            'capacity' => 50,
            'price_per_hour' => 1000,
            'description' => 'Primary venue',
            'is_active' => true,
        ]);

        $rejectedReservation = Reservation::create([
            'reference_code' => '2026-0001',
            'name' => 'Test Guest',
            'email' => 'guest@example.com',
            'phone' => '09171234567',
            'venue_id' => $venue->id,
            'table_number' => 'T1',
            'seat_number' => 'S1',
            'guests_count' => 4,
            'event_date' => now()->addDay()->toDateTimeString(),
            'event_time' => '18:00',
            'special_requests' => null,
            'status' => 'pending',
            'type' => 'whole',
            'submitted_at' => now(),
        ]);

        $reservedReservation = Reservation::create([
            'reference_code' => '2026-0002',
            'name' => 'Second Guest',
            'email' => 'guest2@example.com',
            'phone' => '09171234568',
            'venue_id' => $venue->id,
            'table_number' => 'T2',
            'seat_number' => 'S2',
            'guests_count' => 2,
            'event_date' => now()->addDays(2)->toDateTimeString(),
            'event_time' => '19:00',
            'special_requests' => null,
            'status' => 'pending',
            'type' => 'whole',
            'submitted_at' => now(),
        ]);

        $this->patchJson("/api/admin/reservations/{$rejectedReservation->id}/reject", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);

        $this->patchJson("/api/admin/reservations/{$rejectedReservation->id}/reject", [
            'reason' => 'Venue is fully booked for that date',
        ])
            ->assertOk()
            ->assertJsonFragment([
                'success' => true,
                'message' => 'Reservation rejected successfully',
            ]);

        $this->patchJson("/api/admin/reservations/{$reservedReservation->id}/approve")
            ->assertOk()
            ->assertJsonFragment([
                'success' => true,
                'message' => 'Reservation approved successfully',
            ]);

        $this->assertDatabaseHas('reservations', [
            'id' => $rejectedReservation->id,
            'status' => 'rejected',
            'rejection_reason' => 'Venue is fully booked for that date',
        ]);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservedReservation->id,
            'status' => 'reserved',
        ]);

        Mail::assertSent(ReservationStatusMail::class, function (ReservationStatusMail $mail) use ($rejectedReservation) {
            return $mail->status === 'rejected'
                && $mail->rejectionReason === 'Venue is fully booked for that date'
                && (int) $mail->reservation->id === (int) $rejectedReservation->id;
        });

        Mail::assertSent(ReservationStatusMail::class, function (ReservationStatusMail $mail) use ($reservedReservation) {
            return $mail->status === 'reserved'
                && (int) $mail->reservation->id === (int) $reservedReservation->id;
        });
    }
}
