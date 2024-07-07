const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const os = require('os');
const { networkInterfaces } = os;
const { connectDB } = require('./db');
require('dotenv').config();
const Question = require('./models/Question'); 
const CategoryIcon = require('./models/CategoryIcon');
const DailyChallengeQuestion = require('./models/DailyChallengeQuestion');

const app = express(); 

connectDB();

async function initializeServer() {
  await connectDB(); 

  'use strict';

  const nets = networkInterfaces();
  let localIp = '';

  // Find IPv4 LAN address dynamically
  Object.keys(nets).forEach(name => {
    nets[name].forEach(net => {
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

  console.log('CORS Options:', corsOptions); 

  app.use(cors(corsOptions));

  const server = http.createServer(app); 

  const io = socketIo(server, {
    cors: {
      origin: localIp + ':3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true
    }});

  const PORT = process.env.PORT || 4000;

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

  const defaultQuestions = await Question.find();
  console.log("DQLENGHT: " + defaultQuestions.length);

  const clientQueues = {};
  const catIconDB = await CategoryIcon.find();
  const categoryIcons = catIconDB.map(category => ({
    catName: category.catName,
    iconName: category.iconName
  }));

io.on('connection', (socket) => {

  const clientId = socket.handshake.query.clientId;
  
  console.log('A user connected to socket.IO:', clientId);

  if(!clientQueues[clientId]) clientQueues[clientId] = {
    unusedQuestions: [],
    categories: {},
    cachedQuestions: [],
    username: '',
  };

  const fetchQuestionsByTags = async (tags) => {
    try {
      const matchingQuestions = await Question.find({ tags: { $in: tags } });
      clientQueues[clientId].cachedQuestions = shuffleArray(matchingQuestions);
      clientQueues[clientId].unusedQuestions = [...clientQueues[clientId].cachedQuestions];
      console.log(`Finding questions matching tags for ${clientQueues[clientId]} Length: ${clientQueues[clientId].cachedQuestions.length}`)

    } catch (err) {
      console.error('Failed to fetch questions by tags:', err);
    }
  };

  socket.on('fetchQuestionsByTags', (data) => {
    clientQueues[clientId].categories = data;
    const enabledTags = clientQueues[clientId].categories
    .filter(category => category.enabled)
    .map(category => category._id);

    console.log(enabledTags);
    fetchQuestionsByTags(enabledTags);
  });
  
  socket.on('sendAnswer', (answer) => {
    console.log(`Received answer "${answer}" from controller client ${clientId}`);

  });
  socket.on('nextQuestion', () => {
    let newQuestion = [];
    if (clientQueues[clientId].unusedQuestions.length == 0) {
      console.log(`Cached questions length: ${clientQueues[clientId].cachedQuestions.length}`);
      clientQueues[clientId].unusedQuestions = [...clientQueues[clientId].cachedQuestions];
      console.log(`Created new question queue for ${clientQueues[clientId]}. Length: ${clientQueues[clientId].unusedQuestions.length}`);
      newQuestion = getNewQuestion(clientQueues[clientId]);
    }
    else {newQuestion = getNewQuestion(clientQueues[clientId]);}

    socket.emit('newQuestion', newQuestion);
    console.log('Received newQuestion request from: ', {clientId});

  });
  socket.on('requestDailyChallengeQuestions', () => 
  {
    console.log('test');
    (async () => {
      const dailyQuestionsArray = await DailyChallengeQuestion.find();

      console.log(dailyQuestionsArray);
      socket.emit('sendingDailyChallengeArray', dailyQuestionsArray);
      }
    )
  });

  socket.on('addQuestion', (questionData) => {
    const newQuestion = new Question({
      text: questionData.text,
      correctAnswer: questionData.correctAnswer,
      incorrectAnswers: [questionData.incorrectAnswerOne, questionData.incorrectAnswerTwo],
      tags: questionData.tags.split(',').map(tag => tag.trim()) 
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
        if(clientQueues[clientId].unusedQuestions.length === 0) 
        {
            clientQueues[clientId].unusedQuestions = shuffleArray(await Question.find());
            console.log(`Created default question queue for ${clientId}. Amount of questions: ${clientQueues[clientId].unusedQuestions.length}`);
        }

        if (Object.keys(clientQueues[clientId].categories).length === 0) {
          
          const tagsWithCounts = await Question.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } }  // Sort by count in descending order
          ]);

          const updatedTagsWithCounts = tagsWithCounts.map(tag => {
            const tempTag = { ...tag };
            const categoryIcon = categoryIcons.find(category => category.catName === tempTag._id);
            if (categoryIcon) {
              tempTag.icon = categoryIcon.iconName;
            }
            tempTag.enabled = true;
            return tempTag;
          }); 
          clientQueues[clientId].categories = updatedTagsWithCounts;
          console.log('Enabling all categories for: ', clientId);
        }

        socket.emit('newQuestion', getNewQuestion(clientQueues[clientId]));
        socket.emit('questionCategories', clientQueues[clientId].categories);
        console.log(`Sent new question and question categories to ${clientId} `, clientQueues[clientId].categories);
  
      } catch (err) {
        console.error(`Failed to populate default question queue for ${clientId}:`, err);
      }
    })();
  });

  socket.on('disconnect', () => {
    console.log(`Client ${clientId} disconnected and queue cleaned up`);
  });
}, []);
  // Initialize default question queue on connection
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
initializeServer().catch(error => {
  console.error("Failed to initialize server:", error);
});