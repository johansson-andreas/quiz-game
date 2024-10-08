import { Account } from "../models/Account.js";
import { Question } from "../models/Question.js";
import { DailyScore } from "../models/DailyScore.js";
import redis from '../redisClient.js';


export const generateNewQuestions = async () => {
  const possibleQuestions = await Question.distinct('_id').lean().exec();
  let questionIds = [...possibleQuestions];

  const randomIndex = Math.floor(Math.random() * possibleQuestions.length);
  for (let i = 0; i < 10; i++) {
    questionIds.push(possibleQuestions.splice(randomIndex, 1)[0]);
  }

  const newDailyChallengeQuestions = new DailyChallengeQuestions({
    date: new Date().toISOString().split('T')[0],
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
export const uniqueIndexes = (qty, max) => {
  const retVal = new Set;
  while (retVal.size < qty) {
    retVal.add(Math.floor(Math.random() * max));
  }
  return Array.from(retVal);
}

export const getNewQuestion = async (req) => {
  if (req.session.dailyChallengeData.questionsRemaining.length === 0) {
    console.log(`${req.user.username} is out of daily questions.`);
    return {
      statusCode: 200,
      data: { status: "out of questions", message: `${req.user.username} is out of daily questions.` }
    };
  }
  
  const nextQuestionId = req.session.dailyChallengeData.questionsRemaining.pop();
  console.log(nextQuestionId)
  try {
    const questionData = await redis.get(nextQuestionId);
    console.log('questiondata', questionData)
    if (!questionData) {
      throw new Error('Question data not found in cache');
    }
    
    req.session.dailyChallengeData.currentQuestion = JSON.parse(questionData);
    
    return {
      statusCode: 200,
      data: { status: "ok", question: obfOoTQuestion(req.session.dailyChallengeData.currentQuestion) }
    };
  } catch (error) {
    console.error('Error in getNewQuestion:', error);
    return {
      statusCode: 500,
      data: { status: "error", message: error.message }
    };
  }
};
/**
 * Obfuscates a question for the client.
 * @param {Object} question - The question object.
 * @return {Object} The obfuscated question object.
 */
export const obfOoTQuestion = (question) => {
  console.log('obfootquestion', question)
  try {
    const obfQuestion = {
      text: question.text,
      tags: question.tags,
      choices: shuffleArray([...question.incorrectAnswers, question.correctAnswer]),
      questionType: question.questionType,
    }
    return obfQuestion
  }
  catch (TypeError) {
    console.log('already obfuscated', TypeError)
    return question;
  }

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

export const updateDatabaseDailyChallengeScore = async (req) => {
  try {

    await DailyScore.updateOne(
      { userId: req.user._id, date: new Date().toISOString().split('T')[0] },
      {
        userId: req.user._id,
        date: new Date().toISOString().split('T')[0],
        score: req.session.dailyChallengeData.todaysScore,
        questionsRemaining: req.session.dailyChallengeData.questionsRemaining,
        currentQuestion: req.session.dailyChallengeData.currentQuestion,
        submittedAnswers: req.session.dailyChallengeData.submittedAnswers
      },
      { upsert: true }
    );
  }
  catch (error)
  {
    console.log(error);
  }
}