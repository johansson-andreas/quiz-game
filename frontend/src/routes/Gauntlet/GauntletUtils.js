import axios from 'axios';


export const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };

export const randomProperty = (obj) => {
    const keys = Object.keys(obj);
    return keys[keys.length * Math.random() << 0];
};

export const randomizeArrayIndex = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return randomIndex;
}



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
