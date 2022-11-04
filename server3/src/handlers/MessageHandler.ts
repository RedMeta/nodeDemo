import Message from "../models/Message";

import * as ConnectionService from "../services/ConnectionService";
import * as UserService from "../services/UserService";

export function onPrivateMessage(
	content: string,
	sender_id: number,
	target_id: number
) {
	if (!content || content.length == 0) return;
	const targetUser = UserService.getUserById(target_id);
	if (!targetUser) return;
	const message = new Message("pm", content, sender_id, target_id);
	targetUser.socket.emit("message", message);
}

export function onGroupMessage(
	content: string,
	sender_id: number,
	target_id: number
) {
	if (!content || content.length == 0) return;
	const targetUser = UserService.getUserById(target_id);
	if (!targetUser) return;
	const message = new Message("group", content, sender_id, target_id);
	ConnectionService.server.emit("message", message);
}
