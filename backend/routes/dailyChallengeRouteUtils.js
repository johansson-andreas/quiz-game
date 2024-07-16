import { DailyChallengeQuestions } from "../models/DailyChallengeQuestions.js";
import { Question } from "../models/Question.js";

export const generateNewQuestions = async () => {
    const possibleQuestions = await Question.distinct('_id').lean().exec();
    let questionIds = [...possibleQuestions];
    
    const randomIndex = Math.floor(Math.random() * possibleQuestions.length);
    for(let i = 0; i < 10; i++){
      questionIds.push(possibleQuestions.splice(randomIndex, 1)[0]); 
    }

    const newDailyChallengeQuestions = new DailyChallengeQuestions({
        date: new Date(),
        questionIds: questionIds
      });

      newDailyChallengeQuestions.save();
      return questionIds;
}
/**
 * Get set of unique numbers from the renge between 0 and {max}
 * @param {number} max The top number of the renge 0..max (will not be included in the result)
 * @param {number} qty The amount of unique numbers from the renge Must be less or equal to {max}
 * @returns {Array<number>} List of unique random numbers from the range (0 <= random number < max)
 */
export const uniqueIndexes = (qty, max) =>{ 
  const retVal = new Set;
  while (retVal.size < qty) {
    console.log(Math.floor(Math.random() * max))
    retVal.add(Math.floor(Math.random() * max));
  }
  return Array.from(retVal);
}
export const getNewQuestion = async (req) => {
  if (req.session.dailyChallengeData.questionsRemaining.length === 0) {
    console.log(`${client.clientId} is out of daily questions.`);
    return null;
  }
  console.log(`${req.session} is requesting a new daily question: Current length: ${req.session.dailyChallengeData.questionsRemaining.length}`);
  try { 
    const newQuestion = await Question.findById(req.session.dailyChallengeData.questionsRemaining.pop()).lean();
    return newQuestion;
  } catch (error) {
    throw error;
  }
}
/**
 * Obfuscates a question for the client.
 * @param {Object} question - The question object.
 * @return {Object} The obfuscated question object.
 */
export const obfQuestion = (question) => {
  return {
    text: question.text,
    tags: question.tags,
    choices: shuffleArray([...question.incorrectAnswers, question.correctAnswer]),
  };
};

export const shuffleArray = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};