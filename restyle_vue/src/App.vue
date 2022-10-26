<template>
	<div class="container">
		<div class="wrapper-chat">
			<div class="people-list">
				<div class="search">
					<input
						type="text"
						placeholder="search"
						v-model="search_query"
						v-on:keyup.enter="search"
					/>
				</div>
				<!-- Connected usr List with custom pins-->
				<ul v-if="connected" class="list">
					<li
						v-for="usr of ordered_users"
						:key="usr.u_id"
						:class="{ current: usr.u_id == chat_id }"
						@click="chat_id = usr.u_id"
					>
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
						<div class="chat-with">
							{{
								connected && users[chat_id]
									? users[chat_id].name
									: "CONNECT FIRST"
							}}
						</div>
						<div v-if="connected" class="chat-num-messages">
							already {{ messages[chat_id].length }} messages
						</div>
						<!--<i class="fa-star"></i>-->
					</div>
					<!-- Set an input field for the username and a connect button -->
					<div v-if="!connected" class="connection_set">
						<input type="text" placeholder="username" v-model="client.name" />
						<input type="text" placeholder="address:port" v-model="address" />
						<button @click="connect(client)">Connect</button>
					</div>
					<!-- Set an input field for the username and icon image url and a disconnect button -->
					<div
						v-if="connected && chat_id == server.u_id"
						class="connection_set"
					>
						<input
							type="text"
							placeholder="username"
							v-model="client.name"
							@keyup.enter="updateName"
						/><input
							type="text"
							placeholder="icon url"
							v-model="client.icon"
							@keyup.enter="updateIcon"
						/>
						<button class="disconnect" @click="disconnect()">Disconnect</button>
					</div>
				</div>
				<div class="chat-history" ref="chat_cont">
					<ul v-if="connected">
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
	<div v-if="errObj.showError" class="alert">
		<span class="closebtn" @click="errObj.showError = false">&times;</span>
		<strong>Error:</strong> {{ errObj.error }}
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
			connected: false,
			search_query: "",
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
				icon: "",
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
		obj_send(msg, c = 0) {
			c += 1;
			if (this.ws.readyState == this.ws.OPEN) {
				this.ws.send(JSON.stringify(msg));
			} else if (this.ws.readyState == this.ws.CLOSED) {
				this.errObj.error = "Connection closed, max retries reached!";
				this.errObj.showError = true;
			}
			// Retry if not open, after 3 tries close connection
			else if (c < 3) {
				console.warn("Retry n:", c);
				setTimeout(() => {
					this.obj_send(this.ws, msg, c);
				}, 1000);
			}
		},
		connect(client) {
			//Validate input
			if (!this.validateName(client)) return;
			let addrs = "ws://" + this.address + "?id=";
			addrs += client.name;
			//Connect to the server
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
		},
		//Disconnect from server
		disconnect() {
			if (this.connected) {
				console.log("[ PERSONAL ] Disconnecting from server");
				this.ws.close();
			} else console.log("[ PERSONAL ] Already not connected");
			this.connected = false;
			this.client = {
				name: "",
				u_id: -1,
			};
			this.server = {
				name: "Not Connected Yet!",
				u_id: -1,
			};
			this.users = {};
			this.ordered_users = [];
			this.messages = {
				"-1": [],
			};
			this.message = "";
			this.chat_id = -1;
		},
		//Websocket callbacks
		send(dest) {
			let res = {
				type: "",
				text: "",
				data: {},
				user: this.client,
				dest: {},
			};
			if (!this.connected) {
				this.errObj.error = "Not connected to server!";
				this.errObj.showError = true;
				return;
			}
			res = {
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
			this.obj_send(res);
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
			this.errObj.showError = true;
		},
		resortUsers() {
			if (!this.users || this.users.length == 0) return;
			this.ordered_users = Object.values(this.users);
			this.ordered_users.sort((a, b) => {
				// sort user putting first the cliend, then the server with id 0, peope online and offline at the end
				if (a.u_id == this.client.u_id) return -1;
				else if (b.u_id == this.client.u_id) return 1;
				else if (a.u_id == 0) return -1;
				else if (b.u_id == 0) return 1;
				else if (a.online && !b.online) return -1;
				else if (!a.online && b.online) return 1;
				else return 0;
			});
		},
		// search for a user
		search() {
			this.resortUsers();
			this.search_query.trim().toLowerCase();
			if (!this.search_query || this.search_query.lenght < 1) {
				this.resortUsers();
				console.warn("[ PERSONAL ] Empty search query");
			}
			this.ordered_users = this.ordered_users.filter((user) => {
				return user.name.includes(this.search_query);
			});
			this.search_query = "";
		},
		// update icon
		updateIcon() {
			this.client.icon.trim();
			if (!this.client.icon || this.client.icon.length < 1) {
				this.errObj.error = "Put a valit icon url";
				this.errObj.showError = true;
				return;
			}
			this.obj_send({
				type: "update",
				user: this.client,
				text: "",
				data: {},
				dest: {},
			});
		},
		// update name
		updateName() {
			this.client.name.trim();
			if (!this.validateName(this.client)) return;
			this.obj_send({
				type: "update",
				user: this.client,
				text: "",
				data: {},
				dest: {},
			});
		},
		validateName(client) {
			let name = client.name;
			name = name.trim();
			name = name.match(/[a-zA-Z0-9]+/);
			if (name == null) {
				this.errObj.error = "Invalid username characters!";
				this.errObj.showError = true;
				return false;
			}
			name = name[0];
			if (name.length < 2 || name.length > 10) {
				this.errObj.showError = true;
				this.errObj.error = "Invalid Nickname (2-10 chars)";
				return false;
			}
			client.name = name;
			return true;
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
		// format and use ordered_users when users is updated
		users: {
			handler() {
				this.resortUsers();
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
