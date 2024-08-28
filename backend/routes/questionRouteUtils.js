import {Question} from '../models/Question.js';
import {CategoryIcon} from '../models/CategoryIcon.js';
import { Account } from '../models/Account.js';



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
    id: question._id,
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
  const categories = await Question.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags'} },
  ]);
  const categoriesArray = [];
  Object.keys(categories).forEach(category => {
    categoriesArray.push(categories[category]._id);
  });
  return categoriesArray;
};

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