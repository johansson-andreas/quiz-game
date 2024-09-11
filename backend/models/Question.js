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

export const Question = mongoose.model('Question', baseQuestionSchema);


const questionSchema = new Schema({
  correctAnswer: String,     // Correct answer
  incorrectAnswers: [String],// Array of incorrect answers
});

export const OoTQuestion = Question.discriminator('oneOfThree', questionSchema);


const rankQuestionSchema = new Schema({
  correctOrder: [String], 
});

export const RankQuestion = Question.discriminator('rank', rankQuestionSchema);


const connectQuestionSchema = new Schema({
  connectedPairs: {
    type: {},
    default: []
  },
});

export const ConnectQuestion = Question.discriminator('connect', connectQuestionSchema);


const timeLineQuestionSchema = new Schema({
  minMax: {
    min: Number,
    max: Number
  },
  correctAnswer: Number
});

export const TimeLineQuestion = Question.discriminator('timeLine', timeLineQuestionSchema)

export const getRandomQuestionByTag = async (tag) => {
  try {
    const result = await Question.aggregate([
      { $match: { tags: tag } }, // Match documents where category array contains the value
      { $sample: { size: 1 } } // Randomly sample 1 document
    ]);

    // If a document is found, return it, otherwise return null
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting random document:', error);
    return null;
  }
};