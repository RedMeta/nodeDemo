<template>
	<div class="container">
		<div class="wrapper-chat">
			<div class="people-list">
				<div class="search">
					<input type="text" placeholder="search" />
				</div>
				<!-- Connected usr List with custom pins-->
				<ul class="list">
					<li v-for="usr of ordered_users" :key="usr.u_id">
						<img :src="usr.icon" alt="avatar" />
						<div>
							<div class="name">{{ usr.name }}</div>
							<div class="status">
								<i
									:class="{
										online: usr.online,
										offline: !usr.online,
										me: usr.u_id == client.u_id,
									}"
									>{{ usr.u_id }}
								</i>
							</div>
						</div>
					</li>
				</ul>
			</div>
			<div class="chat">
				<div class="chat-header">
					<!-- For now only groupchat, later render also pm switch -->
					<div class="chat-about">
						<div class="chat-with">Connected to {{ address }}</div>
						<div class="chat-num-messages">
							already {{ messages.length }} messages
						</div>
						<!--<i class="fa-star"></i>-->
					</div>
					<!-- Set an input field for the username and a connect button -->
					<div v-if="!connected" class="connection_set">
						<input type="text" placeholder="username" v-model="client.name" />
						<button @click="connect(client)">Connect</button>
					</div>
					<div v-if="connected" class="connection_set">
						<button @click="disconnect()">Disconnect</button>
					</div>
				</div>
				<div class="chat-history" ref="chat_cont">
					<ul>
						<!-- Display all messages with scroll list -->
						<li v-for="msg in messages" :key="msg.m_id">
							<div
								class="message-data"
								:class="{ 'align-right': msg.user.u_id == client.u_id }"
							>
								{{ msg.user.name }}
							</div>
							<div
								class="message"
								:class="{
									'my-message': msg.user.u_id == client.u_id,
									'other-message': msg.user.u_id != client.u_id,
								}"
							>
								{{ msg.text }}
							</div>
						</li>
					</ul>
				</div>
				<div class="chat-message">
					<input type="text" v-model="message" v-on:keyup.enter="send" />
					<button @click="send">Send</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "App",
	data() {
		return {
			//Initial Settings
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
			client: {
				name: "",
				u_id: 0,
			},
			users: {},
			ordered_users: [],
			messages: [],
			message: "",
			local_id: {
				u_id: 0,
				m_id: 0,
			},
		};
	},
	methods: {
		connect(client) {
			//Validate input
			client.name = client.name.trim();
			client.name = client.name.match(/[a-zA-Z0-9]+/)[0] || "";
			let addrs = "ws://" + this.address + "?id=";
			//Set allSet to true if all is ok
			if (
				client.name.length > 0 &&
				client.name.length < 11 &&
				addrs.length > 0
			) {
				this.allSet = true;
				addrs += client.name;
			} else {
				this.allSet = false;
				this.errObj.conn_err = true;
				this.errObj.showError = true;
				this.errObj.error = "Invalid Name or Address";
			}
			//Connect to the server
			if (this.allSet) {
				this.client = client;
				try {
					this.ws = new WebSocket(addrs);
				} catch (error) {
					this.errObj.error = error.data;
					this.errObj.conn_err = true;
					this.errObj.showError = true;
					console.error(this.errObj.error);
				}
				this.ws.onopen = this.onOpen;
				this.ws.onmessage = this.onMessage;
				this.ws.onclose = this.onClose;
				this.ws.onerror = this.onError;
			} else {
				alert("Please set a valid nickname and address");
			}
		},
		//Disconnect from server
		disconnect() {
			console.log("Disconnecting...");
			this.ws.close();
		},
		//Websocket callbacks
		send() {
			if (!this.connected) {
				alert("Please connect to a server first");
				return;
			}
			let res = {
				type: "",
				text: this.message,
				user: this.client,
			};
			if (this.message.startsWith("/")) res.type = "command";
			else {
				res.type = "message";
			}
			this.ws.send(JSON.stringify(res));
			this.message = "";
		},
		onMessage(raw) {
			if (!raw.data) {
				console.log(raw);
				return;
			}
			let msg = JSON.parse(raw.data);
			console.warn("[ MESSAGE ]", msg);
			switch (msg.type) {
				case "message": {
					this.messages.push(msg);
					break;
				}
				case "login": {
					this.client = msg.user;
					break;
				}
				case "users": {
					this.users = msg.data;
					break;
				}
				case "update": {
					this.users[msg.user.u_id] = msg.user;
					break;
				}
				case "error": {
					this.errObj.showError = true;
					this.errObj.error = msg.text;
					break;
				}
				case "history": {
					this.messages = msg.data;
					break;
				}
				default: {
					console.warn("USERS LIST", this.users);
					console.warn("Unknown message type :", msg.type);
					break;
				}
			}
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
	},
	watch: {
		//Scroll to bottom when new message is added
		messages: {
			handler() {
				const container = this.$refs.chat_cont;
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
		//Update ordered_users when users is updated
		users: {
			handler() {
				this.ordered_users = Object.values(this.users);
				this.ordered_users.sort((a, b) => {
					//sort user putting first the cliend, then the server with id 0, peope online and offline at the end
					if (a.u_id == this.client.u_id) return -1;
					else if (b.u_id == this.client.u_id) return 1;
					else if (a.u_id == 0) return -1;
					else if (b.u_id == 0) return 1;
					else if (a.online && !b.online) return -1;
					else if (!a.online && b.online) return 1;
					else return 0;
				});
			},
			deep: true,
		},
	},
};
</script>

<style>
@import "../templ/comp_style.css";
</style>
