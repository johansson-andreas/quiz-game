const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  text: String,              // Question text
  correctAnswer: String,     // Correct answer
  incorrectAnswers: [String],// Array of incorrect answers
  tags: [String]             // Array of tags
});

const Question = mongoose.model('Question', questionSchema);


module.exports = Question;