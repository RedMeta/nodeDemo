const WebSocketServer = require('ws').Server

const wss = new WebSocketServer({ port: 8080})
console.log('Server started on port 8080');
wss.on('connection', (ws) => {
  ws.on('open' ,(client) => {
    console.log('New client connected!');
    client.send('Hello new client!');
  })
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
  });
  //Close server after first disc
  ws.on('close', () => {
    console.log('Some Client Closed Connection!');
  });
  ws.on('error', (err) => {
	console.log(`WebSocket Error: ${err.message}`)
  })
});

//Closing server in 30 secs

setTimeout(() => {
  wss.close((err) => {
	console.log(`Closing WsServer Error: ${err}`)
  })
}, 30000)
