import express from 'express';
import { DailyChallengeQuestions, generateNewQuestions } from '../models/DailyChallengeQuestions.js';
import { getNewQuestion, obfOoTQuestion, updateDatabaseDailyChallengeScore } from './dailyChallengeRouteUtils.js';
import { getQuestionCategoriesWithCount } from './questionRouteUtils.js'
import { DailyScore } from '../models/DailyScore.js';
import { Question } from '../models/Question.js';
import redis from '../redisClient.js';

const router = express.Router();


router.get('/initial-contact', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Try to get daily questions from Redis
    let todaysQuestions = await redis.get(`dailyQuestions:${today}`);
    if (!todaysQuestions) {
      // If not in cache, fetch from database or generate new ones
      console.log('Cache miss, fetching from DB');
      todaysQuestions = await DailyChallengeQuestions.findOne({ date: today }, 'questionIDs').lean();
      if (!todaysQuestions) {
        // If no questions found for today, generate new questions
        console.log('No daily questions found, generating new questions');
        const questionIds = await generateNewQuestions();
        todaysQuestions = { questionIDs: questionIds };
        // Save the new questions in the database
        await new DailyChallengeQuestions({ date: today, questionIDs: questionIds }).save();
      }
      // Store daily questions in Redis cache
      await redis.set(`dailyQuestions:${today}`, JSON.stringify(todaysQuestions));
      for (const questionId of todaysQuestions.questionIDs) {
        const questionData = await Question.findById(questionId).lean(); 
        if (questionData) {
          await redis.set(questionId, JSON.stringify(questionData));
        }
      }

    } else {
      todaysQuestions = JSON.parse(todaysQuestions);
    }
    // Check if there is no session data or if the date in session data is different from today
    if (!req.session.dailyChallengeData || req.session.dailyChallengeData.date != today) {
      const todaysDailyScoreInfo = await DailyScore.findOne({ date: today, userId: req.user._id }).lean();
      if (todaysDailyScoreInfo) {
        req.session.dailyChallengeData = {
          date: todaysDailyScoreInfo.date,
          todaysScore: todaysDailyScoreInfo.score,
          questionsRemaining: todaysDailyScoreInfo.questionsRemaining,
          currentQuestion: todaysDailyScoreInfo.currentQuestion,
          submittedAnswers: todaysDailyScoreInfo.submittedAnswers
        };
      } else {
        // Update session data
        req.session.dailyChallengeData = {
          date: today,
          questionsRemaining: todaysQuestions.questionIDs,
          submittedAnswers: {},
          todaysScore: 0,
        };
        await getNewQuestion(req);
      }
    }

        console.log('no current question found')
        getNewQuestion(req)

    let categories = await getQuestionCategoriesWithCount();
    const initialDataToSend = {
      questionsRemaining: req.session.dailyChallengeData.questionsRemaining,
      todaysScore: req.session.dailyChallengeData.todaysScore,
      currentQuestion: obfOoTQuestion(req.session.dailyChallengeData.currentQuestion)
    };
    const dailyChallengeData = { dcd: initialDataToSend, categories: categories };
    res.status(200).json(dailyChallengeData);
  } catch (error) {
    console.error('Error in requestDailyQuestions:', error);
    res.status(500).json({ error: 'Failed to fetch daily challenge questions' });
  }
});


router.get('/question', async (req, res) => {
  try {
    const { statusCode, data } = await getNewQuestion(req);
    res.status(statusCode).json(data);
  } catch (error) {
    console.error('Error in question:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/user-history', async (req, res) => {
  try {
    const userHistory = await DailyScore.find({ userId: req.user._id}).select('date score').lean().exec();
    res.send(userHistory)

  } catch (error) {
    console.error("Error getting user history:", error)
  }
});
router.post('/answer/:submittedAnswer', async (req, res) => {
  const dailyChallengeData = req.session.dailyChallengeData;
  if (dailyChallengeData) {
    const answer = req.params.submittedAnswer;
    if (answer === dailyChallengeData.currentQuestion.correctAnswer) dailyChallengeData.todaysScore += 1;
    dailyChallengeData.submittedAnswers[dailyChallengeData.currentQuestion._id] = answer;

    res.send({ todaysScore: dailyChallengeData.todaysScore, correctAnswer: dailyChallengeData.currentQuestion.correctAnswer });

    updateDatabaseDailyChallengeScore(req);

  }
});
router.get('/daily-best', async (req, res) => {
  try{
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const dailyBest = await DailyScore.find({date:today}, 'userId score').populate('userId', 'username').lean().exec()
    res.status(200).json({status: "ok", message: dailyBest});
  }
  catch(error)
  {
    console.log(error)
  }

})
router.get('/daily-question-key', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Retrieve daily question IDs from Redis
    const dailyQuestionIdsStr = await redis.get(`dailyQuestions:${today}`);
    if (!dailyQuestionIdsStr) {
      return res.status(404).json({ error: 'No questions found for today' });
    }

    const dailyQuestionIds = JSON.parse(dailyQuestionIdsStr);

    let dailyQuestionKeys = [];
    for (const questionId of dailyQuestionIds.questionIDs) {
      // Retrieve each question from Redis
      const questionKeyStr = await redis.get(questionId);
      if (questionKeyStr) {
        const questionKey = JSON.parse(questionKeyStr);
        dailyQuestionKeys.push(questionKey);
      } else {
        console.warn(`Question ID ${questionId} not found in cache`);
      }
    }

    res.status(200).json({correctAnswers:dailyQuestionKeys, submittedAnswers:req.session.dailyChallengeData.submittedAnswers});
  } catch (error) {
    console.error('Error retrieving daily questions:', error);
    res.status(500).json({ error: 'Failed to retrieve daily questions' });
  }
});


export default router;