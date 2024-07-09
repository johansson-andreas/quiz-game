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
  const ids = await Question.distinct('_id').lean().exec();
  return ids;
};

const fetchQuestionsByTags = async function(session, tags) {
  let client = session.clientData;
  try {
    client.cachedQuestions = await Question.distinct('_id', {tags: { $in: tags } }).lean();
    client.unusedQuestions = shuffleArray([...client.cachedQuestions]);
  } catch (err) {
    console.error('Failed to fetch questions by tags:', err);
  }
};

module.exports = {
  shuffleArray,
  getNewQuestion,
  getNewQuestionQueue,
  fetchQuestionsByTags
};
  
