const updateScoreArray = function(session, answer) {
    let tempScoreArray = {...session.clientData.scoreArray}
    session.clientData.currentQuestion.tags.forEach(element => {
        if(!tempScoreArray[element]) tempScoreArray[element] = [0,0];
        if(answer === session.clientData.currentQuestion.correctAnswer) {
            tempScoreArray[element][0] += 1;
        }
        tempScoreArray[element][1] += 1;
    });
    session.clientData.scoreArray = {...tempScoreArray};
    console.log(session.clientData.scoreArray);
};

module.exports = {
    updateScoreArray,
}