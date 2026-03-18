<?php

use Illuminate\Support\Facades\Route;
use App\Services\WebsocketBroadcaster;

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

// WebSocket broadcast endpoint
Route::get('/broadcasts', function () {
    $broadcasts = WebsocketBroadcaster::getRecentBroadcasts(50);
    return response()->json([
        'broadcasts' => $broadcasts,
        'timestamp' => now()->toISOString()
    ]);
});

// Clear broadcasts endpoint (for testing)
Route::delete('/broadcasts', function () {
    WebsocketBroadcaster::clearBroadcasts();
    return response()->json(['message' => 'Broadcasts cleared']);
});
