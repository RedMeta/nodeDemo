const WebSocket = require('ws');
const readline = require('prompt-sync')({sigint: true});

const url = 'ws://localhost:8080'
const client = new WebSocket(url)

client.on('open', () => {
	console.log('Connected To Server!');
});

client.on('error', (e) => {
	console.log(`WebSocket error: ${e}`);
  process.exit();
});

client.on('message', (mess) => {
	console.log('SERVER SAID ===>  ' + mess)
});

client.on('close', () => {
	console.log("Server closed conn.");
	process.exit();
});

console.log('--All is printed by server--');
console.log('--Write "exit" to quit--');

// if (client.readyState != client.OPEN)
// {
// 	console.log('No server!!');
// 	process.exit();
// }
while (1)
{
  let inp = readline(">");
  if (inp == 'exit') {
	client.close(200);
	console.log('You logged out!!');
	process.exit();
  }
  else if (inp.length > 1) {
    client.send(inp);
  }
}
