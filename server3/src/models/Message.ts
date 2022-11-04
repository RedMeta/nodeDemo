
import * as MessageService from '../services/MessageService';

export default class Message {
	public time: string;

	constructor(
		public type: "pm" | "group",
		public text: string,
		public user_id: number,
		public dest_id: number
	) {
		this.time = new Date().toLocaleTimeString("it-IT");
		MessageService.addMessage(this);
	}

}
