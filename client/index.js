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

const name = sync_read({ask: 'Insert your nickname here:  '});

if (name.length == 0){
	console.log('Restart with a valid name!!');
	process.exit(1);
}


const prompt_text = `${name}>`;
const url = 'ws://localhost:8080?id=' + name;
const client = new WebSocket(url);

rl.setPrompt(prompt_text);

//Web socket Callbacks setting

client.on('open', () => {
	console.log('Connected To Server!');
	console.log('--Write "exit" to quit--');
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
		switch (line.substring(1)){
			case ('exit'): {
				console.log('\nBye Bye!!');
				client.close();
				break;
			}
			case ('help'): {
				console.log('Use !exit to close client, to send private messages syntax is: /pm <username>: "your message"');
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

//ADD LITTLE EVENT LOOP TO CONSENT CLIENT-LIKE USAGE

// if (client.readyState != client.OPEN)
// {
//	 console.log('No server!!');
//	 process.exit();
// }
// while (1)
// {
//	 let inp = readline(">");
//	 if (inp == 'exit') {
//	 client.close(200);
//	 console.log('You logged out!!');
//	 process.exit();
//	 }
//	 else if (inp.length > 1) {
//		 client.send(inp);
//	 }
// }
