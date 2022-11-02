const messages = [];

function addMessage(message) {
	messages.push(message);
}

function delMessage(message) {
	messages = messages.filter((e) => e != message);
}

function getMessages() {
	return messages;
}

function getMessageId() {
	return messages.length;
}

module.exports = {
	addMessage,
	delMessage,
	getMessages,
	getMessageId,
};
