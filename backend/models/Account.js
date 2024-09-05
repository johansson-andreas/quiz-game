import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

// Category stats schema
const categoryStatsSchema = new Schema({
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

// Gauntlet history schema
const gauntletHistorySchema = new Schema({
  lastFive: {
    type: [Number],
    default: [], 
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'], 
  },
  best: { type: Number, default: 0 }, 
});

// Array limit validation
function arrayLimit(val) {
  return val.length <= 5;
}

// Main account schema
const AccountSchema = new Schema({
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
  gauntletHistory: {
    type: gauntletHistorySchema,
    default: {} 
  },
});

// Pre-save hook to ensure lastFive is trimmed to max 5
AccountSchema.pre('save', function (next) {
  if (this.gauntletHistory && this.gauntletHistory.lastFive) {
    if (this.gauntletHistory.lastFive.length > 5) {
      this.gauntletHistory.lastFive = this.gauntletHistory.lastFive.slice(-5);
    }
  }
  next();
});

// Use passport-local-mongoose plugin to handle username, password, etc.
AccountSchema.plugin(passportLocalMongoose);

// Export the model
export const Account = mongoose.model('Account', AccountSchema);
