import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const baseQuestionSchema = new Schema({
  text: String,              // Question text
  tags: [String],            // Array of tags
  correctAnswerCount: { type: Number, default: 0 },
  incorrectAnswerCount: { type: Number, default: 0 },
  questionType: { type: String, required: true },
  difficulty: {
    type: String,             // Difficulty label: "Easy", "Medium", or "Hard"
    default: 'Medium'         // Default value, can be updated based on logic
  },
}, { discriminatorKey: 'questionType' });         

export const NewQuestion = mongoose.model('NewQuestion', baseQuestionSchema);


const questionSchema = new Schema({
  correctAnswer: String,     // Correct answer
  incorrectAnswers: [String],// Array of incorrect answers
});

export const NewOoTQuestion = NewQuestion.discriminator('newOneOfThree', questionSchema);


const rankQuestionSchema = new Schema({
  correctOrder: [String], 
});

export const NewRankQuestion = NewQuestion.discriminator('newRank', rankQuestionSchema);


const connectQuestionSchema = new Schema({
  connectedPairs: {
    type: [[String]],
    default: []
  },
});

export const NewConnectQuestion = NewQuestion.discriminator('newConnectonnect', connectQuestionSchema);

