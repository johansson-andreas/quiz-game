import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  text: String,              // Question text
  correctAnswer: String,     // Correct answer
  incorrectAnswers: [String],// Array of incorrect answers
  tags: [String],             // Array of tags
  correctAnswerCount: { type: Number, default: 0 },
  incorrectAnswerCount: { type: Number, default: 0 },
});

export const Question = mongoose.model('Question', questionSchema);


