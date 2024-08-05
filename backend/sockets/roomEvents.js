export const createNewLobby = (socket, rooms) => {
    
    const username = socket.request.session.passport.user;


    socket.on('createNewLobby', (lobbyName) => {
        if (!rooms[lobbyName]) {
            rooms[lobbyName] = [];
          }
        if (!rooms[lobbyName].includes(username)) rooms[lobbyName].push(username);
        console.log('Creating new room', lobbyName)
        socket.emit('listOfCurrentRooms', Object.keys(rooms));
    })    
};