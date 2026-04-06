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

    /**
     * Create a new message instance.
     *
     * @param  mixed   $reservation
     * @param  string  $status  — 'pending' | 'approved' | 'rejected'
     */
    public function __construct($reservation, string $status)
    {
        $this->reservation = $reservation;
        $this->status      = $status;
    }

    /**
     * Build the message.
     */
    public function build(): static
    {
        $subject = match ($this->status) {
            'pending'  => 'Reservation Received – Pending Approval',
            'approved' => 'Reservation Approved – Confirmed',
            'rejected' => 'Reservation Update – Not Accommodated',
            default    => 'Reservation Status Update',
        };

        $statusText = match ($this->status) {
            'pending'  => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            default    => ucfirst($this->status),
        };

        return $this
            ->subject($subject)
            ->view('emails.reservation-status')
            ->with([
                'reservation' => $this->reservation,
                'status'      => $this->status,
                'statusText'  => $statusText,
            ]);
    }
}