<template>
	<div class="body">
		<div class="container clearfix">
			<div class="people-list">
				<div class="search">
					<input type="text" placeholder="search" />
					<i class="fa-search"></i>
				</div>
				<!-- Connected User List with custom pins-->
				<ul class="list">
					<li v-for="user in users" :key="user.u_id" class="clearfix">
						<img :src="user.img" alt="avatar" />
						<div class="about">
							<div class="name">{{ user.name }}</div>
							<div class="status">
								<i
									class="fa-circle"
									:class="{ me: user.u_id == 0, online: user.u_id != 0 }"
									>{{ user.u_id }}</i
								>
							</div>
						</div>
					</li>
				</ul>
			</div>
			<div class="chat">
				<div class="chat-header clearfix">
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
						<li v-for="msg in messages" :key="msg.m_id" class="clearfix">
							<div
								class="message-data"
								:class="{ 'align-right': msg.u_id == 0 }"
							>
								{{ msg.u_id == 0 ? "Me" : msg.nick }}
							</div>
							<div
								class="message"
								:class="{
									'my-message float-right': msg.u_id == 0,
									'other-message': msg.u_id != 0,
								}"
							>
								{{ msg.msg }}
							</div>
						</li>
					</ul>
				</div>
				<div class="chat-message clearfix">
					<input type="text" alt="Message" />
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
			nick: "Guest",
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
			users: [
				{
					nick: this.nick,
					u_id: 0,
					img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg",
				},
				{
					nick: "Stranger1",
					u_id: 1,
					img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_02.jpg",
				},
				{
					nick: "Stranger2",
					u_id: 2,
					img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03.jpg",
				},
				{
					nick: "Stranger3",
					u_id: 3,
					img: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_04.jpg",
				},
			],
			messages: [
				{
					msg: "Let's count until 4!",
					m_id: 0,
					u_id: 0,
					nick: "Guest",
					time: "10:10 AM",
				},
				{
					msg: "Ok, I start, One!",
					m_id: 1,
					u_id: 1,
					nick: "Stranger1",
					time: "10:11 AM",
				},
				{
					msg: "Zero!\nTwo!",
					m_id: 2,
					u_id: 3,
					nick: "Stranger3",
					time: "10:12 AM",
				},
				{ msg: "Three!", m_id: 3, u_id: 0, nick: "Guest", time: "10:14 AM" },
				{
					msg: "Four! d	saifasofsaoiASDIJ\ndssaddas\ndas",
					nick: "Guest",
					m_id: 4,
					u_id: 0,
					time: "10:15 AM",
				},
			],
			message: "",
			local_id: {
				u_id: 0,
				m_id: 0,
			},
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
			this.messages.push({
				id: this.id++,
				msg: JSON.parse(m.data).msg,
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
@import "../templ/comp_style.css";
</style>
