import User from "../models/User";

const users: User[] = [];

export function addUser(user: User) {
	users.push(user);
}

export function delUser(user: User) {
	const userIndex = users.indexOf(user);
	if (userIndex == -1) return;
	users.splice(userIndex, 1);
}

export function getUsers() {
	return users;
}

export function getUserById(id: number) {
	return users.find((e) => e.id == id);
}

export function setOnlineUser(user: User, online: boolean) {
	const index = users.indexOf(user);
	if (index == -1) return;
	users[index].online = online;
}
