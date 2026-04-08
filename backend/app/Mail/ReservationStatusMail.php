<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;
    public $status;
    public $rejectionReason;

    public function __construct($reservation, string $status, ?string $rejectionReason = null)
    {
        $this->reservation     = $reservation;
        $this->status          = $status;
        $this->rejectionReason = $rejectionReason;
    }

    public function build(): static
    {
        $subject = match ($this->status) {
            'pending'            => 'Reservation Received – Pending Approval',
            'approved', 'reserved' => 'Reservation Confirmed',
            'rejected'           => 'Reservation Update – Not Accommodated',
            default              => 'Reservation Status Update',
        };

        $statusText = match ($this->status) {
            'pending'            => 'Pending',
            'approved', 'reserved' => 'Reserved',
            'rejected'           => 'Rejected',
            default              => ucfirst($this->status),
        };

        return $this
            ->subject($subject)
            ->view('emails.reservation-status')
            ->with([
                'reservation'     => $this->reservation,
                'status'          => $this->status,
                'statusText'      => $statusText,
                'rejectionReason' => $this->rejectionReason,
            ]);
    }
}