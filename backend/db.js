import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Mongoose');
  } catch (err) {
    console.error('Failed to connect to MongoDB or Mongoose:', err);
    process.exit(1); // Exit process with failure
  }
};

export { client, connectDB };
