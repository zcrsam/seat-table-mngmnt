<?php

namespace App\Services;

class WebSocketService
{
    private $wsHost = 'localhost';
    private $wsPort = 6001;
    
    /**
     * Broadcast an event to WebSocket clients
     */
    public function broadcast(string $event, array $data)
    {
        $message = [
            'event' => $event,
            'payload' => $data,
            'timestamp' => now()->toISOString()
        ];
        
        $jsonMessage = json_encode($message);
        
        try {
            $this->sendToWebSocketServer($jsonMessage);
            \Log::info("WebSocket broadcast sent: {$event}", $data);
        } catch (\Exception $e) {
            \Log::error("WebSocket broadcast failed: {$e->getMessage()}");
        }
    }
    
    /**
     * Send message to WebSocket server via HTTP POST
     */
    private function sendToWebSocketServer(string $message)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:6001/broadcast');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $message);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2);
        
        curl_exec($ch);
        curl_close($ch);
    }
    
    /**
     * Broadcast reservation created event
     */
    public function broadcastReservationCreated($reservation)
    {
        $this->broadcast('ReservationCreated', [
            'reservation' => [
                'id' => $reservation->id,
                'name' => $reservation->name,
                'email' => $reservation->email,
                'phone' => $reservation->phone,
                'venue' => $reservation->venue,
                'room' => $reservation->room,
                'table_number' => $reservation->table_number,
                'seat_number' => $reservation->seat_number,
                'guests' => $reservation->guests,
                'event_date' => $reservation->event_date,
                'event_time' => $reservation->event_time,
                'status' => $reservation->status,
                'created_at' => $reservation->created_at,
                'updated_at' => $reservation->updated_at,
            ]
        ]);
    }
    
    /**
     * Broadcast reservation updated event
     */
    public function broadcastReservationUpdated($reservation)
    {
        $this->broadcast('ReservationUpdated', [
            'reservation' => [
                'id' => $reservation->id,
                'name' => $reservation->name,
                'email' => $reservation->email,
                'phone' => $reservation->phone,
                'venue' => $reservation->venue,
                'room' => $reservation->room,
                'table_number' => $reservation->table_number,
                'seat_number' => $reservation->seat_number,
                'guests' => $reservation->guests,
                'event_date' => $reservation->event_date,
                'event_time' => $reservation->event_time,
                'status' => $reservation->status,
                'created_at' => $reservation->created_at,
                'updated_at' => $reservation->updated_at,
            ]
        ]);
    }
    
    /**
     * Broadcast reservation deleted event
     */
    public function broadcastReservationDeleted($reservation)
    {
        $this->broadcast('ReservationDeleted', [
            'reservation' => [
                'id' => $reservation->id,
                'name' => $reservation->name,
                'email' => $reservation->email,
                'status' => $reservation->status,
            ]
        ]);
    }
}
