type createOptions = {
	name?: string;
	icon: string;
	state?: string;
	online?: boolean;
	id: number;
	socket: any;
};

export default class User {
	constructor(
		public id: number,
		public name: string,
		public icon: string,
		public state: string,
		public online: boolean,
		public socket: any
	) {}

	static create(options: createOptions) {
		const instance = new User(
			options.id,
			options.name || "NoName",
			options.icon,
			options.state || "Write something funny here 🤟",
			options.online || true,
			options.socket
		);
		return instance;
	}

	toJSON(): Omit<User, "socket" | "toJSON"> {
		const { socket, ...ret } = { ...this };
		return ret;
	}
}
