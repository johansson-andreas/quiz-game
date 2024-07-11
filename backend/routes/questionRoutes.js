// routes/initialContact.js
const express = require('express');
const router = express.Router();
const {getNewQuestion, obfQuestion, getNewQuestionQueue} = require('./routesUtils');
const Question = require('../models/Question'); 
const CategoryIcon = require('../models/CategoryIcon');

// Define routes
router.get('/', async (req, res) => {
    
});

router.get('/requestQuestion', async (req,res) => {
    const clientData = req.session.clientData; 
    res.send(obfQuestion(await getNewQuestion(clientData)));
});
router.get('/submitAnswer', async (req,res) => {
    const clientData = req.session.clientData;
    const answer = response.data;

    console.log(`Received answer "${answer}" from controller client ${session.clientData.clientId}`);
    updateScoreArray(session, answer);
    socket.emit('question:correctAnswerProvided', session.clientData.currentQuestion.correctAnswer);
    sendScoreArray(session, socket)

});

// Export router
module.exports = router;
