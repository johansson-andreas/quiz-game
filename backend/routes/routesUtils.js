const Question = require("../models/Question");

const shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

const getNewQuestion = async function(client) {
  if (client.unusedQuestions.length === 0) {
    console.log(client.clientId, 'is out of question. Creating new queue')
    client.unusedQuestions = [...client.cachedQuestions];
  }
  console.log(client.clientId, 'is requesting new question: Current length:', client.unusedQuestions.length)

  const randomIndex = Math.floor(Math.random() * client.unusedQuestions.length);
  const newQuestionId = client.unusedQuestions.splice(randomIndex, 1)[0];

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
const obfQuestion = function(question)
{
  console.log(question);
  const obfQuestion = {
    text: question.text,
    tags: question.tags,
    choices: shuffleArray([...question.incorrectAnswers, question.correctAnswer]),
  }
  return obfQuestion;
}
const sendScoreArray = function(session)
{
    
}
module.exports = {
  shuffleArray,
  getNewQuestion,
  getNewQuestionQueue,
  getNewQuestionQueueByTags,
  obfQuestion,
  sendScoreArray
};
  
