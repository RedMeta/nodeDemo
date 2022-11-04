import User from "../models/User";

import * as UserService from "../services/UserService";

let lastUserId = 0;


function getRandomIconUrl() {
	const icon_id = Math.floor(Math.random() * 9);
	return `https://cdn-icons-png.flaticon.com/512/2202/220206${icon_id}.png`;
}

export function createUser(socket: any) {
	const id = lastUserId++;
	const icon = getRandomIconUrl();
	const user = User.create({ id, icon, socket });
	UserService.addUser(user);
    return user;
}
