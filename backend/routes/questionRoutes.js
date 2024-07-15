import express from 'express';
import { getNewQuestion, obfQuestion, updateScoreArray, getNewQuestionQueueByTags, shuffleArray, createClientData } from './routesUtils.js';

const router = express.Router();

const timeLog = async (req, res, next) => {
  if(!req.session.clientData) {
    await createClientData(req);
    await getNewQuestion(req.session.clientData);
    next();
  }
  else next();
}
router.use(timeLog)

router.get('/requestQuestion', async (req, res, next) => {
  const clientData = req.session.clientData;
  res.send(obfQuestion(await getNewQuestion(clientData)));
});

router.post('/submitAnswer', async (req, res) => {
  const clientData = req.session.clientData;
  if(clientData) {
    const answer = req.body.submittedAnswer;
    updateScoreArray(clientData, answer);
    res.send({ scoreArray: clientData.currentScores, correctAnswer: clientData.currentQuestion.correctAnswer });
  }
});

router.post('/getNewQuestionQueueByTags', async (req, res) => {
  const clientData = req.session.clientData;

  clientData.categories = req.body.questionCategories;

  const enabledTags = clientData.categories
    .filter(category => category.enabled)
    .map(category => category._id);
  
  try {
    clientData.cachedQuestions = await getNewQuestionQueueByTags(enabledTags);
    clientData.unusedQuestions = shuffleArray([...clientData.cachedQuestions]);
  } catch (err) {
    console.error('Failed to fetch questions by tags:', err);
  }

  req.session.save();
});

export default router;
