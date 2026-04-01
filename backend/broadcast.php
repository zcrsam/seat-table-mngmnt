<?php

/**
 * Simple WebSocket broadcaster for reservation events
 * This script broadcasts reservation events to the WebSocket server
 */

class WebSocketBroadcaster {
    private $wsHost = 'localhost';
    private $wsPort = 6001;
    
    public function broadcast($event, $data) {
        $message = [
            'event' => $event,
            'payload' => $data,
            'timestamp' => date('c')
        ];
        
        $jsonMessage = json_encode($message);
        
        // Create a WebSocket client to send the message
        $this->sendToWebSocketServer($jsonMessage);
        
        echo "Broadcasted: {$event}\n";
    }
    
    private function sendToWebSocketServer($message) {
        // For now, we'll use a simple HTTP POST to trigger the broadcast
        // In a real implementation, you'd use a proper WebSocket client
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:6001/broadcast');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $message);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 1);
        
        curl_exec($ch);
        curl_close($ch);
    }
}

// Usage example:
if (php_sapi_name() === 'cli') {
    $broadcaster = new WebSocketBroadcaster();
    
    // Test broadcast
    $broadcaster->broadcast('ReservationUpdated', [
        'reservation' => [
            'id' => 1,
            'name' => 'Test User',
            'status' => 'approved',
            'event_date' => date('Y-m-d'),
            'event_time' => '19:00'
        ]
    ]);
}
