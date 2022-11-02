const ConnectionService = require("./services/ConnectionService.js");
const UserController = require("./controllers/UserController.js");
const MessageHandler = require("./handlers/MessageHandler.js");
const MessageService = require("./services/MessageService.js");
const UserService = require("./services/UserService.js");

const baseUser = UserController.createUser(
	undefined,
	"Global RedMeta Server",
	"https://cdn1.iconfinder.com/data/icons/icometric-devices/256/Server-128.png",
	"Server di test che scoppierà presto 💣"
);

UserService.addUser(baseUser);

ConnectionService.server.on("connection", (socket, conn) => {
	const user = UserController.createUser(socket,conn.url.match(/id=(.*)/)[1]);
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
		UserService.delUser(user);
		ConnectionService.sendData(
			{ type: "users", users: UserService.getUsers() },
			Array.from(ConnectionService.server.clients.keys())
		);
	});

	socket.on("message", (data) => MessageHandler.onMessage(data, user));
});
