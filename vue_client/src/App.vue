<template>
	<div id="topMenu">
		<h1>Client Chat test with VueJs</h1>
		<!-- Display username and url in use, also put connection and error status -->
		<div class="float-container">
			<div class="float-child">
				Your Nickname: {{ nick }} <br />
				<input
					v-if="!this.connected"
					type="text"
					v-model.lazy="nick"
					placeholder="Max 10 chars"
				/>
			</div>
			<div class="float-child">
				Address: {{ address }} <br />
				<input
					v-if="!connected"
					type="text"
					@change="updtAddress"
					placeholder="localhost:8008"
				/>
			</div>
			<div class="float-child">Connection status: {{ connected }}</div>
			<div class="float-child">
				Error: {{ errObj.conn_err }} <br />
				<!-- If there are errors, show a button to expand a box with the error message -->
				<button
					v-if="errObj.conn_err"
					v-on:click="errObj.showError = !errObj.showError"
				>
					{{ errObj.showError ? "Hide" : "Show" }} error
				</button>
				<div v-if="errObj.showError">
					{{ errObj.error }}
				</div>
			</div>
		</div>
		<!-- Display button to connect/disconnect from ws -->
		<button v-if="!connected" v-on:click="connect">Connect</button>
		<button v-if="connected" v-on:click="disconnect">Disconnect</button>
	</div>
	<!-- Display a chat message section -->
	<div>
		<h2>Chat</h2>
		<!-- Display all messages with scroll list -->
		<div ref="chat" id="chat_sec">
			<div v-for="message in messages" :key="message.id">
				<p>{{ message.id ? message.id + ":" : "" }} {{ message.msg }}</p>
			</div>
		</div>
		<input
			type="text"
			v-model="message"
			v-on:keyup.enter="send"
			placeholder="Message or /command"
		/>
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
				error: "",
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
		//Set the url to the address in the input field
		this.url += this.address;
	},
	methods: {
		connect() {
			//Validate input
			this.nick = this.nick.trim();
			this.url = "ws://" + this.address + "?id=" + this.nick;
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
				this.errObj.error = "Invalid Name or Address";
			}
			//Connect to the server
			if (this.allSet) {
				try {
					this.ws = new WebSocket(this.url);
					this.ws.onopen = this.onOpen;
					this.ws.onmessage = this.onMessage;
					this.ws.onclose = this.onClose;
					this.ws.onerror = this.onError;
				} catch (error) {
					this.errObj.conn_err = true;
					this.errObj.error = error.data;
				}
			} else {
				alert("Please set a valid nickname and address");
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
				msg: JSON.parse(m.data).mess,
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
			this.errObj.error = "Error connecting to " + this.address;
			this.connected = false;
			console.log("Error connecting to " + this.address);
		},
		//Var Updates
		updtAddress(e) {
			let newAdr = e.target.value.toString().trim();
			if (newAdr == "" || newAdr == this.address)
				this.address = "localhost:8008";
			else this.address = newAdr;

			this.url = "ws://" + this.address;
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
				if (this.connected) {
					this.errObj.showError = false;
					this.errObj.conn_err = false;
					this.errObj.error = null;
				}
			},
		},
	},
};
</script>

<style>
#topMenu {
	background-color: #f1f1f1;
	padding: 5px;
	text-align: center;
	height: auto;
}
#chat_sec {
	height: 250px;
	overflow-y: scroll;
}
.float-container {
	display: flex;
	justify-content: space-between;
}
.float-child {
	width: 25%;
}
</style>
