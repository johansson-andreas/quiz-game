import { getNewQuestionQueue } from "../routes/questionRouteUtils.js";
import { obfQuestion, getAllCategories } from "../routes/questionRouteUtils.js";
import {
  getCategoryChoices,
  checkWinCon,
  checkTimer,
  getNewQuestion,
  generateLobbyName,
  getNextQuestion,
  getRandomChooser,
} from "./socketUtils.js";
import { checkAnswer } from "../routes/questionRouteUtils.js";

export const roomEvents = (socket, rooms, io) => {
  let username = "";
  if(socket.request.session.passport) username = socket.request.session.passport.user;
  else return;

  socket.on("createNewLobby", async (newLobbyInfo) => {
    console.log("test");
    const lobbyName = newLobbyInfo.lobbyName.toUpperCase() || generateLobbyName(rooms);
    const allCategories = await getAllCategories();

    if (!rooms[lobbyName]) {
      const newLobby = {
        lobbyName: lobbyName,
        chosenWinCon: newLobbyInfo.chosenWinCon,
        winConNumber: newLobbyInfo.winConNumber,
        password: newLobbyInfo.password,
        questionTimer: newLobbyInfo.questionTimer,
        users: {}, 
        currentQuestion: {},
        questionQueue: [],
        active: false,
        host: username,
        timer: 0,
        questionAmount: 0,
        currentChooser: {},
        cachedCategories: [...allCategories],  // Single shallow copy
        categoriesRemaining: allCategories,    // Original array (slightly more efficient than creating two shallow copies)
        currentCategories: [],
      };

      newLobby.questionQueue = await getNewQuestionQueue();

      newLobby.currentQuestion = await getNewQuestion(newLobby.questionQueue);

      rooms[lobbyName] = newLobby;
      console.log("Creating new room", newLobby.lobbyName);
      socket.emit("createdNewLobby", { newLobby });
    } else {
      socket.emit("createdNewLobby", "A lobby with that name already exists");
      console.log("Lobby already exists");
    }
  });


socket.on("joinLobby", (joinLobbyInfo) => {
  const lobbyName = joinLobbyInfo.lobbyName.toUpperCase();
  const password = joinLobbyInfo.joinLobbyPassword;
  console.log(username, "is trying to join lobby", lobbyName);

  if (
    rooms[lobbyName] &&
    (rooms[lobbyName].password ? rooms[lobbyName].password == password : true)
  ) {
    if (!rooms[lobbyName].users[username]) {
      rooms[lobbyName].users[username] = {
        username: username,
        score: 0,
        active: true,
      };
    }
    socket.join(lobbyName);
    io.to(lobbyName).emit("currentUsersInRoom", rooms[lobbyName].users);
    socket.emit("lobbyJoinTry", lobbyName);
    console.log("managed to join", lobbyName, "with password", password);
  } else {
    console.log(
      "Found no lobby with that name or incorrect password for that lobby"
    );
  }
});

socket.on("getRoomInfo", (lobbyName) => {
  if (rooms[lobbyName]) {
    socket.emit("sendRoomInfo", {
      users: rooms[lobbyName].users,
      chosenWinCon: rooms[lobbyName].chosenWinCon,
      winConNumber: rooms[lobbyName].winConNumber,
      questionTimer: rooms[lobbyName].questionTimer,
      active: rooms[lobbyName].active,
      host: rooms[lobbyName].host,
      currentQuestion: {},
      currentChooser: rooms[lobbyName].currentChooser,
      questionAmount: rooms[lobbyName].questionAmount
    });
  }
});

socket.on("startGame", (lobbyName) => {
  if(rooms[lobbyName]){
    rooms[lobbyName].active = true;
  rooms[lobbyName].currentChooser = {
    currentChooser: getRandomChooser((rooms[lobbyName])),
    categoryChoices: getCategoryChoices(rooms[lobbyName]),
    active: rooms[lobbyName].active,
    questionAmount: rooms[lobbyName].questionAmount
  };
  console.log('start game chooser', rooms[lobbyName].currentChooser)
  io.to(lobbyName).emit("currentChooser", rooms[lobbyName].currentChooser);
  }
});

socket.on("submitAnswer", async (lobbyInfo) => {

  const submittedAnswer = lobbyInfo.submittedAnswer;
  const lobbyName = lobbyInfo.lobbyName;

  let socketMessage = "";
 
  console.log("received", submittedAnswer, "from", username);
  if (
    rooms[lobbyName] && 
    checkTimer(rooms[lobbyName].timer)
  ) {
    const {correct, correctAnswer} = await checkAnswer(rooms[lobbyName].currentQuestion, submittedAnswer)
    if(correct) {
      rooms[lobbyName].users[username].score += 1;
      io.to(lobbyName).emit("updatedScore", {
        newUsersInfo: rooms[lobbyName].users,
      });
    }
    socketMessage = correctAnswer;

  } else if (!checkTimer(rooms[lobbyName].timer)) {
    socket.emit("timedOut");
    console.log("timed out answer");
  } 
  socket.emit("correctAnswer", socketMessage);
});

socket.on("getNextQuestion", async (lobbyName) => {
  if(!rooms[lobbyName]) return false;
  const winners = checkWinCon(rooms[lobbyName]);

  if (winners.length > 0) {
    io.to(lobbyName).emit("winnerDetermined", winners);
  }

  rooms[lobbyName].currentChooser = {
    currentChooser: getRandomChooser((rooms[lobbyName])),
    categoryChoices: getCategoryChoices(rooms[lobbyName]),
    active: rooms[lobbyName].active,
    questionAmount: rooms[lobbyName].questionAmount
  };

  io.to(lobbyName).emit("currentChooser", rooms[lobbyName].currentChooser);
});

socket.on("selectedCategory", async ({ lobbyName, category }) => {
  rooms[lobbyName] = await getNextQuestion({lobbyInfo:rooms[lobbyName], chosenCategory:category});
  io.to(lobbyName).emit("categoryChosen", {
    category,
    question: obfQuestion(rooms[lobbyName].currentQuestion),
    questionAmount: rooms[lobbyName].questionAmount
  });

});
};