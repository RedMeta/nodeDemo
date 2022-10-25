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
						<img
							:src="usr.icon"
							alt="avatar"
							@click="
								() => {
									chat_id = usr.u_id;
								}
							"
						/>
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
						<div class="chat-with">
							{{ (users ?? users[chat_id].name, "CONNECT FIRST") }}
						</div>
						<div class="chat-num-messages">
							already {{ messages[chat_id].length }} messages
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
						<li v-for="msg in messages[chat_id]" :key="msg.m_id">
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
					<input
						type="text"
						v-model="message"
						v-on:keyup.enter="send(chat_id)"
					/>
					<button @click="send(chat_id)">Send</button>
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
				u_id: -1,
			},
			server: {
				name: "Not Connected Yet!",
				u_id: -1,
			},
			users: {},
			ordered_users: [],
			messages: {
				"-1": [],
			},
			message: "",
			chat_id: -1,
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
					console.warn(
						"[ PERSONAL ] While connecting caught error :",
						this.errObj.error
					);
				}
				this.ws.onopen = this.onOpen;
				this.ws.onmessage = this.onMessage;
				this.ws.onclose = this.onClose;
				this.ws.onerror = this.onError;
				this.connected = true;
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
		send(dest) {
			if (!this.connected) {
				alert("Please connect to a server first");
				return;
			}
			let res = {
				type: "",
				text: this.message,
				user: this.client,
			};
			this.message = "";
			if (dest == this.server.u_id) {
				res.type = "message";
			} else {
				res.type = "pm";
				res.dest = this.users[dest];
			}
			this.ws.send(JSON.stringify(res));
			console.warn("[ PERSONAL ] Sent message : ", res);
		},
		onMessage(raw) {
			if (!raw.data) {
				console.log(raw);
				return;
			}
			let msg = JSON.parse(raw.data);
			console.warn("[ MESSAGE ]", msg);
			console.error(this.messages);
			switch (msg.type) {
				case "message": {
					this.messages[this.server.u_id].push(msg);
					break;
				}
				case "pm": {
					let dest = -1;
					if (msg.user.u_id == this.client.u_id) {
						dest = msg.dest.u_id;
					} else {
						dest = msg.user.u_id;
					}
					if (!this.messages[dest]) {
						this.messages[dest] = [];
					}
					this.messages[dest].push(msg);
					break;
				}
				case "login": {
					this.client = msg.user;
					this.users = msg.users;
					this.server = this.users[0];
					this.messages[this.server.u_id] = msg.data;
					this.chat_id = this.server.u_id;
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
		// Update ordered_users when users is updated
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
		// If chat_id is changed and there are no messages for that chat, create an empty array
		chat_id: {
			handler() {
				if (!this.messages[this.chat_id]) {
					this.messages[this.chat_id] = [];
				}
			},
		},
	},
};
</script>

<style>
@import "../templ/comp_style.css";
</style>
