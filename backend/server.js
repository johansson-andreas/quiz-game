const express = require('express');
const { createServer } = require('node:http');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const os = require('os');
const { networkInterfaces } = os;
const { connectDB } = require('./db');
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express(); 
const server = http.createServer(app); 


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
    origin: `http://${localIp}:3000`, // Use LAN IP dynamically
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  };

  console.log('CORS Options:', corsOptions); 

  app.use(cors(corsOptions));


  const io = socketIo(server, {
    cors: {
      origin: `http://${localIp}:3000`,
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true
    }
  });

  const PORT = process.env.PORT || 4000;

  // Session middleware
  const sessionMiddleware = session({
    name: "SESS_NAME",
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collection: "userSessions"
    }),
    cookie: {
      sameSite: false,
      secure: false,
      maxAge: 1000,
      httpOnly: true,
    },
});


  app.use(sessionMiddleware);

  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
  io.use(wrap(sessionMiddleware));

  require('./sockets')(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}
initializeServer().catch(error => {
  console.error("Failed to initialize server:", error);
});
