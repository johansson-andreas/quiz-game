import {OoTQuestion} from '../models/Question.js';
import {CategoryIcon} from '../models/CategoryIcon.js';
import { Account } from '../models/Account.js';
import { ConnectQuestion } from '../models/Question.js';
import { RankQuestion } from '../models/Question.js';
import { Question } from '../models/Question.js';



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
    const questionIds = await Question.distinct('_id', { tags: { $in: tags } }).lean();
    return questionIds;
  } catch (error) {
    console.error('Failed to fetch question queue by tags:', error);
    throw error;
  }
};

export const obfQuestion = (question) => { 
  console.log(question)
  switch(question.questionType) {
    case "oneOfThree":
      return obfOoTQuestion(question);
    case "connect": 
      return obfConnectQuestion(question);
    case "rank": 
      return obfRankQuestion(question);
    default: 
      throw new Error("Unknown question type");
  }

}

/**
 * Obfuscates a oneOfThree (OoT)-question for the client.
 * @param {Object} question - The question object.
 * @return {Object} The obfuscated question object.
 */
const obfOoTQuestion = (question) => {
  return {
    text: question.text,
    tags: question.tags,
    choices: shuffleArray([...question.incorrectAnswers, question.correctAnswer]),
    id: question._id,
    questionType: question.questionType
  };
};

/**
 * Obfuscates a rank-question for the client.
 * @param {Object} question - The question object.
 * @return {Object} The obfuscated question object.
 */
const obfRankQuestion = (question) => {
  return {
    text: question.text,
    tags: question.tags,
    choices: shuffleArray([...question.correctOrder]),
    id: question._id,
    questionType: question.questionType
  };
};

/**
 * Obfuscates a connect-question for the client.
 * @param {Object} question - The question object.
 * @return {Object} The obfuscated question object.
 */
const obfConnectQuestion = (question) => {
  console.log(question)
  const columnA = shuffleArray(Object.keys(question.connectedPairs))
  const columnB = shuffleArray(Object.values(question.connectedPairs))

  console.log(columnA)
  return {
    text: question.text,
    tags: question.tags,
    choices: [columnA, columnB],
    id: question._id,
    questionType: question.questionType
  };
};



/**
 * Updates the client's score array based on their answer.
 * @param {Object} clientData - The client's data object.
 * @param {Boolean} correct - Whether the answer is correct.
 * @returns {Object} Updated score array.
 */
export const updateScoreArray = (clientData, correct) => {
  const tempScoreArray = { ...clientData.scoreArray };
  clientData.currentQuestion.tags.forEach(tag => {
    if (!tempScoreArray[tag]) tempScoreArray[tag] = [0, 0];
    if (correct) {
      tempScoreArray[tag][0] += 1;
    }
    tempScoreArray[tag][1] += 1;
  });
  return tempScoreArray;
};
/**
 * Updates the client's current totals based on their answer.
 * @param {Object} clientData - The client's data object.
 * @param {Boolean} correct - Whether the answer is correct.
 * @returns {Object} Updated current totals.
 */
export const updateCurrentTotals = (clientData, correct) => {
  const tempCurrentTotals = { ...clientData.currentTotals };
  if (correct) {
    tempCurrentTotals[0] += 1;
    tempCurrentTotals[1] += 1;
  } else {
    tempCurrentTotals[1] += 1;
  }
  return tempCurrentTotals;
};

/**
 * Updates the user's category statistics in the database.
 * @param {String} userID - The ID of the user.
 * @param {Array<String>} categories - The categories to update.
 * @param {Boolean} correct - Whether the answer was correct.
 * @throws Will throw an error if updating the database fails.
 */
export const updateScoresInDatabase = async (userID, categories, correct) => {
  try {
    for (const tag of categories) {
      console.log('Updating tag:', tag);
      if (correct) {
        await updateCategoryStats(userID, tag, 1, 1);
      } else {
        await updateCategoryStats(userID, tag, 0, 1);
      }
    }
    
    // Update the total category
    if (correct) {
      await updateCategoryStats(userID, 'Total', 1, 1);
    } else {
      await updateCategoryStats(userID, 'Total', 0, 1);
    }
  } catch (error) {
    console.error('Error updating scores in database:', error);
    throw error;
  }
};

/**
 * Updates the user's statistics for a specific category.
 * @param {String} userId - The ID of the user.
 * @param {String} category - The category to update.
 * @param {Number} correctIncrement - The amount to increment the correct count by.
 * @param {Number} totalIncrement - The amount to increment the total count by.
 */
const updateCategoryStats = async (userId, category, correctIncrement, totalIncrement) => {
  const updates = {
    [`categoryStats.${category}.correct`]: correctIncrement,
    [`categoryStats.${category}.total`]: totalIncrement
  };

  await Account.updateOne(
    { _id: userId },
    { $inc: updates }
  );
};

/**
 * Retrieves all unique categories from the Question collection.
 * @returns {Promise<Array<String>>} Array of unique category names.
 */
