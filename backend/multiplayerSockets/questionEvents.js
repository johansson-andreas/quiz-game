import { getNewQuestion } from './socketUtils.js'; 
import { getNewQuestionQueueByTags, shuffleArray, sendNewQuestion, sendScoreArray } from './socketUtils.js';
import { updateScoreArray } from './updateScoreArray.js';


export const getNewQuestionRequest = (socket, session) => {
    let client = session.clientData;
    socket.on('question:newQuestionRequest', async () => {
        let newQuestion = await getNewQuestion(client);
        sendNewQuestion(newQuestion, socket);
        session.save();
    });
};

export const submittedAnswer = (socket, session) => {
socket.on('question:submittedAnswer', (answer) => {
    console.log(`Received answer "${answer}" from controller client ${session.clientData.clientId}`);
    updateScoreArray(session, answer);
    socket.emit('question:correctAnswerProvided', session.clientData.currentQuestion.correctAnswer);
    sendScoreArray(session, socket)
  });
}

export const getQueueByTags = (socket, session) => {
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

  
