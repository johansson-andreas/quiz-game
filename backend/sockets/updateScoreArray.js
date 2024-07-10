const updateScoreArray = function(session, answer) {
    let scoreArray = {...session.clientData.currentScores}
    session.clientData.currentQuestion.tags.forEach(element => {
        if(!scoreArray[element]) scoreArray[element] = [0,0];
        if(answer === session.clientData.currentQuestion.correctAnswer) {
            scoreArray[element][0] += 1;
        }
        scoreArray[element][1] += 1;
    });
    session.clientData.currentScores = {...scoreArray};
    console.log(session.clientData.currentScores);
};

module.exports = {
    updateScoreArray,
}