export const getAllCategories = async () => {
  try {
    const cachedCategories = JSON.parse(await redis.get("categories"));
    if (cachedCategories) {
      return cachedCategories;
    } else {
      const categories = await Question.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags'} },
      ]);
      const categoriesArray = [];
      Object.keys(categories).forEach(category => {
        categoriesArray.push(categories[category]._id);
      });

      await redis.set("categories", JSON.stringify(categoriesArray));

      return categoriesArray;
    }
  }
  catch (error)
  {
    return error;
  }
};

export const getAllQuestions = async () => {
  try {
    const cachedQuestions = JSON.parse(await redis.get("questionsByTag"));
    if (cachedQuestions) {
      return cachedQuestions;
    } else {
      const categories = await Question.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags'} },
      ]);
      const categoriesArray = [];
      Object.keys(categories).forEach(category => {
        categoriesArray.push(categories[category]._id);
      });

      await redis.set("categories", JSON.stringify(categoriesArray));

      return categoriesArray;
    }
  }
  catch (error)
  {
    return error;
  }


}

/**
 * Retrieves categories with their question counts, and matches them with corresponding icons.
 * @returns {Promise<Array<Object>>} Array of category objects with counts and icons.
 */
export const getQuestionCategoriesWithCount = async () => {
  const tagsWithCounts = await Question.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } } // Sort by count in descending order
  ]);
  
  const catIconDB = await CategoryIcon.find();
  const categoryIcons = catIconDB.map(category => ({
    catName: category.catName,
    iconName: category.iconName
  }));
    
  const tagsWithIcons = tagsWithCounts.map(tag => {
    const tempTag = { ...tag };
    const categoryIcon = categoryIcons.find(category => category.catName === tempTag._id);
    if (categoryIcon) {
      tempTag.icon = categoryIcon.iconName;
    }
    return tempTag;
  });

  return tagsWithIcons;
};

/**
 * Updates the question's correct or incorrect answer count based on the given answer.
 * @param {String} questionId - The ID of the question to update.
 * @param {Boolean} correct - Whether the given answer was correct.
 */
export const updateQuestionCounts = async (questionId, correct) => {
  console.log('updating:', questionId)
  try {
    const update = correct
      ? { $inc: { correctAnswerCount: 1 } }
      : { $inc: { incorrectAnswerCount: 1 } };

    await Question.findByIdAndUpdate(questionId, update, { new: true });
  } catch (error) {
    console.error("Failed to update question counts:", error);
  }
};

export const calculateDifficulty = (correctAnswerCount, incorrectAnswerCount) => {
  const totalAnswers = correctAnswerCount + incorrectAnswerCount;

  if (totalAnswers === 0) {
    return 'Medium'; // Default to "Medium" if no answers exist
  }

  const correctPercentage = (correctAnswerCount / totalAnswers) * 100;

  if (correctPercentage <= 33) {
    return 'Hard';
  } else if (correctPercentage <= 66) {
    return 'Medium';
  } else {
    return 'Easy';
  }
};
export const checkAnswer = async (question, submittedAnswer) => {
  let correct = false;
  let correctAnswer = {};

  switch (question.questionType) {
    case "rank":
      ({ correct, correctAnswer } = await handleRankAnswer(
        question,
        submittedAnswer
      ));
      break;
    case "oneOfThree":
      ({ correct, correctAnswer } = await handleOoTAnswer(
        question,
        submittedAnswer
      ));
      break;
    case "connect":
      ({ correct, correctAnswer } = await handleConnectAnswer(
        question,
        submittedAnswer
      ));
      break;
    default:
      return false;
  }
  updateQuestionCounts(question.id ? question.id : question._id, correct);
  return { correct, correctAnswer };
};
const handleRankAnswer = async (questionData, submittedAnswer) => {
  const question = await RankQuestion.findById(
    questionData.id ? questionData.id : questionData._id
  );
  let correctAnswer = [];

  let correct = false;
  if (!question) return false;

  // Check if lifeline has been used in which case remove the options from the correct order which arent part of the submitted answer
  if (submittedAnswer.length < question.correctOrder.length) {
    correctAnswer = question.correctOrder.filter((option) => {
      if (submittedAnswer.includes(option)) return option;
    });
    correct = JSON.stringify(correctAnswer) === JSON.stringify(submittedAnswer);
  } else {
    correctAnswer = question.correctOrder;
    correct = JSON.stringify(correctAnswer) === JSON.stringify(submittedAnswer);
  }

  return { correct, correctAnswer };
};
const handleConnectAnswer = async (questionData, submittedAnswer) => {
  const question = await ConnectQuestion.findById(
    questionData.id ? questionData.id : questionData._id
  );

  const correctPairs = question.connectedPairs;
  let correct = true;

  if (!question) return false;

  Object.keys(submittedAnswer).forEach((key) => {
    if (correctPairs[key] !== submittedAnswer[key]) {
      correct = false;
    }
  });
  return { correct, correctAnswer: correctPairs };
};
const handleOoTAnswer = async (questionData, submittedAnswer) => {
  const question = await OoTQuestion.findById(
    questionData.id ? questionData.id : questionData._id
  );
  if (!question) {
    console.log("Error: Question not found");
    return false;
  }

  const correct = question.correctAnswer === submittedAnswer;
  const correctAnswer = question.correctAnswer;

  console.log({ correct, correctAnswer });

  return { correct, correctAnswer };
};
