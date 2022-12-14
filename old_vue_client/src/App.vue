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
						:key="usr.id"
						:class="{ current: usr.id == chat_id }"
						@click="chat_id = usr.id"
					>
						<img :src="usr.icon" alt="avatar" />
						<div style="width: 100%">
							<div class="name">{{ usr.name }}</div>
							<div class="status">
								<div
									class="passing_by"
									v-if="
										usr.id != client.id || (usr.id == client.id && !edit_status)
									"
									:class="{
										online: usr.online,
										offline: !usr.online,
										me: usr.id == client.id,
									}"
								>
									{{ usr.state }}
								</div>
								<input
									v-else
									type="text"
									class="me"
									v-model="client.state"
									v-on:keyup.enter="updateStatus()"
								/>
							</div>
						</div>
						<div
							v-if="usr.id == client.id"
							class="edit_status"
							@click="edit_status = !edit_status"
						>
							👁‍🗨
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
						<button @click="connect()">Connect</button>
					</div>
					<!-- Set an input field for the username and icon image url and a disconnect button -->
					<div v-if="connected && chat_id == server.id" class="connection_set">
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
						<li v-for="msg in messages[chat_id]" :key="msg.id">
							<div
								class="message-data"
								:class="{ 'align-right': msg.user.id == client.id }"
							>
								{{ msg.time }}
							</div>
							<div
								class="message"
								:class="{
									'my-message': msg.user.id == client.id,
									'other-message': msg.user.id != client.id,
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
			address: "localhost:8008/socket",
			url: "http://",
			//Status
			connected: false,
			edit_status: false,
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
				id: -1,
				icon: "",
				state: "",
				online: false,
			},
			server: {
				name: "Not Connected Yet!",
				id: -1,
			},
			users: [],
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
		connect() {
			let mom = this.client;
			//Validate input
			if (!this.validateName(mom)) return;
			let addrs = "ws://" + this.address + "?id=";
			addrs += mom.name;
			//Connect to the server
			this.client = mom;
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
				id: -1,
			};
			this.server = {
				name: "Not Connected Yet!",
				id: -1,
			};
			this.users = [];
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
			if (dest == this.server.id) {
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
			switch (msg.type) {
				case "message": {
					this.messages[this.server.id].push(msg);
					break;
				}
				case "pm": {
					let dest = -1;
					if (msg.user.id == this.client.id) {
						dest = msg.dest.id;
					} else {
						dest = msg.user.id;
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
					this.messages[this.server.id] = msg.messages;
					this.chat_id = this.server.id;
					this.obj_send({ type: "update", user: this.client });
					break;
				}
				case "update": {
					this.users[msg.user.id] = msg.user;
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
				if (a.id == this.client.id) return -1;
				else if (b.id == this.client.id) return 1;
				else if (a.id == 0) return -1;
				else if (b.id == 0) return 1;
				else if (a.online && !b.online) return -1;
				else if (!a.online && b.online) return 1;
				else return 0;
			});
		},
		// search for a user
		search() {
			this.resortUsers();
			this.search_query = this.search_query.trim().toLowerCase();
			if (!this.search_query || this.search_query.lenght < 1) {
				this.resortUsers();
				console.warn("[ PERSONAL ] Empty search query");
			}
			this.ordered_users = this.ordered_users.filter((user) => {
				let res = user.name.toLowerCase();
				return res.includes(this.search_query);
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
		// update state
		updateStatus() {
			this.edit_status = false;
			this.client.state.trim();
			if (!this.client.state || this.client.state.length < 1) {
				this.errObj.error = "Put a valit state";
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
			console.error("UPDATE state", this.client.state);
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
@import "../src/assets/style.css";
</style>
