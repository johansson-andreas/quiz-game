

module.exports = function(socket, session) {
socket.on('receivedAnswer', (answer) => {
    console.log(`Received answer "${answer}" from controller client ${session.clientData.clientId}`);
  });
}