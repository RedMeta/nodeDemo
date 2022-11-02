const ws = require("ws");

const PORT = process.env.PORT || 8008;
// Create a new WebSocket server, if fails, exit DA RIVEDERE
let server;
try {
	server = new ws.Server({ port: PORT });
} catch (ex) {
	console.error("Failed to create WebSocket server, error");
	process.exit(1);
}

function sendData(message, sockets) {
	try {
		const data = JSON.stringify(message);
		sockets.forEach((socket) => socket.send(data));
	} catch (ex) {
		console.error("Error parsing string : ", ex);
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
