import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const connectQuestionSchema = new Schema({
  text: String,              // Question text
  connectedPairs: {
    type: [[String]],
    default: []
  },
  tags: [String],             // Array of tags
  correctAnswerCount: { type: Number, default: 0 },
  incorrectAnswerCount: { type: Number, default: 0 },
  questionType: {type: String, default: 'connect'}, 
});

export const ConnectQuestion = mongoose.model('ConnectQuestion', connectQuestionSchema);
