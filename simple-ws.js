const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 6001 });

console.log('WebSocket server starting on port 6001...');

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket server');
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    event: 'connected',
    message: 'WebSocket server is live'
  }));
  
  ws.on('message', (message) => {
    console.log('Received:', message);
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server running on ws://localhost:6001');
