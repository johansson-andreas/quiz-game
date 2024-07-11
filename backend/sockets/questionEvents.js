const { getNewQuestion} = require('./socketUtils');
const { getNewQuestionQueueByTags, shuffleArray, sendNewQuestion, sendScoreArray } = require('./socketUtils');
const { updateScoreArray } = require('./updateScoreArray');

const getNewQuestionRequest = function(socket, session) {
    let client = session.clientData;
    socket.on('question:newQuestionRequest', async () => {
        let newQuestion = await getNewQuestion(client);
        sendNewQuestion(newQuestion, socket);
        session.save();
    });
};

const submittedAnswer = function(socket, session) {
socket.on('question:submittedAnswer', (answer) => {
    console.log(`Received answer "${answer}" from controller client ${session.clientData.clientId}`);
    updateScoreArray(session, answer);
    socket.emit('question:correctAnswerProvided', session.clientData.currentQuestion.correctAnswer);
    sendScoreArray(session, socket)
  });
}

const getQueueByTags = function(socket, session) {
    let client = session.clientData;
    socket.on('questionQueue:getQueueByTags', async (data) => {
        client.categories = data;
        const enabledTags = client.categories
          .filter(category => category.enabled)
          .map(category => category._id);
        try {
          client.cachedQuestions = await getNewQuestionQueueByTags(enabledTags);
          client.unusedQuestions = shuffleArray([...client.cachedQuestions]);
        } catch (err) {
          console.error('Failed to fetch questions by tags:', err);
        }
        session.save();
      });
};

module.exports = {
  submittedAnswer,
  getQueueByTags,
  getNewQuestionRequest
};
  
