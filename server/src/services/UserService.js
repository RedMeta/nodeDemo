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

module.exports = {
	addUser,
	delUser,
	getUsers,
};
