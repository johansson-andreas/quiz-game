import express from 'express';
import { getNewQuestion, obfQuestion, updateScoreArray, getNewQuestionQueueByTags, shuffleArray, updateScoresInDatabase } from './questionRouteUtils.js';
import {createClientData } from './loginRouteUtils.js';
import { Question } from '../models/Question.js';

const router = express.Router();

const timeLog = async (req, res, next) => {
  if(!req.session.clientData) {
    console.log('Found no data for', req.session.clientId, 'creating new data')
    await createClientData(req);
    await getNewQuestion(req.session.clientData);
    next();
  }
  else next();
}
router.use(timeLog);

router.get('/request-question', async (req, res, next) => {
  const clientData = req.session.clientData;

  res.send(obfQuestion(await getNewQuestion(clientData)));
});

router.get('/initial-contact', async (req, res) => {
  // Access session data 
  await createClientData(req);
  const newQuestion = await getNewQuestion(req.session.clientData);
  console.log(req.session.clientData.unusedQuestions.length);
  res.send({ question: obfQuestion(newQuestion), categories: req.session.clientData.categories, scoreArray: req.session.clientData.currentScores });
});


router.post('/submit-answer', async (req, res) => {
  console.log(req.body.submittedAnswer)
  const clientData = req.session.clientData;
  if(clientData) {
    const answer = req.body.submittedAnswer;
    let correct = false;
    if(answer === clientData.currentQuestion.correctAnswer) correct = true

    clientData.currentScores = updateScoreArray(clientData, correct);
    res.send({ scoreArray: clientData.currentScores, correctAnswer: clientData.currentQuestion.correctAnswer });

    //Update database if user in logged in
    if (req.user && req.user._id) {
      updateScoresInDatabase(req.user._id, clientData.currentScores).catch(error => {
        console.error('Failed to update scores in database:', error);
      });
    }  
  }
});

router.post('/get-new-question-queue-by-tags', async (req, res) => {
  const clientData = req.session.clientData;
  console.log(clientData.clientId)

  clientData.categories = req.body.questionCategories;

  const enabledTags = clientData.categories
    .filter(category => category.enabled)
    .map(category => category._id);
  
  try {
    clientData.cachedQuestions = await getNewQuestionQueueByTags(enabledTags);
    console.log('Number of cached questions', clientData.cachedQuestions.length)
    clientData.unusedQuestions = ([...clientData.cachedQuestions]);
    req.session.save();

  } catch (err) {
    console.error('Failed to fetch questions by tags:', err);
  }

});

router.post('/add-question-to-db', async (req, res) => {

    const questionToAdd = req.body.newQuestion;

    const newQuestion = new Question({
      text: questionToAdd.questions,              
      correctAnswer: questionToAdd.correctAnswer,    
      incorrectAnswers: questionToAdd.answers,
      tags: questionToAdd.categories        
  });

  // Save the new document
  newQuestion.save();

});

export default router;
