// routes/initialContact.js
const express = require('express');
const router = express.Router();
const {getNewQuestion, obfQuestion, updateScoreArray, getNewQuestionQueueByTags, shuffleArray} = require('./routesUtils');
const Question = require('../models/Question'); 
const CategoryIcon = require('../models/CategoryIcon');

// Define routes
router.get('/', async (req, res) => {
    
});

router.get('/requestQuestion', async (req,res) => { 
    const clientData = req.session.clientData; 
    res.send(obfQuestion(await getNewQuestion(clientData)));
});
router.post('/submitAnswer', async (req,res) => {
    const clientData = req.session.clientData;
    const answer = req.body.submittedAnswer;
    console.log('Received answer',answer,'from controller client',clientData.clientId);
    updateScoreArray(clientData, answer);
    console.log({scoreArray: clientData.currentScores, correctAnswer: clientData.currentQuestion.correctAnswer});
    res.send({scoreArray: clientData.currentScores, correctAnswer: clientData.currentQuestion.correctAnswer});
});


router.post('/getNewQuestionQueueByTags', async (req,res) => {
    const clientData = req.session.clientData;
    console.log(req.body.questionCategories)
 
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

// Export router
module.exports = router;
