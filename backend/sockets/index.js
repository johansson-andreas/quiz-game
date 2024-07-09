const requestQuestion = require('./requestQuestion');
const fetchQuestionsByTags = require('./fetchQuestionsByTag')
const initialContact = require('./initialContact');
const addQuestionToDB = require('./addQuestionToDB');

module.exports = function(io) {

  io.on('connection', (socket) => {
    const session = socket.request.session;
    if (!session.clientData) {
      session.clientData = {
        unusedQuestions: [],
        categories: {},
        cachedQuestions: [],
        username: '',
        clientId: session.id,
        currentScores: {},
      };
      session.save();
    }
    console.log('Client', session.clientData.clientId, 'connected to the server');
    socket.on('sendAnswer', (answer) => {
      console.log(`Received answer "${answer}" from controller client ${session.clientData}`);
    });

    fetchQuestionsByTags(socket, session);

    requestQuestion(socket, session);

    initialContact(socket, session);

    addQuestionToDB(socket);

    socket.on('requestDailyChallengeQuestions', async () => {
      console.log('test');
      try {
        const dailyQuestionsArray = await DailyChallengeQuestion.find();
        console.log(dailyQuestionsArray);
        socket.emit('sendingDailyChallengeArray', dailyQuestionsArray);
      } catch (err) {
        console.error('Failed to fetch daily challenge questions:', err);
      }
    });
    socket.on('disconnect', () => {
      console.log('Client', session.clientData.clientId, 'disconnected from the server');
    });
  });
};
