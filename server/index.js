const WebSocketServer = require('ws').Server
const url = require('url');
const uuid_v4 = require('uuid').v4;
const wss = new WebSocketServer({ port: 8080})
var active_users = {};

console.log('Server started on port 8080');
wss.on('connection', (ws, req) => {
	const params = url.parse(req.url, true);
	ws.name = params.query.id;
	ws.uid = uuid_v4();
	active_users[ws.name] = ws;
	wss.clients.forEach( (client) => {
		if (ws.name == client.name && ws.uid != client.uid){
			ws.send('Name already taken, try with a new one!!');
			ws.close();
		}
	});

	console.log('Client ' + ws.name + ' connected!');
	ws.send(`Hello ${ws.name} !`);
	ws.on('message', (message) => {
		if (message[0] == 47){
			let command = message.toString().slice(1);
			if (command.startsWith('pm')){
				command = command.substring(2).trim();
				let target_user = command.substring(0, command.indexOf(':'));
				if (target_user.length > 0){
					if (target_user in active_users){
						let message = command.substring(command.indexOf(':') + 1).trim();
						active_users[target_user].send(`${ws.name} told you: ${message}`);
					}
					else
					ws.send("No username with that Nickname");
				}
				else {
					ws.send("No Nick provided!!");
				}
			}
			else {
				ws.send('Invalid Command Sent!!');
			}
		}
		else if (ws.name == 'admin' && message == 'DIE'){
			console.log('ADMIN TOLD ME TO DIE!!');
			shutting = true;
			wss.clients.forEach( (client) => {
				client.close();
			});
			wss.close();
		}
		else {
			wss.clients.forEach((client) => {
				if (client.name != ws.name){
					client.send(`${ws.name} said: ${message}`);
				}
			});
		}
		console.log(`${ws.name}: ${message}`);
	});
	ws.on('close', () => {
		console.log(`${ws.name} Closed Connection!`);
		delete active_users[ws.name];
	});
	ws.on('error', (err) => {
	console.log(`WebSocket Error: ${err.message.toString()}`)
	})
});

wss.on('close', () => {
	console.log('Server not Listening anymore');
})

//Closing server in 30 secs

