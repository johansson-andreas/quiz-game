const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyChallengeQuestion = new Schema({
  date: String,              // Question text
  questionIDs: [String]
});

const DailyChalleneQuestion = mongoose.model('DailyChalleneQuestion', dailyChallengeQuestion);


module.exports = DailyChalleneQuestion;