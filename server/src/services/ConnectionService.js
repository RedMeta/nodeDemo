const ws = require("ws");

const PORT = process.env.PORT || 8008;
const server = new ws.Server({ port: PORT });

function sendData(message, sockets) {
	try {
		const data = JSON.stringify(message);
		sockets.forEach((socket) => socket.send(data));
	} catch (ex) {
		console.error("Error parsing string", message);
        console.error(ex);
	}
}

function broadcast(message) {
	sendData(message, server.clients);
}

module.exports = {
	server,
	sendData,
    broadcast
};
