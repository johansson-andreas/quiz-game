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
    const categoriesPromise = getAllCategories();

    // Fetch question IDs in parallel
    const [OoTQuestionsIDs, NewQuestionsIDs, ConnectQuestionsIDs, RankQuestionsIDs] = await Promise.all([
      Question.find().select('id tags').lean().exec(),
      NewQuestion.find().select('id tags').lean().exec(),
      ConnectQuestion.find().select('id tags').lean().exec(),
      RankQuestion.find().select('id tags').lean().exec(),
    ]);


    const allQuestionIDs = [...OoTQuestionsIDs, ...NewQuestionsIDs, ...ConnectQuestionsIDs, ...RankQuestionsIDs]

    const questionIDsByTag = {}

    Object.keys(allQuestionIDs).map(key => {
      allQuestionIDs[key].tags.map(tag => {
        if(!questionIDsByTag[tag]) questionIDsByTag[tag] = [allQuestionIDs[key]._id]
        else questionIDsByTag[tag].push(allQuestionIDs[key]._id)
      })
    })

    // Resolve categories
    const categories = await categoriesPromise;

    // Calculate counts
    const QuestionCount = OoTQuestionsIDs.length;
    const RankCount = RankQuestionsIDs.length;
    const NewQuestionCount = NewQuestionsIDs.length;
    const ConnectQuestionCount = ConnectQuestionsIDs.length;

    const questionCounts = {
      oot: QuestionCount,
      rank: RankCount,
      newQuestions: NewQuestionCount,
      connect: ConnectQuestionCount,
    };

    const questionIDsByType = {
      oot: OoTQuestionsIDs,
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
