// models/User.js
import mongoose from ('mongoose');
import bcrypt from ('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hash the user's password before saving it to the database
UserSchema.pre('save', async (next) => {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare given password with the hashed password
UserSchema.methods.comparePassword = async (password) => {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', UserSchema);
