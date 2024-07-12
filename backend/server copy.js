const cors = require('cors');
const { connectDB } = require('./db');
require('dotenv').config();
const MongoStore = require('connect-mongo');
const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const path = require('path');
const session = require("express-session");
const routes = require('./routes')
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

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

  // view engine setup

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
  app.use(express.json());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());


  app.use('/api', routes);

  const Account = require('./models/Account');
  passport.use(new LocalStrategy(Account.authenticate()));
  passport.serializeUser(Account.serializeUser());
  passport.deserializeUser(Account.deserializeUser());

  const io = new Server(httpServer);
  io.engine.use(sessionMiddleware); // SocketIO wrapper
  require('./sockets')(io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}

initializeServer().catch(error => {
  console.error("Failed to initialize server:", error);
});
