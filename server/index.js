const WebSocketServer = require('ws').Server
const url = require('url');
const wss = new WebSocketServer({ port: 8008 })

var users_list = {};

users_list = {
	'0': {
		u_id: 0,
		name: 'Server',
		icon: 'https://cdn1.iconfinder.com/data/icons/icometric-devices/256/Server-128.png',
		online: true,
		l_id: 0,
	},
};

var conn_list = {};
var messages = [];
var users_id = 1;
var idd = 1;
var mess_id = 0;

console.log('Server started on port 8008');

//Helper functions
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
		console.log('Connection closed');
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
	obj.text = obj.text.trim();
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
				};
				console.log(this.user.name, 'wrote:', obj.text);
				broadcast(res);
			}
			else console.log('Empty message from :', this.user.name);
			break;
		};
	//Private message
		case 'pm': {
			//pm logic
			console.log('Private message from', this.user.name, 'to', obj.dest.name, ':', obj.text);
			break;
		};
	//User update settings
		case 'update': {
			let new_setts = obj.user;
			if (new_setts.u_id != this.user.u_id) {
				console.log('User', this.user.name, 'tried to change settings of user', new_setts.name);
				break;
			}
			if (!new_setts.name || new_setts.name.length < 1 || new_setts.name.length > 10) {
				console.log('User', this.user.name, 'tried to set invalid name');
				break;
			}
			this.user = new_setts;
			users_list[this.user.u_id] = new_setts;
			//Send new settings to all users
			broadcast({
				type: 'update',
				user: this.user,
			});
			console.log('User', this.user.name, 'updated settings');
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
		icon: "https://cdn-icons-png.flaticon.com/512/2202/220200" + users_id + ".png",
		online: true,
	};
	ws.user = new_user;
	users_list[users_id] = new_user;
	conn_list[users_id] = ws;
	users_id++;

	//Send user configs back if all good
	obj_send( ws, {
		type: 'login',
		user: new_user,
	});
	//Send users list to newly connected users
	obj_send( ws, {
		type: 'users',
		data: users_list,
	});
	//Send messages history to newly connected users
	obj_send( ws, {
		type: 'history',
		data: messages,
	});
	//Send new user to all other users
	broadcast({
		type: 'update',
		user: new_user,
	});
	console.log('New user:', ws.user.name, 'connected');

	ws.on('message', onMessage);

	ws.on('close', () => {
		console.log('Closed Connection with:', ws.user.name);
		ws.user.online = false;
		users_list[ws.user.u_id] = ws.user;
		delete conn_list[ws.user.u_id];
		broadcast({
			type: 'update',
			user: ws.user,
		});
	});
	ws.on('error', (err) => {
		console.log('WebSocket Error:', err.message.toString())
	})
});

wss.on('close', () => {
	console.log('Server not Listening anymore');
});
