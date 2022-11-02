let users = [];

function addUser(user) {
	users.push(user);
}

function delUser(user) {
	users = users.filter((e) => e != user);
}

function getUsers() {
	return users;
}

function getUserById(id) {
	return users.find((e) => e.id == id);
}

function setOnlineUser(user, online) {
	users[user.id].online = online;
}

module.exports = {
	addUser,
	delUser,
	getUsers,
	getUserById,
	setOnlineUser,
};
