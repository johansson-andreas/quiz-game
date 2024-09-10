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


export const getNewQuestion = async (playerData, unusedQuestions) => {

  const updatedPlayerData = {...playerData}
  const newUnusedQuestions = {...unusedQuestions}
  console.log('updatedPlayerData', updatedPlayerData)

  if (Object.keys(updatedPlayerData.currentQuestions).length > 0) {
    const randomCat = randomProperty(updatedPlayerData.currentQuestions.categories);
    console.log('random cat chosen:', randomCat)

    updatedPlayerData.currentQuestions.categories[randomCat]--;

    if (updatedPlayerData.currentQuestions.categories[randomCat] <= 0) delete updatedPlayerData.currentQuestions.categories[randomCat];

    try {
      const randomQuestion = await axios.get(`/api/gauntlet-routes/question?type=random&tag=${randomCat}&difficulty=medium`);
      return ({updatedPlayerData, randomQuestion: randomQuestion.data})

    } catch (error) { 
      return error;
    }
  } else {
    return false;
  }
};
