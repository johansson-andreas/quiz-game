import {Question} from '../models/Question.js';

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 * @return {Array} The shuffled array.
 */
export const shuffleArray = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

/**
 * Gets a new question for the client.
 * @param {Object} client - The client object.
 * @return {Object} The new question.
 */
export const getNewQuestion = async (client) => {
  if (client.unusedQuestions.length === 0) {
    console.log(`${client.clientId} is out of questions. Creating new queue`);
    client.unusedQuestions = [...client.cachedQuestions];
  }
  console.log(`${client.clientId} is requesting a new question: Current length: ${client.unusedQuestions.length}`);

  const randomIndex = Math.floor(Math.random() * client.unusedQuestions.length);
  const [newQuestionId] = client.unusedQuestions.splice(randomIndex, 1); // Splices a question at randomIndex to randomize the order of the questions provided

  try {
    const newQuestion = await Question.findById(newQuestionId).lean();
    client.currentQuestion = newQuestion;
    return newQuestion;
  } catch (error) {
    console.error(`Failed to fetch question by ID ${newQuestionId}:`, error);
    throw error;
  }
};

/**
 * Gets a queue of new question IDs.
 * @return {Array} An array of question IDs.
 */
export const getNewQuestionQueue = async () => {
  try {
    return await Question.distinct('_id').lean().exec();
  } catch (error) {
    console.error('Failed to fetch question queue:', error);
    throw error;
  }
};

/**
 * Gets a queue of new question IDs based on the clients enabled tags.
 * @param {Array} tags - The tags to filter questions by.
 * @return {Array} An array of question IDs.
 */
export const getNewQuestionQueueByTags = async (tags) => {
  try {
    return await Question.distinct('_id', { tags: { $in: tags } }).lean();
  } catch (error) {
    console.error('Failed to fetch question queue by tags:', error);
    throw error;
  }
};

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

/**
 * Updates the client's score array based on their answer.
 * @param {Object} clientData - The client's data object.
 * @param {String} answer - The client's answer.
 */
export const updateScoreArray = (clientData, answer) => {
  const scoreArray = { ...clientData.currentScores };
  clientData.currentQuestion.tags.forEach(tag => {
    if (!scoreArray[tag]) scoreArray[tag] = [0, 0];
    if (answer === clientData.currentQuestion.correctAnswer) {
      scoreArray[tag][0] += 1;
    }
    scoreArray[tag][1] += 1;
  });
  clientData.currentScores = scoreArray;
  console.log(clientData.currentScores);
};