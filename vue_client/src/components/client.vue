<template>
	<div>
		<h1>Client Chat test with VueJs</h1>
		<!-- Display username and url in use, also put connection status -->
		<p>Username: {{ nick }}</p>
		<p>Ip and Port: {{ address }}</p>
		<p>Connection status: {{ connected }}</p>
	</div>
</template>

<script>
export default {
	name: "clientVue",
	props: {},
	data() {
		return {
			//Initial Settings
			nick: "",
			address: "",
			url: "ws://",
			//Status
			connected: false,
			//Websocket object
			ws: null,
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
		this.ws = new WebSocket(this.url);

		// Connection managment
		this.ws.onopen = () => {
			this.connected = true;
			this.ws.send("Hello from " + this.nick);
		};
		this.ws.onclose = () => {
			console.log("Connection closed!!!!!");
			this.connected = false;
		};
		this.ws.onerror = () => {
			console.log("Connection error!");
			this.connected = false;
		};
	},
	mounted() {
		this.ws.onmessage = (msg) => {
			console.alert(msg.toString());
		};
		//close connection after 4 seconds
		setTimeout(() => {
			this.ws.close();
		}, 4000);
	},
	methods: {
		sendMessage(message) {
			this.ws.send(message);
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
