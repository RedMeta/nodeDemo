import Message from "../models/Message";

const messages: Message[] = [];

export function addMessage(message: Message) {
	messages.push(message);
}

export function delUser(message: Message) {
	const messageIndex = messages.indexOf(message);
	if (messageIndex == -1) return;
	messages.splice(messageIndex, 1);
}

export function getMessages() {
	return messages;
}
