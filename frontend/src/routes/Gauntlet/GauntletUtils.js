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


export const getNewQuestion = async (playerData) => {

  const updatedPlayerData = {...playerData}

  if (Object.keys(updatedPlayerData.currentQuestions).length > 0) {
    const randomCat = randomProperty(updatedPlayerData.currentQuestions);
    console.log('random cat chosen:', randomCat)

    updatedPlayerData.currentQuestions[randomCat]--;

    if (updatedPlayerData.currentQuestions[randomCat] <= 0) delete updatedPlayerData.currentQuestions[randomCat];

    try {
      const randomQuestion = await axios.get(`/api/gauntlet-routes/question/connect/${randomCat}`);
      return ({updatedPlayerData, randomQuestion: randomQuestion.data})

    } catch (error) { 
      return error;
    }
  } else {
    return false;
  }
};
