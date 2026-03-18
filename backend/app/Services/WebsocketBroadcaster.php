<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class WebsocketBroadcaster
{
    private static $wsUrl = null;
    private static $connected = false;

    /**
     * Initialize WebSocket connection
     */
    private static function connect()
    {
        if (self::$connected) {
            return true;
        }

        $host = config('broadcasting.connections.pusher.options.wsHost', 'localhost');
        $port = config('broadcasting.connections.pusher.options.wsPort', 6001);
        self::$wsUrl = "ws://{$host}:{$port}";

        // For now, we'll use cURL to send HTTP requests to a simple endpoint
        // In a real implementation, you'd use a proper WebSocket client library
        self::$connected = true;
        
        Log::info('[WebSocket] Initialized broadcaster', ['url' => self::$wsUrl]);
        return true;
    }

    /**
     * Broadcast an event to the WebSocket server
     */
    public static function broadcast($channel, $event, $data)
    {
        if (!self::connect()) {
            Log::error('[WebSocket] Failed to connect to WebSocket server');
            return false;
        }

        // For development, we'll use a simple HTTP POST to trigger the event
        // In production, you'd use a proper WebSocket client
        $payload = [
            'event' => $event,
            'channel' => $channel,
            'payload' => $data,
            'timestamp' => now()->toISOString()
        ];

        // Use file-based broadcasting for now (simple and reliable)
        $broadcastFile = storage_path('app/broadcasts.json');
        $broadcasts = [];
        
        if (file_exists($broadcastFile)) {
            $broadcasts = json_decode(file_get_contents($broadcastFile), true) ?: [];
        }
        
        $broadcasts[] = $payload;
        
        // Keep only last 100 broadcasts
        if (count($broadcasts) > 100) {
            $broadcasts = array_slice($broadcasts, -100);
        }
        
        file_put_contents($broadcastFile, json_encode($broadcasts));
        
        Log::info('[WebSocket] Event broadcasted', [
            'channel' => $channel,
            'event' => $event,
            'data_id' => $data['id'] ?? 'unknown'
        ]);

        return true;
    }

    /**
     * Get recent broadcasts (for testing/debugging)
     */
    public static function getRecentBroadcasts($limit = 10)
    {
        $broadcastFile = storage_path('app/broadcasts.json');
        
        if (!file_exists($broadcastFile)) {
            return [];
        }
        
        $broadcasts = json_decode(file_get_contents($broadcastFile), true) ?: [];
        return array_slice($broadcasts, -$limit);
    }

    /**
     * Clear all broadcasts
     */
    public static function clearBroadcasts()
    {
        $broadcastFile = storage_path('app/broadcasts.json');
        if (file_exists($broadcastFile)) {
            unlink($broadcastFile);
        }
        return true;
    }
}
