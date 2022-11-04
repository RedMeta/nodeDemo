import type { Socket } from "socket.io";

import * as ConnectionService from "./services/ConnectionService";

import * as UserController from "./controllers/UserController";
import * as UserService from "./services/UserService";

import * as MessageService from "./services/MessageService";

import * as MessageHandler from "./handlers/MessageHandler";

const { server } = ConnectionService;

console.log("Server is running on port 8008");

server.on("connection", (socket: Socket) => {
	const user = UserController.createUser(socket);

	socket.emit("login", {
		user,
		users: UserService.getUsers(),
		messages: MessageService.getMessages(),
	});

	server.emit("update", { user });

	socket.on("disconnect", () => {
		UserService.setOnlineUser(user, false);
		server.emit("update", { user });
	});

	socket.on("privateMessage", (content: string, target_id: number) => {
		MessageHandler.onPrivateMessage(content, user.id, target_id);
	});

	socket.on("groupMessage", (content: string, target_id: number) => {
		MessageHandler.onGroupMessage(content, user.id, target_id);
	});

	socket.on(
		"updateUser",
		(user_data: { name?: string; icon?: string; state?: string }) => {
			user.name = user_data.name || user.name;
			user.icon = user_data.icon || user.icon;
			user.state = user_data.state || user.state;
			server.emit("update", user);
		}
	);
});

server.listen(ConnectionService.PORT);
