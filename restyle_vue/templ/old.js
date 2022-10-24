
onMessage = function(obj) {
	let raw_message = (JSON.parse(obj)).msg.trim();
	let message = raw_message;
	//Command flow (start with '/')
	if (raw_message.startsWith('/')) {
		let message = raw_message.substring(1);
		let command = message.replace(/ .*/,'');
		//Small Server Side Command Implementation
		switch (command){
			case ('users'): {
				ws.send(JSON.stringify({
					type: 'msg',
					msg: 'Currently connected: ' + Object.keys(active_users).join(' | '),
					nick: 'Server',
					}));
				break;
			}
			case ('pm'): {
				message = message.substring(2).trim();
				let target_user = message.replace(/ .*/,'');
				if (target_user in active_users){
					message = message.substring(target_user.length).trim();
					console.log(ws.name, 'wrote to', target_user + ':', message);
					active_users[target_user].send(JSON.stringify({
						type: 'msg',
						msg: ws.name + ' wrote to you: ' + message
						}));
				}
				else {
					ws.send(JSON.stringify({
						type: 'error',
						msg: 'No username with Nickname: ' + target_user,
						nick: 'Server'
						}));
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
					ws.send(JSON.stringify({
						type: 'Error',
						msg: 'You can\'t do that!!',
						nick: 'Server'
						}));
				}
				break;
			}
			case ('close'): {
				ws.send(JSON.stringify({
					type: 'info',
					msg: 'Goodbye ' + ws.name,
					nick: 'Server'
					}));
				ws.close();
				break;
			}
			case ('help'): {
				ws.send(JSON.stringify({
					type: 'info',
					msg: "Available commands: /help, /users, /pm <user> message, /close",
					nick: 'Server',
					}));
				break;
			}
			default: {
				ws.send(JSON.stringify({
					type: 'error',
					msg: 'Invalid Command Sent!!',
					nick: 'Server',
					}));
			}
		}
	}
	//If not a command, group message instead
	else if (message){
		wss.clients.forEach((client) => {
			if (client.name != ws.name)
				client.send(JSON.stringify({
					type: 'msg',
					msg: ws.name + " said: " + message,
					nick: client.name,
					}));
			else
				client.send(JSON.stringify({
					type: 'msg',
					msg: "You sent: " + message,
					nick: client.name,
					}));
		});
		console.log(ws.name + ':', message);
	}
};
