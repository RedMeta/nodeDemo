const ConnectionService = require("./services/ConnectionService.js");
const UserController = require("./controllers/UserController.js");
const MessageHandler = require("./handlers/MessageHandler.js");
const MessageService = require("./services/MessageService.js");
const UserService = require("./services/UserService.js");

const serverUser = UserController.createUser({
	name: "Global RedMeta Server",
	icon: "https://cdn1.iconfinder.com/data/icons/icometric-devices/256/Server-128.png",
	state: "Server di test che scoppierà presto 💣",
	online: true,
});

UserService.addUser(serverUser);

ConnectionService.server.on("connection", (socket, conn) => {
	const user = UserController.createUser({
		socket,
		name: conn.url.match(/id=(.*)/)[1],
		online: true,
	});
	UserService.addUser(user);

	ConnectionService.sendData(
		{
			type: "login",
			user: user,
			users: UserService.getUsers(),
			messages: MessageService.getMessages(),
		},
		[socket]
	);

	ConnectionService.sendData(
		{ type: "update", user },
		Array.from(ConnectionService.server.clients.keys())
	);

	socket.on("close", () => {
		UserService.setOnlineUser(user, false);
		ConnectionService.sendData(
			{ type: "users", users: UserService.getUsers() },
			Array.from(ConnectionService.server.clients.keys())
		);
	});

	socket.on("message", (data) => MessageHandler.onMessage(data, user));
});
