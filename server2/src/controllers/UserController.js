let lastUserId = 0;

function getRandomIconUrl() {
	const icon_id = Math.floor(Math.random() * 9);
	return `https://cdn-icons-png.flaticon.com/512/2202/220206${icon_id}.png`;
}

function createUser({socket, name, icon, state, online}) {
	const user = {
		id: lastUserId++,
		name: name || "NoName",
		icon: icon || getRandomIconUrl(),
		state: state || "Write something funny here 🤟",
		online: online || false,
		socket,
		toJSON() {
			let { socket, ...ret } = { ...this };
			return ret;
		},
	};

	return user;
}

module.exports = {
	createUser,
};
