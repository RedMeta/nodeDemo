const WebSocketServer = require('ws').Server
const url = require('url');
const uuid_v4 = require('uuid').v4;
const wss = new WebSocketServer({ port: 8080})

console.log('Server started on port 8080');
wss.on('connection', (ws, req) => {
	const params = url.parse(req.url, true);
	ws.name = params.query.id;

	console.log('Client ' + ws.name + ' connected!');
	ws.send('Hello new client!');
	ws.on('message', (message) => {
		if (message == 'DIE'){
			console.log('SOMEONE KILLED ME!!');
			wss.clients.forEach( (client) => {
				client.close();
			} );
			wss.close();
		}
		console.log(`Received message => ${message}`);
	});
	//Close server after first disc
	ws.on('close', () => {
		console.log('Some Client Closed Connection!');
	});
	ws.on('error', (err) => {
	console.log(`WebSocket Error: ${err.message.toString()}`)
	})
});

wss.on('close', () => {
	console.log('Server not Listening anymore');
})

//Closing server in 30 secs

