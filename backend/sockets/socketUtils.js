const Question = require("../models/Question");

const shuffleArray = function(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getNewQuestion = async function(client) {
  if (client.unusedQuestions.length === 0) {
    console.log(client.clientId, 'is out of question. Creating new queue')
    client.unusedQuestions = shuffleArray([...client.cachedQuestions]);
  }
  console.log(client.clientId, 'is requesting new question: Current length:', client.unusedQuestions.length)
  let newQuestionId = client.unusedQuestions.pop();
  const newQuestion = await Question.findById(newQuestionId).lean();
  client.currentQuestion = newQuestion;
  return newQuestion;
};

const getNewQuestionQueue = async function() {
  return await Question.distinct('_id').lean().exec();
};

const getNewQuestionQueueByTags = async function(tags) {
  return await Question.distinct('_id', {tags: { $in: tags } }).lean();
};
const sendNewQuestion = function(question, socket)
{
  const obsOptionsQuestion = {
    text: question.text,
    tags: question.tags,
    choices: [...question.incorrectAnswers, question.correctAnswer],
  }
  socket.emit('question:newQuestionProvided', obsOptionsQuestion);
}
const sendScoreArray = function(session, socket)
{
  if(Object.keys(session.clientData.currentScores).length > 0) socket.emit('scoreArray:scoreArrayProvided', session.clientData.currentScores);
}
module.exports = {
  shuffleArray,
  getNewQuestion,
  getNewQuestionQueue,
  getNewQuestionQueueByTags,
  sendNewQuestion,
  sendScoreArray
};
  
