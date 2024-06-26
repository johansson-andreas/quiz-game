const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const os = require('os');
const { networkInterfaces } = os;
const { connectDB } = require('./db'); // Adjust the path as needed
require('dotenv').config();
const Question = require('./models/Question'); // Replace with your actual path to Question model
const app = express(); // Create an instance of the Express application

connectDB();

'use strict';

const nets = networkInterfaces();
let localIp = '';

// Find IPv4 LAN address dynamically
Object.keys(nets).forEach(name => {
  nets[name].forEach(net => {
    // 'IPv4' is in Node <= 17, from Node 18 onwards, it's a number (4 or 6)
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
    if (net.family === familyV4Value && !net.internal) {
      localIp = net.address;
    }
  });
});

const corsOptions = {
  origin: localIp + `:3000`, // Use LAN IP dynamically
  methods: ['GET', 'POST'],
  allowedHeaders: ['my-custom-header'],
  credentials: true
};

console.log('CORS Options:', corsOptions); // Optional: Log CORS options for debugging

// Use `corsOptions` with Express CORS middleware
app.use(cors(corsOptions));

const server = http.createServer(app); // Create an HTTP server and pass the Express app to it

const io = socketIo(server, {
  cors: {
    origin: localIp + ':3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

let categories = [];

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getNewQuestion(client) {
  console.log(`${client} is requesting new question. Current amount of unused questions ${client.unusedQuestions.length}`)
  return client.unusedQuestions.pop();
}


// Function to get questions from a specific category
const getQuestionsByCategory = (categoryTitle) => {
  const category = categories.find(cat => cat.categoryName === categoryTitle);
  return category ? category.questions : [];
};


const defaultQuestions = Question.find();
console.log("DQLENGHT: " + defaultQuestions.length)

const clientQueues = {};

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected to socket.IO:', socket.id);

  let tagsWithCounts = [];

  clientQueues[socket.id] = {
    unusedQuestions: [],
    enabledCategories: [],
    cachedQuestions: [],
  };

  const fetchQuestionsByTags = async (tags) => {
    try {
      const matchingQuestions = await Question.find({ tags: { $in: tags } });
      clientQueues[socket.id].cachedQuestions = shuffleArray(matchingQuestions);
      clientQueues[socket.id].unusedQuestions = [...clientQueues[socket.id].cachedQuestions];
      console.log(`Finding questions matching tags for ${clientQueues[socket.id]} Length: ${clientQueues[socket.id].cachedQuestions.length}`)

    } catch (err) {
      console.error('Failed to fetch questions by tags:', err);
      // Handle error as needed (e.g., emit an error event)
    }
  };

  socket.on('fetchQuestionsByTags', (data) => {
    clientQueues[socket.id].enabledCategories = data;
    console.log(data);
    fetchQuestionsByTags(data);
  });
  
  // Handle answer submission from controller client
  socket.on('sendAnswer', (answer) => {
    console.log(`Received answer "${answer}" from controller client ${socket.id}`);

    // Logic to process the answer (e.g., update score, check correctness)
    // For simplicity, let's just log the answer for now
  });
  socket.on('nextQuestion', () => {
    let newQuestion = [];
    if (clientQueues[socket.id].unusedQuestions.length == 0) {
      console.log(`Cached questions length: ${clientQueues[socket.id].cachedQuestions.length}`);
      clientQueues[socket.id].unusedQuestions = [...clientQueues[socket.id].cachedQuestions];
      console.log(`Created new question queue for ${clientQueues[socket.id]}. Length: ${clientQueues[socket.id].unusedQuestions.length}`);
      newQuestion = getNewQuestion(clientQueues[socket.id]);
    }
    else {newQuestion = getNewQuestion(clientQueues[socket.id]);}

    socket.emit('newQuestion', newQuestion);
    console.log('Received newQuestion request', newQuestion);
    // Logic to process the answer (e.g., update score, check correctness)
    // For simplicity, let's just log the answer for now
  });

  socket.on('addQuestion', (questionData) => {
    const newQuestion = new Question({
      text: questionData.text,
      correctAnswer: questionData.correctAnswer,
      incorrectAnswers: questionData.incorrectAnswers.split(',').map(option => option.trim()),
      tags: questionData.tags.split(',').map(tag => tag.trim()) // Assuming comma-separated values
    });

    newQuestion.save()
      .then(() => {
        console.log('Question saved to database');
      })
      .catch(err => {
        console.error('Error saving question:', err);
      });
  });

  socket.on('initialContact', () => 
  {
    (async () => {
      try {
        clientQueues[socket.id].unusedQuestions = shuffleArray(await Question.find());
        tagsWithCounts = await Question.aggregate([
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } }  // Sort by count in descending order
        ]);
  
        console.log(`Created default question queue for ${socket.id}. Amount of questions: ${clientQueues[socket.id].unusedQuestions.length}`);
  
        clientQueues[socket.id].enabledCategories = tagsWithCounts.map(tag => [...tag._id])

        socket.emit('newQuestion', getNewQuestion(clientQueues[socket.id]));
        socket.emit('questionCategories', tagsWithCounts);
        console.log(tagsWithCounts);
        console.log(`Sent new question and question categories to ${socket.id}`);
  
      } catch (err) {
        console.error(`Failed to populate default question queue for ${socket.id}:`, err);
      }
    })();
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    delete clientQueues[socket.id];
    console.log(`Client ${socket.id} disconnected and queue cleaned up`);
  });

  // Initialize default question queue on connection


}, []);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
