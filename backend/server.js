const cors = require('cors');
const { connectDB } = require('./db');
require('dotenv').config();
const MongoStore = require('connect-mongo');
const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const session = require("express-session");

const app = express();
const httpServer = createServer(app);

connectDB();

async function initializeServer() {
  await connectDB();

  const corsOptions = {
    origin: `http://localhost:3000`,
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  };

  console.log('CORS Options:', corsOptions);

  app.use(cors(corsOptions));

  const PORT = process.env.PORT || 4000;

   // Session middleware
   const sessionMiddleware = session({
    name: "SESS_NAME",
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collection: "sessions"
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: false, 
      httpOnly: true, 
      path: '/', 
    },
  });

  app.use(sessionMiddleware);

  const io = new Server(httpServer);

  io.engine.use(sessionMiddleware);

  require('./sockets')(io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}

initializeServer().catch(error => {
  console.error("Failed to initialize server:", error);
});
