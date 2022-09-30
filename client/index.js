const WebSocket = require('ws');
const sync_read = require('prompt-sync')({sigint: true});
const readline = require('readline');
const { stdin, stdout } = require('process');
const rl = readline.createInterface({
	input: stdin,
	output: stdout,
	prompt: '>',
	terminal: true
});

const name = sync_read({ask: 'Insert your nickname here> '});

//Name validity check
if (name.length == 0){
	console.log('Insert a valid name!!');
	process.exit(1);
}

let ask_url = sync_read({ask: 'Insert server ip, default(localhost): '});
let ask_port = sync_read({ask: 'Insert conn port, default(8080): '});

if (ask_url.trim().length == 0) {
	ask_url = 'localhost';
}
if (ask_port.trim().length == 0) {
	ask_port = '8080';
}

const prompt_text = `${name}>`;
const url = `ws://${ask_url}:${ask_port}?id=${name}`;
const client = new WebSocket(url);

rl.setPrompt(prompt_text);

//Web socket Callbacks setting

client.on('open', () => {
	console.log('Connected To Server!');
	console.log('--Write !exit" to quit, !help for a list of commands--');
});

client.on('error', (e) => {
	console.log(`WebSocket error: ${e}`);
	process.exit();
});

client.on('message', (mess) => {
	rl.setPrompt('');
	rl.prompt();
	console.log(mess.toString());
	rl.setPrompt(prompt_text);
	rl.prompt();
});

client.on('close', () => {
	rl.setPrompt('');
	rl.prompt();
	console.log("Closed conn.");
	rl.close();
});

//Terminal input control
rl.setPrompt(prompt_text);
rl.on('line', (line) => {
	rl.setPrompt(prompt_text);
	rl.prompt();
	line = line.trim().toString();
	if (line.startsWith('!')){
		rl.setPrompt('');
		rl.prompt();
		line = line.substring(1).replace(/ .*/,'');
		switch (line){
			case ('exit'): {
				console.log('Bye Bye!!');
				client.close();
				break;
			}
			case ('help'): {
				console.log(`Use !exit to close client` +
				`\nTo send private messages syntax is: /pm <username> <your message>` +
				`\nTo know connected clients use /users`);
				break;
			}
			default: {
				console.log('Wrong Command, Use !help for info');
			}
		}
		rl.setPrompt(prompt_text);
		rl.prompt();
	}
	else if ( line.length > 0 ){
		client.send(line);
	}
})
