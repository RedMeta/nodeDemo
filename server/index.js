const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })
wss.on('connection', (ws) => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
  ws.send('Hello! Message From Server!!')
  //Close server after first disc
  ws.on('close', () => {
	console.log('Closed Connection, Closing whole server!!!');
	wss.close();
  })
});
