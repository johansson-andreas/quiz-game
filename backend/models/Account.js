import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

const categoryStatsSchema = new Schema({
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

const AccountSchema = new Schema({
  username: String,
  password: String,
  categoryStats: {
    type: Map,
    of: categoryStatsSchema,
    default: {}
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
});

AccountSchema.plugin(passportLocalMongoose);

export const Account = mongoose.model('Account', AccountSchema);
