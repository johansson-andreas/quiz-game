import { RankQuestion } from "../models/RankQuestion.js";
import { Account } from "../models/Account.js";

export const handleRankAnswer = async (question, submittedAnswer) => {
    question = await RankQuestion.findById(question.id);
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
  