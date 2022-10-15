<template>
	<div>
		<h1>Client Chat test with VueJs</h1>
		<!-- Display username and url in use, also put connection and error status -->
		<p>Username: {{ nick }}</p>
		<p>Ip and Port: {{ address }}</p>
		<p>Connection status: {{ connected }}</p>
		<p>Error: {{ error }}</p>
		<!-- Display manual connect Button -->
		<button v-if="!connected" v-on:click="reconnect">Reconnect</button>
	</div>
	<!-- Display a chat message section -->
	<div>
		<h2>Chat</h2>
		<!-- Display all messages with scroll list -->
		<div id="chat">
			<div v-for="message in messages" :key="message.id">
				<p>{{ message.id }}: {{ message.msg }}</p>
			</div>
		</div>
		<!-- Display a input text field for sending messages -->
		<input type="text" v-model="message" v-on:keyup.enter="send" />
	</div>
</template>

<script>
export default {
	name: "App",
	data() {
		return {
			//Initial Settings
			nick: "",
			address: "",
			url: "ws://",
			//Status
			connected: false,
			error: false,
			//Websocket object
			ws: null,
			//Messages array and message to send
			messages: [],
			message: "",
			id: 0,
		};
	},
	created() {
		this.nick = prompt("Enter your nickname");
		while (!this.nick) {
			this.nick = prompt("Insert a valid nickname!");
		}
		this.nick.trim();
		this.address =
			prompt("Enter the server address (default localhost)") || "localhost";
		this.address +=
			":" + (prompt("Enter the server port (default 8008)") || "8008");
		this.url += this.address + "?id=" + this.nick;
	},
	mounted() {},
	methods: {
		reconnect() {
			this.ws = new WebSocket(this.url);
			this.ws.onopen = this.onOpen;
			this.ws.onmessage = this.onMessage;
			this.ws.onclose = this.onClose;
			this.ws.onerror = this.onError;
		},
		//Websocket callbacks
		send() {
			if (!this.connected) return alert("You are not connected to the server!");
			else if (this.message) {
				this.ws.send(this.message);
				this.message = "";
			}
		},
		onMessage(m) {
			this.messages.push({
				id: this.id++,
				msg: m.data.toString(),
			});
		},
		onOpen() {
			this.connected = true;
			console.log("Connected to " + this.address);
		},
		onClose() {
			this.connected = false;
			console.log("Disconnected from " + this.address);
		},
		onError() {
			this.error = true;
			console.log("Error connecting to " + this.address);
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
