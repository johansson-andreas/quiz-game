export const createNewLobby = (socket, rooms) => {
  const username = socket.request.session.passport.user;

  socket.on("createNewLobby", (newLobbyInfo) => {
    const newLobby = {
      lobbyName: newLobbyInfo.lobbyName,
      chosenWinCon: newLobbyInfo.chosenWinCon,
      winConNumber: newLobbyInfo.winConNumber,
      password: newLobbyInfo.password,
      questionTimer: newLobbyInfo.questionTimer,
      users: [
        {
          username: "",
          score: 0,
        },
      ],
      currentQuestion: {},
    };
    if (!rooms[newLobby.lobbyName]) {
      rooms[newLobby.lobbyName] = newLobby;
    }
    console.log("Creating new room", newLobby);
    console.log("listOfCurrentRooms", Object.keys(rooms));
    socket.emit("created-new-lobby", { newLobby });
  });
  socket.on("joinLobby", (joinLobbyInfo) => {
    const lobbyName = joinLobbyInfo.lobbyName;
    const password = joinLobbyInfo.joinLobbyPassword;

    if(rooms[lobbyName] && (rooms[lobbyName].password && rooms[lobbyName].password == password))
        {
            if(rooms[lobbyName].users[username])
                {
                    socket.join(lobbyName);
                    console.log('managed to join', lobbyName, 'with password', password)

                }
                else{
                    rooms[lobbyName].users[username] = ({username:username, score: 0})
                    socket.join(lobbyName);
                    console.log('managed to join', lobbyName, 'with password', password)

                }

        }

  });
};
