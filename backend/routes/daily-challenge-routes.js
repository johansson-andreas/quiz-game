import express from 'express';
import { DailyChallengeQuestions, generateNewQuestions } from '../models/DailyChallengeQuestions.js';
import { getNewQuestion, obfQuestion, updateDatabaseDailyChallengeScore } from './dailyChallengeRouteUtils.js';
import { getQuestionCategories } from './questionRouteUtils.js'
import { DailyScore } from '../models/DailyScore.js';

const router = express.Router();

router.get('/initial-contact', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if there is no session data or if the date in session data is different from today
    if (!req.session.dailyChallengeData || req.session.dailyChallengeData.date ==! today) {
      const todaysDailyScoreInfo = await DailyScore.findOne({date:today, userId:req.user._id}) //Try to get data from db, otherwise create new
      if(todaysDailyScoreInfo) {
        console.log('Found data in db for user', req.user.username)

        //TODO: currentQuestion might be outdated if user requested a question they didnt answer to as the data is only saved on /submit-answer, not on /request-question
        req.session.dailyChallengeData = {
          date: todaysDailyScoreInfo.date,
          todaysScore: todaysDailyScoreInfo.score,
          questionsRemaining: todaysDailyScoreInfo.questionsRemaining,
          currentQuestion: todaysDailyScoreInfo.currentQuestion
        }
      }
      else {
        let todaysQuestions = await DailyChallengeQuestions.findOne({ date: today }, 'questionIDs').lean();

        if (!todaysQuestions) {
          // If no questions found for today, generate new questions
          console.log('No daily questions found, generating new questions')
          const questionIds = await generateNewQuestions();
          todaysQuestions = { questionIDs: questionIds };
        }
  
        // Update session data
        req.session.dailyChallengeData = {
          date: today,
          questionsRemaining: todaysQuestions.questionIDs,
          todaysScore: 0,
        };
        await getNewQuestion(req);
      }
    }
    let categories = await getQuestionCategories();
    const initialDataToSend = {
      questionsRemaining: req.session.dailyChallengeData.questionsRemaining,
      todaysScore: req.session.dailyChallengeData.todaysScore,
      currentQuestion: obfQuestion(req.session.dailyChallengeData.currentQuestion)
    }
    const dailyChallengeData = ({ dcd: initialDataToSend, categories: categories });
    res.status(200).json(dailyChallengeData);
  } catch (error) {
    console.error('Error in requestDailyQuestions:', error);
    res.status(500).json({ error: 'Failed to fetch daily challenge questions' });
  }
});
router.get('/request-question', async (req, res) => {
  try {
    const { statusCode, data } = await getNewQuestion(req);
    res.status(statusCode).json(data);
  } catch (error) {
    console.error('Error in request-question:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});
router.get('/get-user-history', async (req, res) => {
  try {
    const userHistory = await DailyScore.find({ userId: req.user._id}).select('date score').exec();
    res.send(userHistory)

  } catch (error) {
    console.error("Error getting user history:", error)
  }
});
router.post('/submit-answer', async (req, res) => {
  const dailyChallengeData = req.session.dailyChallengeData;
  if (dailyChallengeData) {
    const answer = req.body.submittedAnswer;
    if (answer === dailyChallengeData.currentQuestion.correctAnswer) dailyChallengeData.todaysScore += 1;

    res.send({ todaysScore: dailyChallengeData.todaysScore, correctAnswer: dailyChallengeData.currentQuestion.correctAnswer });

    updateDatabaseDailyChallengeScore(req);

  }
});


export default router;