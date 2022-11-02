<template>
	<!-- Connected user List with custom pins-->
	<li
		:key="user.u_id"
		:class="{ current: user.u_id == chat_id }"
		@click="chat_id = user.u_id"
	>
		<img :src="user.icon" alt="avatar" />
		<div style="width: 100%">
			<div class="name">{{ user.name }}</div>
			<div class="status">
				<div
					class="passing_by"
					v-if="
						user.u_id != client.u_id ||
						(user.u_id == client.u_id && !edit_status)
					"
					:class="{
						online: user.online,
						offline: !user.online,
						me: user.u_id == client.u_id,
					}"
				>
					{{ user.stat }}
				</div>
				<input
					v-else
					type="text"
					class="me"
					v-model="client.stat"
					v-on:keyup.enter="updateStatus()"
				/>
			</div>
		</div>
		<div
			v-if="user.u_id == client.u_id"
			class="edit_status"
			@click="edit_status = !edit_status"
		>
			👁‍🗨
		</div>
	</li>
</template>

<script></script>

<style></style>
