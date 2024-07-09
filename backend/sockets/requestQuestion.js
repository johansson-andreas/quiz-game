const { getNewQuestion, getNewQuestionQueue } = require('./socketUtils');

module.exports = function(socket, session) {
    let client = session.clientData;
    socket.on('nextQuestion', async () => {
        let newQuestion = await getNewQuestion(client);
        socket.emit('newQuestion', newQuestion);
        session.save();

    });
};