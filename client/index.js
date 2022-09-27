const WebSocket = require('ws')

const url = 'ws://localhost:8080'
const connection = new WebSocket(url)

connection.onopen = () => {
  // Questa funzione viene chiamata alla connessione e non al messaggio
  connection.send('New Client connected');
}
connection.onerror = (error) => {
  // Se usi l'interpolazione su un Object
  // ti viene stampato [object Object]
  // passa invece l'Object come nuovo argomento
  console.log(`WebSocket error:`, error);
}

// Qui puoi destrutturare data
connection.onmessage = ({ data }) => {
  // Non usare il + in console.log
  // passa argomenti diversi per le cose da concatenare
  console.log('Received mess:', data);
}
connection.onclose = () => {
  console.log("closed conn");
}
