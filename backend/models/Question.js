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