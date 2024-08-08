import { getNewQuestionQueue } from "../routes/questionRouteUtils.js";
import { Question } from "../models/Question.js";
import { obfQuestion } from "../routes/questionRouteUtils.js";

export const createNewLobby = (socket, rooms, io) => {
  const username = socket.request.session.passport.user; 

  // Event handler to create a new lobby
  socket.on("createNewLobby", async (newLobbyInfo) => {
    const lobbyName = newLobbyInfo.lobbyName || generateLobbyName(rooms);

    if (!rooms[lobbyName]) {
      const newLobby = {
        lobbyName: lobbyName,
        chosenWinCon: newLobbyInfo.chosenWinCon,
        winConNumber: newLobbyInfo.winConNumber,
        password: newLobbyInfo.password,
        questionTimer: newLobbyInfo.questionTimer,
        users: {}, // Initialize users as an object
        currentQuestion: {},
        questionQueue: [],
        active: false,
        host: username,
      };

      newLobby.questionQueue = await getNewQuestionQueue();

      const randomIndex = Math.floor(
        Math.random() * newLobby.questionQueue.length
      );
      const [newQuestionId] = newLobby.questionQueue.splice(randomIndex, 1); // Splices a question at randomIndex to randomize the order of the questions provided

      try {
        const newQuestion = await Question.findById(newQuestionId).lean();
        console.log(newQuestion);
        newLobby.currentQuestion = newQuestion;
      } catch (error) {
        console.error(
          `Failed to fetch question by ID ${newQuestionId}:`,
          error
        );
      }

      rooms[lobbyName] = newLobby;
      console.log("Creating new room", newLobby.lobbyName);
      console.log("listOfCurrentRooms", Object.keys(rooms));
      socket.emit("createdNewLobby", { newLobby });
    } else {
      socket.emit("createdNewLobby", "A lobby with that name already exists");
      console.log("Lobby already exists");
    }
  });

  socket.on("joinLobby", (joinLobbyInfo) => {
    console.log("current rooms", Object.keys(rooms));
    const lobbyName = joinLobbyInfo.lobbyName;
    const password = joinLobbyInfo.joinLobbyPassword;
    console.log(username, "is trying to join lobby", lobbyName);

    if (
      rooms[lobbyName] &&
      (rooms[lobbyName].password ? rooms[lobbyName].password == password : true)
    ) {
      if (!rooms[lobbyName].users[username]) {
        rooms[lobbyName].users[username] = { username: username, score: 0 };
      }
      socket.join(lobbyName);
      io.to(lobbyName).emit("currentUsersInRoom", rooms[lobbyName].users);
      socket.emit("lobbyJoinTry", lobbyName);
      console.log("sending", rooms[lobbyName].users, "to:", lobbyName);
      console.log("managed to join", lobbyName, "with password", password);
    } else {
      console.log(
        "Found no lobby with that name or incorrect password for that lobby"
      );
    }
  });

  socket.on("getRoomInfo", (lobbyName) => {
    socket.emit("sendRoomInfo", {
      users: rooms[lobbyName].users,
      chosenWinCon: rooms[lobbyName].chosenWinCon,
      winConNumber: rooms[lobbyName].winConNumber,
      questionTimer: rooms[lobbyName].questionTimer,
      active:rooms[lobbyName].active,
      host:rooms[lobbyName].host,
      currentQuestion: rooms[lobbyName].currentQuestion
    });
  });

  socket.on("startGame", (lobbyName) => { 
    rooms[lobbyName].active = true;
    io.to(lobbyName).emit("startingGame", {
      currentQuestion: obfQuestion(rooms[lobbyName].currentQuestion),
      active:rooms[lobbyName].active
    })

    setTimeout(startTimer, rooms[lobbyName].questionTimer * 1000);
  })
};

const startTimer = () => {
  console.log(new Date().toISOString())

};

const generateLobbyName = (currentRooms) => {
  const possibleChars = [
    ...[...Array(26)].map((_, i) => String.fromCharCode("A".charCodeAt(0) + i)),
    ...[...Array(9)].map((_, i) => (i + 1).toString()),
  ];
  let newLobbyName = "";
  while (!newLobbyName) {
    for (let i = 0; i <= 4; i++) {
      const randomIndex = Math.floor(Math.random() * possibleChars.length);
      newLobbyName = newLobbyName + possibleChars[randomIndex];
      console.log(newLobbyName);
    }
    if (!currentRooms[newLobbyName]) return newLobbyName;
    else newLobbyName = "";
  }
};
