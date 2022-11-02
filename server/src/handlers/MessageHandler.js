const MessageService = require("../services/MessageService.js");
const ConnectionService = require("../services/ConnectionService.js");

const MESSAGE_TYPES_FN = {
	message: onGroupMessage,
	pm: onPrivateMessage,
	update: onUpdateMessage,
};

function onMessage(message, user) {
	const data = JSON.parse(message);

	const messageType = data.type;
	const handlerFunction = MESSAGE_TYPES_FN[messageType];

	if (!handlerFunction)
		return { type: "error", text: "Unknown message type: " + messageType };

	handlerFunction(data, user);
}

function onGroupMessage(data, user) {
	const { text } = data;
	if (!text || text.length == 0) return;

	const message = {
		type: "message",
		text,
		user,
		id: MessageService.getMessageId(),
	};

	MessageService.addMessage(message);

	ConnectionService.broadcast(message);
}

function onPrivateMessage(data, user) {
	const { dest, text } = data;
	if (!dest || !text || text.length == 0) return;

	const message = {
		type: "pm",
		text,
		user,
		dest,
		time: new Date().toLocaleTimeString("it-IT"),
	};

	ConnectionService.sendData(message, [user.socket]);
}

function onUpdateMessage(data, user) {
	const newSettings = data.user;
	user = newSettings;

	ConnectionService.broadcast({ type: "update", user, });
}

module.exports = {
	onMessage,
};
