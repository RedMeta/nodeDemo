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

const name = sync_read({ask: 'Insert your nickname here!'});
if (name.length == 0){
	console.log('Restart with a valid name!!');
	process.exit(1);
}

const url = 'ws://localhost:8080?id=' + name;
const client = new WebSocket(url)

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
	console.log('SERVER SAID ===>	' + mess)
});

client.on('close', () => {
	console.log("Server closed conn.");
	process.exit();
});


//Terminal input control
rl.setPrompt('>');
rl.on('line', (line) => {
	line = line.trim().toString();
	console.log(line);
	if ( line.length > 0 && client.readyState == client.OPEN && line != "exit"){
		client.send(line);
	}
	else if (line == 'exit')
		rl.close();
	//if (client.readyState == client.OPEN)
})

rl.on('close', () => {
	console.log('\nBye Bye!!');
	process.exit();
});

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
