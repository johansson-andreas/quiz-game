import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import { dailyChallengeScoreSchema } from './DailyChallengeScore.js';

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
    username: String,
    password: String,
    categoryStats: Object,
});


AccountSchema.plugin(passportLocalMongoose);

export const Account = mongoose.model('Account', AccountSchema);

