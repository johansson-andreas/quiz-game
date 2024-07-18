import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const dailyChallengeScoreSchema = new Schema({
    score: { type: Number, required: true },
    questionsRemaining: { type: [String], required: true }, 
    currentQuestion: { type: Object, required: true }
  });
  
export const DailyChallengeScore = mongoose.model('DailyChallengeScore', dailyChallengeScoreSchema);