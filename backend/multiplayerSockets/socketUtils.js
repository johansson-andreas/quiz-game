
import { randomizeArrayIndex } from "../utils/generalUtils.js";
import { Question, getRandomQuestionByTag } from "../models/Question.js";

const delayCompensation = 1.4; // in seconds (1 sec for animation + 0.4 sec for connection delay)

export const getCategoryChoices = (lobbyInfo) => {
  const categoryChoices = []


  if (lobbyInfo.categoriesRemaining.length < 3) {
    lobbyInfo.categoriesRemaining = [...lobbyInfo.cachedCategories];
  }
  for(let i = 0; i < 3; i++)
    {
      categoryChoices.push(lobbyInfo.categoriesRemaining.splice(randomizeArrayIndex(lobbyInfo.categoriesRemaining), 1)[0])
    }
  return categoryChoices;
}

export const checkTimer = (timer) => {
  return Date.now() < timer;
};

export  const checkWinCon = (lobbyInfo) => {
  if(!lobbyInfo) return;
  const chosenWinCon = lobbyInfo.chosenWinCon;
  const winConNumber = lobbyInfo.winConNumber;
  const usersData = lobbyInfo.users;
  let winners = [];
  console.log(usersData);
  if (chosenWinCon === "correctCon") {
    winners = Object.keys(usersData).filter((userData) => {
      return usersData[userData].score >= winConNumber;
    });
  } else if (chosenWinCon === "amountCon") {
    let highestScore = -1;
    if(lobbyInfo.questionAmount >= winConNumber)
      Object.keys(usersData).forEach(userData => {
        const userScore = usersData[userData].score;
  
        if (userScore > highestScore) {
          highestScore = userScore;
          winners = [userData];
        } else if (userScore === highestScore) {
          winners.push(userData);
        }
      });
  }
  return winners;
};

export const generateLobbyName = (currentRooms) => {
  const possibleChars = [
    ...[...Array(26)].map((_, i) => String.fromCharCode("A".charCodeAt(0) + i)),
    ...[...Array(9)].map((_, i) => (i + 1).toString()),
  ];
  let newLobbyName = "";
  while (!newLobbyName) {
    for (let i = 0; i <= 4; i++) {
      const randomIndex = Math.floor(Math.random() * possibleChars.length);
      newLobbyName = newLobbyName + possibleChars[randomIndex];
    }
    if (!currentRooms[newLobbyName]) return newLobbyName;
    else newLobbyName = "";
  }
};

export const getNewQuestion = async (questionQueue) => {
  const randomIndex = Math.floor(Math.random() * questionQueue.length);
  const [newQuestionId] = questionQueue.splice(randomIndex, 1); // Splices a question at randomIndex to randomize the order of the questions provided

  try {
    const newQuestion = await Question.findById(newQuestionId).lean();
    return newQuestion;
  } catch (error) {
    console.error(`Failed to fetch question by ID ${newQuestionId}:`, error);
  }
};


export const getNextQuestion = async ({lobbyInfo, chosenCategory}) => {
  const currentLobby = {...lobbyInfo};
  currentLobby.currentQuestion = await getRandomQuestionByTag(chosenCategory);
  currentLobby.questionAmount++;

  currentLobby.timer = new Date(
    Date.now() + (currentLobby.questionTimer + delayCompensation) * 1000
  );

  console.log('timeout timer', currentLobby.timer)
  return currentLobby;
};

export const getRandomChooser = (lobbyInfo) => {
  let newChooser = "";
  const oldChooser = lobbyInfo.currentChooser.currentChooser;

  const userKeys = Object.keys(lobbyInfo.users);  // Create the array of keys once
  const maxAttempts = 4;

  for (let i = 0; i < maxAttempts; i++) { 
    newChooser = userKeys[randomizeArrayIndex(userKeys)];

    if (newChooser !== oldChooser) {
      return newChooser;
    }
  }
  
  return newChooser; // If all attempts fail, return the old chooser
};

