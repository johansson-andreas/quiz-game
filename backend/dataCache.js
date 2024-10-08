import cron from 'node-cron';
import { getAllCategories } from './routes/questionRouteUtils.js';
import { OoTQuestion } from './models/Question.js';
import { RankQuestion } from './models/Question.js';
import { NewQuestion } from './models/NewQuestion.js';
import { ConnectQuestion } from './models/Question.js';
import redis from './redisClient.js';

/**
 * Fetches question categories and question counts and stores them in Redis.
 */
export const dataCache = async () => {
  try {
    // Fetch categories
    const categoriesPromise = getAllCategories();

    // Fetch question IDs in parallel
    const [OoTQuestionsIDs, NewQuestionsIDs, ConnectQuestionsIDs, RankQuestionsIDs] = await Promise.all([
      OoTQuestion.find().select('id tags difficulty').lean().exec(),
      NewQuestion.find().select('id tags difficulty').lean().exec(),
      ConnectQuestion.find().select('id tags difficulty').lean().exec(),
      RankQuestion.find().select('id tags difficulty').lean().exec(),
    ]);


    const allQuestionIDs = [...OoTQuestionsIDs, ...NewQuestionsIDs, ...ConnectQuestionsIDs, ...RankQuestionsIDs]

    const questionIDsByTag = {}

    Object.keys(allQuestionIDs).forEach(key => {
      const question = allQuestionIDs[key];
      const diff = question.difficulty;
    
      // Iterate through each tag associated with the question
      question.tags.forEach(tag => {
        // Ensure the tag property exists
        if (!questionIDsByTag[tag]) {
          questionIDsByTag[tag] = {};
        }
    
        // Ensure the difficulty property exists within the tag
        if (!questionIDsByTag[tag][diff]) {
          questionIDsByTag[tag][diff] = [];
        }
    
        // Push the question ID to the appropriate difficulty level
        questionIDsByTag[tag][diff].push(question._id);
      });
    });


    // Resolve categories
    const categories = await categoriesPromise;

    // Calculate counts
    const QuestionCount = OoTQuestionsIDs.length;
    const RankCount = RankQuestionsIDs.length;
    const NewQuestionCount = NewQuestionsIDs.length;
    const ConnectQuestionCount = ConnectQuestionsIDs.length;

    const questionCounts = {
      oneOfThree: QuestionCount,
      rank: RankCount,
      newQuestions: NewQuestionCount,
      connect: ConnectQuestionCount,
    };

    const questionIDsByType = {
      oneOfThree: OoTQuestionsIDs,
      rank: RankQuestionsIDs,
      newQuestions: NewQuestionsIDs,
      connect: ConnectQuestionsIDs,
    };
    
    questionCounts.totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);

    // Store data in Redis
    await Promise.all([
      redis.set('categories', JSON.stringify(categories)),
      redis.set('questionCounts', JSON.stringify(questionCounts)),
      redis.set('questionIDsByType', JSON.stringify(questionIDsByType)),
      redis.set('questionsByTag', JSON.stringify(questionIDsByTag))
    ]);

    console.log('Data successfully cached in Redis');
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Run cacheData function when server starts
dataCache();

// Schedule cacheData to run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running scheduled cache update...');
  dataCache();
});
