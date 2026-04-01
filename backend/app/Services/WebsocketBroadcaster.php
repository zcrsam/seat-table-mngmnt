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
        $host = config('broadcasting.connections.pusher.options.wsHost', 'localhost');
        $port = config('broadcasting.connections.pusher.options.wsPort', 6001);
        
        $payload = [
            'event' => $event,
            'channel' => $channel,
            'payload' => $data,
            'timestamp' => now()->toISOString()
        ];

        // Send to our WebSocket server via HTTP POST
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "http://{$host}:{$port}/broadcast");
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 2);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                Log::info('[WebSocket] Event broadcasted successfully', [
                    'channel' => $channel,
                    'event' => $event,
                    'data_id' => $data['id'] ?? 'unknown'
                ]);
                return true;
            } else {
                Log::error('[WebSocket] Failed to broadcast', [
                    'http_code' => $httpCode,
                    'response' => $response
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('[WebSocket] Broadcast exception: ' . $e->getMessage());
            return false;
        }
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
