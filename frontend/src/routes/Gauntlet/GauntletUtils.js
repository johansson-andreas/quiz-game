import axios from 'axios';
import { randomProperty } from '../../GeneralUtils';
import { randomizeArrayIndex } from '../../GeneralUtils';


export const getNewQuestion = async (playerData, unusedQuestions) => {

  const updatedPlayerData = {...playerData}
  const newUnusedQuestions = {...unusedQuestions}

  if (Object.keys(updatedPlayerData.currentQuestions.categories).length > 0) {
    const randomCat = randomProperty(updatedPlayerData.currentQuestions.categories);
    const randomDiff = randomProperty(updatedPlayerData.currentQuestions.difficulties);

    updatedPlayerData.currentQuestions.categories[randomCat]--;
    updatedPlayerData.currentQuestions.difficulties[randomDiff]--;

    if (updatedPlayerData.currentQuestions.categories[randomCat] <= 0) {
      delete updatedPlayerData.currentQuestions.categories[randomCat];
    }
    if (updatedPlayerData.currentQuestions.difficulties[randomDiff] <= 0) {
      delete updatedPlayerData.currentQuestions.difficulties[randomDiff];
    }
    const questionID = newUnusedQuestions[randomCat][randomDiff].splice(randomizeArrayIndex(newUnusedQuestions[randomCat][randomDiff]), 1)[0];

    try {
      const randomQuestion = await axios.get(`/api/gauntlet-routes/question/${questionID}`);
      return ({updatedPlayerData, randomQuestion: randomQuestion.data})

    } catch (error) { 
      return error;
    }
  } else {
    return false;
  }
};
