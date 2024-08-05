import {Question} from '../models/Question.js';

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

export const getNewQuestion = async (client) => {
  if (client.unusedQuestions.length === 0) {
    console.log(client.clientId, 'is out of question. Creating new queue');
    client.unusedQuestions = [...client.cachedQuestions];
  }
  console.log(client.clientId, 'is requesting new question: Current length:', client.unusedQuestions.length);
  let newQuestionId = client.unusedQuestions.pop();
  const newQuestion = await Question.findById(newQuestionId).lean();
  client.currentQuestion = newQuestion;
  return newQuestion;
};

export const getNewQuestionQueue = async () => {
  return await Question.distinct('_id').lean().exec();
};

export const getNewQuestionQueueByTags = async (tags) => {
  return await Question.distinct('_id', { tags: { $in: tags } }).lean();
};

export const sendNewQuestion = (question, socket) => {
  const obsOptionsQuestion = {
    text: question.text,
    tags: question.tags,
    choices: [...question.incorrectAnswers, question.correctAnswer],
  };
  socket.emit('question:newQuestionProvided', obsOptionsQuestion);
};

export const sendScoreArray = (session, socket) => {
  if (Object.keys(session.clientData.currentScores).length > 0) {
    socket.emit('scoreArray:scoreArrayProvided', session.clientData.currentScores);
  }
};
