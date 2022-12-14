const WebSocketServer = require('ws').Server
const url = require('url');
const wss = new WebSocketServer({ port: 8008 })

var users_list = {};

users_list = {
	'0': {
		u_id: 0,
		name: 'Global RedMeta Server',
		icon: 'https://cdn1.iconfinder.com/data/icons/icometric-devices/256/Server-128.png',
		online: true,
		l_id: 0,
		stat: 'Server di test che scoppierà presto 💣',
	},
};

var conn_list = {};
var messages = [];
var users_id = 1;
var mess_id = 0;
var image_id = 0;

console.log(getTimestamp(), 'Server started on port 8008');

//Helper functions
function getTimestamp() {
	var date = new Date(Date.now()).toLocaleString('it-IT', { hour12: false, timeZone: 'Europe/Rome' });
	return date.slice(11, 20);
}

function broadcast(msg) {
	wss.clients.forEach( (client) => {
			obj_send(client, msg);
	});
};

function obj_send( conn, msg , c = 0) {
	c += 1;
	if (conn.readyState == conn.OPEN) {
		conn.send(JSON.stringify(msg));
	}
	else if (conn.readyState == conn.CLOSED) {
		console.log(getTimestamp(), 'Connection closed');
	}
	// Retry if not open, after 3 tries close connection
	else if (c < 3) {
		console.warn('Retry n:', c);
		setTimeout( () => {
			obj_send(conn, msg, c);
		}, 1000);

	}
};

//WSS handlers
function onMessage(data) {
	let obj = JSON.parse(data);
	obj.text.trim();
	let res = {
		user: this.user,
	};

	switch (obj.type) {
		//Group message
		case 'message': {
			if (obj.text && obj.text.length > 0) {
				res = {
					type: 'message',
					text: obj.text,
					user: this.user,
					m_id: mess_id++,
					time: getTimestamp(),
				};
				console.log(getTimestamp(), this.user.name, 'wrote:', obj.text);
				messages.push(res);
				broadcast(res);
			}
			else console.log(getTimestamp(), 'Empty message from :', this.user.name);
			break;
		};
	//Private message
		case 'pm': {
			if (!obj.dest || !obj.text || obj.text.length == 0) {
				console.log(getTimestamp(), 'Invalid pm from:', this.user.name);
				break;
			}
			else if (!conn_list[obj.dest.u_id]) {
				console.warn('User not available:', obj.dest);
				obj_send(this, {
					type: 'error',
					text: 'User not available',
				});
				break;
			}
			else {
				res = {
					type: 'pm',
					text: obj.text,
					user: this.user,
					dest: obj.dest,
					time: getTimestamp(),
				};
				console.log(getTimestamp(), 'Private message from', this.user.name, 'to', obj.dest.name, ':', obj.text);
				obj_send(conn_list[obj.dest.u_id], res);
				if (obj.dest.u_id != this.user.u_id) obj_send(this, res);
				break;
			}
		};
	//User update settings
		case 'update': {
			let new_setts = obj.user;
			if (new_setts.u_id != this.user.u_id) {
				console.log(getTimestamp(), 'User', this.user.name, 'tried to change settings of user', conn_list[new_setts.u_id].user.name);
				break;
			}
			if (!new_setts.name || new_setts.name.length < 1 || new_setts.name.length > 10) {
				console.log(getTimestamp(), 'User', this.user.name, 'tried to set invalid name');
				break;
			}
			this.user = new_setts;
			users_list[this.user.u_id] = new_setts;
			//Send new settings to all users
			broadcast({
				type: 'update',
				user: this.user,
			});
			console.log(getTimestamp(), 'User', this.user.name, 'updated settings');
			break;
		};
		default: {
			res = {
				type: 'error',
				text: 'Unknown message type: ' + obj.type,
			};
			obj_send( this , res);
			break;
		};
	};
};

wss.on('connection', (ws, req) => {
	const params = url.parse(req.url, true);
	let new_user = {
		u_id: users_id,
		name: params.query.id,
		icon: "https://cdn-icons-png.flaticon.com/512/2202/220206" + image_id + ".png",
		stat: 'Write something funny here 🤟',
		online: true,
	};
	ws.user = new_user;
	users_list[users_id] = new_user;
	conn_list[users_id] = ws;
	users_id++;
	image_id = (image_id + 1) % 10;

	//Send user configs back if all good
	//Send messages history to newly connected users
	obj_send( ws, {
		type: 'login',
		user: new_user,
		users: users_list,
		data: messages,
	});
	//Send users list to newly connected users
	//Send new user to all other users
	broadcast({
		type: 'update',
		user: new_user,
	});
	console.log(getTimestamp(), 'New user:', ws.user.name, 'connected');

	ws.on('message', onMessage);

	ws.on('close', () => {
		console.log(getTimestamp(), 'Closed Connection with:', ws.user.name);
		ws.user.online = false;
		users_list[ws.user.u_id] = ws.user;
		delete conn_list[ws.user.u_id];
		broadcast({
			type: 'update',
			user: ws.user,
		});
	});
	ws.on('error', (err) => {
		console.log(getTimestamp(), 'WebSocket Error:', err.message.toString())
	})
});

wss.on('close', () => {
	console.log(getTimestamp(), 'Server not Listening anymore');
});
