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
const Question = require('./Question'); // Replace with your actual path to Question model


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

const addCategory = (newTitle) => {
  if (!categories.some(category => category.categoryName === newTitle)) {
    categories.push({
      categoryName: newTitle,
      questions: []
    });
  }
};

const addQuestionToCategory = (question) => {
  const questionString = JSON.stringify(question);

  categories.forEach(category => {
    if (question.tags.includes(category.categoryName)) {
      if (!category.questions.some(q => JSON.stringify(q) === questionString)) {
        category.questions.push(JSON.parse(questionString));
      }
    }
  });
};

const processFile = (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const regex = /\[Q\](.+?) \[C\](.+?) \[W1\](.+?) \[W2\](.+?) \[T\](.+)/;

  rl.on('line', (line) => {
    const match = line.match(regex);

    if (match) {
      const tags = match[5].split(',').map(tag => tag.trim());
      const question = {
        text: match[1],
        correctAnswer: match[2],
        incorrectAnswers: [match[3].trim(), match[4].trim()],
        tags: tags
      };

      tags.forEach(tag => addCategory(tag));
      addQuestionToCategory(question);
    } else {
      console.warn('Line does not match expected format:', line);
    }
  });

  rl.on('close', () => {
    console.log('File processing complete.');
  });
};

// Usage example: Read questions from a file and log them
const filePath = 'questions.txt';
processFile(filePath);

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Store a queue for each connected client
const clientQueues = {};

function getQuestionArray(enabledCategories) {
  let unusedQuestions = enabledCategories.flatMap(tag => getQuestionsByCategory(tag));
  return shuffleArray(unusedQuestions);
}

function getNewQuestion(client) {
  console.log(`${client} is requesting new question. Current amount of unused questions ${client.unusedQuestions.length}`)
  if (client.unusedQuestions.length === 0) {
    client.unusedQuestions = getQuestionArray(client.enabledCategories);
    console.log(`Created new question queue for ${client}. Length: ${client.unusedQuestions.length}`);
  }
  return client.unusedQuestions.pop();
}

// Function to get questions from a specific category
const getQuestionsByCategory = (categoryTitle) => {
  const category = categories.find(cat => cat.categoryName === categoryTitle);
  return category ? category.questions : [];
};

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected to socket.IO:', socket.id);

  clientQueues[socket.id] = {
    enabledCategories: [],
    unusedQuestions: []
  };
  
  clientQueues[socket.id].enabledCategories = [...categories.map(category => category.categoryName)];
  clientQueues[socket.id].unusedQuestions = getQuestionArray(clientQueues[socket.id].enabledCategories);
  console.log(`Created default q queue for ${socket.id} Amount of questions: ${clientQueues[socket.id].unusedQuestions.length}`)
  
  
  // Handle answer submission from controller client
  socket.on('sendAnswer', (answer) => {
    console.log(`Received answer "${answer}" from controller client ${socket.id}`);

    // Logic to process the answer (e.g., update score, check correctness)
    // For simplicity, let's just log the answer for now
  });
  socket.on('nextQuestion', () => {
    const newQuestion = getNewQuestion(clientQueues[socket.id]);
    socket.emit('newQuestion', newQuestion);
    console.log('Received newQuestion request', newQuestion);
    // Logic to process the answer (e.g., update score, check correctness)
    // For simplicity, let's just log the answer for now
  });
  socket.on('initialContact', () => {
    const questionCategories = categories.map(category => [category.categoryName, category.questions.length]);
    socket.emit('questionCategories', questionCategories);
    const newQuestion = getNewQuestion(clientQueues[socket.id]);
    socket.emit('newQuestion', newQuestion);
  });

  socket.on('requestQuestions', (activeCategories) => {
    console.log(`${socket.id} is updating activeCategories to ${activeCategories}`)
    clientQueues[socket.id].enabledCategories = activeCategories;
    clientQueues[socket.id].unusedQuestions = getQuestionArray(clientQueues[socket.id].enabledCategories);
  });

  socket.on('addQuestion', (questionData) => {
    // Create a new question document with data received
    const newQuestion = new Question({
      text: questionData.text,
      correctAnswer: questionData.correctAnswer,
      incorrectAnswers: questionData.incorrectAnswers.split(',').map(option => option.trim()),
      tags: questionData.tags.split(',').map(tag => tag.trim()) // Assuming comma-separated values
    });

    // Save the question to MongoDB
    newQuestion.save()
      .then(() => {
        console.log('Question saved to database');
        // Optionally emit an event back to the client to confirm success
      })
      .catch(err => {
        console.error('Error saving question:', err);
        // Handle error and optionally emit an error event to the client
      });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });


}, []);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
