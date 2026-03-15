<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'reference_code',
        'name',
        'email',
        'phone',
        'venue_id',
        'table_number',
        'seat_number',
        'guests_count',
        'event_date',
        'event_time',
        'special_requests',
        'status',
        'type',
        'submitted_at'
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'submitted_at' => 'datetime'
    ];

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    // public function seats()
//     {
//         return $this->hasMany(Seat::class);
//     }
}
