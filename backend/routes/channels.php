<?php

use Illuminate\Broadcasting\Broadcasters\PusherBroadcaster;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Event Routes
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting routes that your
| application supports. The given channel authorization callbacks are
| called before the event is broadcast to everyone else.
|
*/

Broadcast::channel('reservations', function ($user) {
    return true; // Allow all authenticated users to listen to reservation events
});
