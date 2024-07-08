const { getNewQuestion } = require('./socketUtils');

module.exports = function(socket, session) {
    let client = session.clientData;
    socket.on('nextQuestion', () => {
        let newQuestion = [];
        if (client.unusedQuestions.length == 0) {
            console.log(`Cached questions length: ${client.cachedQuestions.length}`);
            client.unusedQuestions = [...client.cachedQuestions];
            newQuestion = getNewQuestion(client);
        }
        else {
            console.log("QuestionQueue length: ", client.unusedQuestions.length)
            newQuestion = getNewQuestion(client);
        }

        socket.emit('newQuestion', newQuestion);
        session.save();

    });
};