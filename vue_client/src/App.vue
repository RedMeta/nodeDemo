<template>
	<div id="topMenu">
		<h1>Client Chat test with VueJs</h1>
		<!-- Display username and url in use, also put connection and error status -->
		<div class="float-container">
			<div class="float-child">
				Your Nickname: {{ nick }}
				<input type="text" v-model.lazy="nick" placeholder="Max 10 chars" />
			</div>
			<div class="float-child">
				Address:
				<input type="text" v-model="address" placeholder="localhost:8008" />
			</div>
			<div class="float-child">Connection status: {{ connected }}</div>
			<div class="float-child">
				Error: {{ errObj.conn_err }}
				<!-- If there are errors, show a button to expand a box with the error message -->
				<button
					v-if="errObj.connected"
					v-on:click="errObj.showError = !errObj.showError"
				>
					Show error
				</button>
				<div v-if="errObj.showError">
					{{ errObj.error.data }}
				</div>
			</div>
		</div>
		<!-- Display manual connect Button -->
		<button v-if="!errObj.connected" v-on:click="connect">Connect</button>
	</div>
	<!-- Display a chat message section -->
	<div>
		<h2>Chat</h2>
		<!-- Display all messages with scroll list -->
		<div ref="chat" style="overflow-y: scroll; height: 200px; s">
			<div v-for="message in messages" :key="message.id">
				<p>{{ message.id }}: {{ message.msg }}</p>
			</div>
		</div>
		<input type="text" v-model="message" v-on:keyup.enter="send" />
		<!-- Display a input text field for sending messages -->
	</div>
</template>

<script>
export default {
	name: "App",
	data() {
		return {
			//Initial Settings
			nick: "",
			address: "localhost:8008",
			url: "ws://",
			//Status
			allSet: false,
			connected: false,
			errObj: {
				conn_err: false,
				showError: false,
				error: null,
			},
			//Websocket object
			ws: null,
			//Messages array and message to send
			messages: [],
			message: "",
			id: 0,
		};
	},
	created() {},
	mounted() {
		// 	this.address =
		// 		prompt("Enter the server address (default localhost)") || "localhost";
		// 	this.address +=
		// 		":" + (prompt("Enter the server port (default 8008)") || "8008");
		// 	this.url += this.address + "?id=" + this.nick;
	},
	methods: {
		connect() {
			//Validate input
			this.nick = this.nick.trim();
			this.address = this.address.trim();
			this.url += this.address + "?id=" + this.nick;
			//Set allSet to true if all is ok
			if (
				this.nick.length > 0 &&
				this.nick.length < 11 &&
				this.address.length > 0
			) {
				this.allSet = true;
			} else {
				this.allSet = false;
				this.errObj.conn_err = true;
				this.errObj.error = {
					data: "Invalid input",
				};
				return;
			}
			//Connect to the server
			if (this.allSet) {
				try {
					this.ws = new WebSocket(this.url);
					this.ws.onopen = this.onOpen;
					this.ws.onmessage = this.onMessage;
					this.ws.onclose = this.onClose;
					this.ws.onerror = this.onError;
				} catch (e) {
					this.errObj.conn_err = true;
					this.errObj.error = e;
				}
			} else {
				alert("Please set a nickname and address");
			}
		},
		//Disconnect from server
		disconnect() {
			this.ws.close();
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
			this.errObj.conn_err = true;
			this.connected = false;
			console.log("Error connecting to " + this.address);
		},
	},
	watch: {
		//Scroll to bottom when new message is added
		messages: {
			handler() {
				const container = this.$refs.chat;
				this.$nextTick(() => {
					container.scrollTop = container.scrollHeight;
				});
			},
			deep: true,
		},
		connected: {
			handler() {
				if (this.connected) this.errObj.conn_err = false;
			},
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#topMenu {
	background-color: #f1f1f1;
	padding: 5px;
	text-align: center;
	height: auto;
}
.float-container {
	display: flex;
	justify-content: space-between;
}
.float-child {
	width: 25%;
}
</style>
