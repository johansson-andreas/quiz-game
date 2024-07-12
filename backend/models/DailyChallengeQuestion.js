import mongoose from ('mongoose');
import Schema from mongoose.Schema;

const dailyChallengeQuestion = new Schema({
  date: String,              // Question text
  questionIDs: [String]
});

export const DailyChalleneQuestion = mongoose.model('DailyChalleneQuestion', dailyChallengeQuestion);


