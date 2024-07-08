const Question = require('../models/Question'); 
module.exports = function(socket) {

  socket.on('addQuestion', async (questionData) => {
    const newQuestion = new Question({
      text: questionData.text,
      correctAnswer: questionData.correctAnswer,
      incorrectAnswers: [questionData.incorrectAnswerOne, questionData.incorrectAnswerTwo],
      tags: questionData.tags.split(',').map(tag => tag.trim())
    });

    try {
      await newQuestion.save();
      console.log('Question saved to database');
    } catch (err) {
      console.error('Error saving question:', err);
    }
  });
};