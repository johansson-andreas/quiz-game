import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const dailyScoreSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  date: { type: Date, required: true, index: true },
  score: { type: Number, required: true },
  questionsRemaining: { type: [String], required: true },
  currentQuestion: { type: Object, required: true },
});

export const DailyScore = mongoose.model('DailyScore', dailyScoreSchema);