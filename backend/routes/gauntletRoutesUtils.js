import { Account } from "../models/Account.js";

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
  