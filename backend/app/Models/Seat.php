<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seat extends Model
{
    protected $fillable = [
        'venue_id',
        'table_number',
        'seat_number',
        'x_position',
        'y_position',
        'status',
        'reservation_id'
    ];

    protected $casts = [
        'x_position' => 'integer',
        'y_position' => 'integer'
    ];

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
