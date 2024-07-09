const { getNewQuestion, getNewQuestionQueue } = require('./socketUtils');

module.exports = function(socket, session) {
    let client = session.clientData;
    socket.on('nextQuestion', async () => {
        let newQuestion = await getNewQuestion(client);

        const obsOptionsQuestion = {
            text: newQuestion.text,
            tags: newQuestion.tags,
            choices: [...newQuestion.incorrectAnswers, newQuestion.correctAnswer],
          }
        socket.emit('newQuestion', obsOptionsQuestion);
        session.save();

    });
};