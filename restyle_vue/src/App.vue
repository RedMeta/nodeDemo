<template>
	<div class="container">
		<div class="wrapper-chat">
			<div class="people-list">
				<div class="search">
					<input type="text" placeholder="search" />
				</div>
				<!-- Connected User List with custom pins-->
				<ul class="list">
					<li v-for="user in users" :key="user.u_id">
						<img :src="user.img" alt="avatar" />
						<div>
							<div class="name">{{ user.nick }}</div>
							<div class="status">
								<i :class="{ me: user.u_id == 0, online: user.u_id != 0 }">{{
									user.u_id
								}}</i>
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
				</div>
				<div class="chat-history">
					<ul>
						<!-- Display all messages with scroll list -->
						<li v-for="msg in messages" :key="msg.m_id">
							<div
								class="message-data"
								:class="{ 'align-right': msg.nick == nick }"
							>
								{{ msg.nick == nick ? "Me" : msg.nick }}
							</div>
							<div
								class="message"
								:class="{
									'my-message': msg.nick == nick,
									'other-message': msg.nick != nick,
								}"
							>
								{{ msg.msg }}
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
			users: [],
			messages: [],
			message: "",
			local_id: {
				u_id: 0,
				m_id: 0,
			},
		};
	},
	created() {
		this.nick = prompt("Insert a nickname for you.") || "Guest";
		this.users.push({
			u_id: this.local_id.u_id++,
			nick: this.nick,
			img: "https://cdn-icons-png.flaticon.com/512/2202/2202110.png",
		});
	},
	mounted() {
		this.connect();
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
				this.ws.send(
					JSON.stringify({
						type: "msg",
						msg: this.message,
					})
				);
				this.message = "";
			}
		},
		onMessage(m) {
			let response = JSON.parse(m.data);
			response.m_id = this.local_id.m_id++;
			this.messages.push(response);
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
@import "../templ/comp_style.css";
</style>
