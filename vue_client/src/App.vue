<template>
	<ClientVue />
</template>

<script>
import ClientVue from "./components/client.vue";

export default {
	name: "App",
	components: {
		ClientVue,
	},
	data() {
		return {};
	},
	mounted() {},
	methods: {},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	/* text-align: center; */
	margin-top: 60px;
}
</style>
