const WebSocketServer = require('ws').Server
const url = require('url');
const uuid_v4 = require('uuid').v4;
const wss = new WebSocketServer({ port: 8008 })
var active_users = {};

console.log('Server started on port 8008');

//WSS handlers

wss.on('connection', (ws, req) => {
	const params = url.parse(req.url, true);
	ws.name = params.query.id.trim();
	ws.uid = uuid_v4();
	if (ws.name in active_users) {
		console.log('Name already taken, kicking out last', ws.name.toString());
		ws.send('Name already taken, try with a new one!!');
		ws.name = ws.name + ' | ' + ws.uid;
		active_users[ws.name] = ws.name;
		ws.close();
	}
	else {
		console.log('Client', ws.name, 'connected!');
		active_users[ws.name] = ws;
		ws.send('Welcome on the WSS server: ' + ws.name);
	}

	ws.on('message', (raw_message) => {
		var message = raw_message.toString().trim();
		//Command flow (start with '/')
		if (raw_message[0] == 47){
			let message = raw_message.toString().substring(1);
			let command = message.replace(/ .*/,'');
			//Small Server Side Command Implementation
			switch (command){
				case ('users'): {
					ws.send('Currently connected: ' + Object.keys(active_users).join(' | '));
					break;
				}
				case ('pm'): {
					message = message.substring(2).trim();
					let target_user = message.replace(/ .*/,'');
					if (target_user in active_users){
						message = message.substring(target_user.length).trim();
						console.log(ws.name, 'wrote to', target_user + ':', message);
						active_users[target_user].send(ws.name + ' wrote to you: ' + message);
					}
					else {
						ws.send("No username with Nickname: " + target_user);
					}
					break;
				}
				case ('kill'): {
					if (ws.name == 'admin') {
						console.log('ADMIN KILLED ME!!');
						wss.clients.forEach( (client) => {
							client.close();
						});
						wss.close();
					}
					else {
						ws.send("You can't do that!!")
					}
					break;
				}
				default: {
					ws.send('Invalid Command Sent!!');
				}
			}
		}
		//If not a command, group message instead
		else if (message){
			wss.clients.forEach((client) => {
				if (client.name != ws.name)
					client.send(ws.name + " said: " + message);
				else
					client.send("You sent: " + message);
			});
			console.log(ws.name, ':', message);
		}
	});

	ws.on('close', () => {
		console.log('Closed Connection with:', ws.name);
		delete active_users[ws.name];
	});

	ws.on('error', (err) => {
		console.log('WebSocket Error:', err.message.toString())
	})
});

wss.on('close', () => {
	console.log('Server not Listening anymore');
})
