import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const rankQuestionSchema = new Schema({
  text: String,              // Question text
  correctOrder: [String], 
  tags: [String],             // Array of tags
  correctAnswerCount: { type: Number, default: 0 },
  incorrectAnswerCount: { type: Number, default: 0 },
  questionType: {type: String, default: 'rank'}, 
});

export const RankQuestion = mongoose.model('RankQuestion', rankQuestionSchema);
