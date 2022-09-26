const WebSocket = require('ws')

const url = 'ws://localhost:8080'
const connection = new WebSocket(url)

connection.onopen = () => {
  connection.send('Message from Client')
}
connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}
connection.onmessage = (data) => {
  console.log('Received mess: ' + data.data)
}
connection.onclose = () => {
  console-log("closed conn");
}
