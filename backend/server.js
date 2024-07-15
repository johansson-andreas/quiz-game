//server.js
// Importing necessary modules
import cors from 'cors';
import { connectDB } from './db.js';
import dotenv from 'dotenv';
import MongoStore from 'connect-mongo';
import express from 'express';
import { createServer } from 'http';
import session from 'express-session';
import routes from './routes/index.js';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import logger from 'morgan';
import {Account} from './models/Account.js'; // Importing Account model
import { Console } from 'console';

// Configure dotenv for environment variables
dotenv.config();

// Create an Express application
const app = express();

// Create an HTTP server
const httpServer = createServer(app);

// Connect to the database
async function initializeServer() {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit process with failure
  }

  // CORS options
  const corsOptions = {
    origin: `http://localhost:3000`,
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  };

  console.log('CORS Options:', corsOptions);

  // Apply middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(logger('dev'));  // Morgan logger middleware
  const PORT = process.env.PORT || 4000;

  // Session middleware configuration
  const sessionMiddleware = session({
    name: "SESS_NAME",
    secret: 'yourSecretKey',
    resave: true,
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

  // Use API routes
  app.use('/api', routes);

  app.use(passport.initialize());
  app.use(passport.session());
  // Passport configuration
  passport.use(new LocalStrategy(Account.authenticate()));
  passport.serializeUser(Account.serializeUser());
  passport.deserializeUser(Account.deserializeUser());

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Initialize the server and handle errors
initializeServer().catch(error => {
  console.error("Failed to initialize server:", error);
});
