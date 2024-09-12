import { ConnectQuestion, OoTQuestion, RankQuestion } from "../models/Question.js";
import { Account } from "../models/Account.js";
import { updateQuestionCounts } from "./questionRouteUtils.js";

export const handleRankAnswer = async (questionData, submittedAnswer) => {

    const question = await RankQuestion.findById(questionData.id);
    let correctAnswer = []

    let correct = false;
    if (!question)
      return false;

    // Check if lifeline has been used in which case remove the options from the correct order which arent part of the submitted answer
    if (submittedAnswer.length < question.correctOrder.length) {
        correctAnswer = question.correctOrder.filter(option => {if(submittedAnswer.includes(option)) return option})
        correct = JSON.stringify(correctAnswer) === JSON.stringify(submittedAnswer);
    }
    else {
        correctAnswer = question.correctOrder;
        correct = JSON.stringify(correctAnswer) === JSON.stringify(submittedAnswer);
    }

    return {correct, correctAnswer};
}

export const handleConnectAnswer = async (questionData, submittedAnswer) => {

  const question = await ConnectQuestion.findById(questionData.id ? questionData.id : questionData._id);

  const correctPairs = question.connectedPairs;
  let correct = true;

  if (!question)
    return false;

  Object.keys(submittedAnswer).forEach(key => {
    if(correctPairs[key] !== submittedAnswer[key]) {
      correct = false;
    }
  })
  return {correct, correctAnswer: correctPairs};
}

export const handleOoTAnswer = async (questionData, submittedAnswer) => {
  const question = await OoTQuestion.findById(questionData.id);

  if (!question)
    return false;

  const correct = question.correctAnswer === submittedAnswer;
  const correctAnswer = question.correctAnswer;

  return {correct, correctAnswer};
}

export const checkAnswer = async (question, submittedAnswer) => {
  let correct = false;
  let correctAnswer = {};


  switch (question.questionType) {
    case "rank":
      ({correct, correctAnswer} = await handleRankAnswer(question, submittedAnswer))
      break;
    case "oneOfThree":
      ({correct, correctAnswer} = await handleOoTAnswer(question, submittedAnswer))
      break;
    case "connect":
      ({correct, correctAnswer} = await handleConnectAnswer(question, submittedAnswer))
      break;
    default:
      return false;
  }
  updateQuestionCounts(question.id ? question.id : question._id, correct);
  return {correct, correctAnswer};
}


export const addNewScoreToGauntletHistory = async (accountId, newScore) => {
    const account = await Account.findById(accountId);
  
    if (account) {
      // Add the new score to the `lastFive` array
      const updatedLastFive = [...account.gauntletHistory.lastFive, newScore];
  
      // Ensure the `lastFive` array only keeps the last 5 scores
      if (updatedLastFive.length > 5) {
        updatedLastFive.shift(); // Remove the oldest score (first element)
      }
  
      // Calculate the new best score
      const newBest = Math.max(account.gauntletHistory.best || 0, newScore);
  
      // Use findByIdAndUpdate to atomically update the document
      const updatedAccount = await Account.findByIdAndUpdate(
        accountId,
        {
          $set: {
            'gauntletHistory.lastFive': updatedLastFive,
            'gauntletHistory.best': newBest,
          },
        },
        { new: true, lean: true } // Return the updated document
      );
  
      return updatedAccount;
    } else {
      throw new Error('Account not found');
    }
  };
  