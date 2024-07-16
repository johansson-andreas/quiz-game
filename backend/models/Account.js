import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
    username: String,
    password: String,
    categoryStats: Object,
    dailyChallengeScores:[
        {
          date: Date,
          score: Number,
          questionsRemaining: [String],
        },
    ]
});

AccountSchema.plugin(passportLocalMongoose);

export const Account = mongoose.model('Account', AccountSchema);

