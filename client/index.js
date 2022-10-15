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

const name = sync_read({ask: 'Insert your nickname here (max 10 char)> '});
//Name validity check
if (name.length == 0 || name.length > 10){
	console.log('Insert a valid name!');
	process.exit(1);
}

const ask_url = sync_read({ask: 'Insert server ip, default(localhost): '}) || 'localhost';
const ask_port = sync_read({ask: 'Insert conn port, default(8008): '}) || '8008';

const prompt_text = name + '>';
const url = `ws://${ask_url}:${ask_port}?id=${name}`;
const client = new WebSocket(url);

rl.setPrompt(prompt_text);

//Web socket handlers
client.on('open', () => {
	console.log('--Write !exit" to quit, !help for a list of commands--');
});

client.on('error', (e) => {
	console.log('WebSocket error:', e);
	process.exit();
});

client.on('message', (obj) => {
	rl.setPrompt('');
	rl.prompt();
	console.log(JSON.parse(obj).msg);
	rl.setPrompt(prompt_text);
	rl.prompt();
});

client.on('close', () => {
	rl.setPrompt('');
	rl.prompt();
	console.log('Closed conn.');
	rl.close();
	process.exit();
});

//Terminal input control
rl.on('line', (line) => {
	rl.setPrompt(prompt_text);
	rl.prompt();
	line = line.trim().toString();
	//Check if is a Client Side Command
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
				console.log('##Use !exit to close client',
				'\n##To send private messages syntax is: /pm <username> <your message>',
				'\n##To know connected clients use /users');
				break;
			}
			default: {
				console.log('Wrong Command, Use !help for info');
			}
		}
		rl.setPrompt(prompt_text);
		rl.prompt();
	}
	else if (line.length > 0){
		client.send(JSON.stringify({
			type: 'msg',
			msg: line,
		}));
	}
});

rl.on('close', () => {
	client.close();
	process.exit();
});
