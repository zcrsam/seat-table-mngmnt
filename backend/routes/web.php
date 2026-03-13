<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Seat Reservation System API',
        'version' => '1.0.0',
        'endpoints' => [
            'api/venues' => 'Get all venues',
            'api/auth/login' => 'Admin login',
            'api/reservations' => 'Manage reservations',
            'api/seats' => 'Manage seats'
        ]
    ]);
});
