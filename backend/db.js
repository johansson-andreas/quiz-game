const { MongoClient } = require('mongodb');
require('dotenv').config();


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');

const connectDB = async () => {
  try {
    await client.connect();
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB & Mongoose');

  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

module.exports = { client, connectDB };
