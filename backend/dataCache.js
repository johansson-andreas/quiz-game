import cron from 'node-cron';
import { getAllCategories } from './routes/questionRouteUtils.js';
import { Question } from './models/Question.js';
import { RankQuestion } from './models/RankQuestion.js';
import { NewQuestion } from './models/NewQuestion.js';
import { ConnectQuestion } from './models/ConnectQuestion.js';
import redis from './redisClient.js';

/**
 * Fetches question categories and question counts and stores them in Redis.
 */

export const dataCache = async () => {
  try {
    // Fetch categories
    const categories = await getAllCategories();

    const QuestionCount = await Question.countDocuments({});
    const RankCount = await RankQuestion.countDocuments({});
    const NewQuestionCount = await NewQuestion.countDocuments({});
    const ConnectQuestionCount = await ConnectQuestion.countDocuments({});

    // Fetch question counts
    const questionCounts = {
      oot: QuestionCount,
      rank: RankCount,
      newQuestions: NewQuestionCount,
      connect: ConnectQuestionCount,
    };

    
    
    questionCounts.totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);

    // Store data in Redis
    await redis.set('categories', JSON.stringify(categories));
    await redis.set('questionCounts', JSON.stringify(questionCounts));

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
