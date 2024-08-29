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


export const getRandomQuestionByTag = async (tag) => {
  try {
    const result = await Question.RankQuestion([
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