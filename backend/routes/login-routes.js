import express from 'express';
import passport from 'passport';
import { Account } from '../models/Account.js';

const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err); // Forward any error to the error handler
    }
    if (!user) {
      // If !user, check info object for specific reasons
      console.log(info.name);
      if (info && info.name === 'IncorrectUsernameError') {
        return res.status(401).json({ message: 'User not found' });
      }
      if (info && info.name === 'IncorrectPasswordError') {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      // If info.message is not recognized, return a generic message
      return res.status(401).json({ message: 'Authentication failed', info });
    }

    // If user is authenticated successfully, log them in
    req.logIn(user, (err) => {
      if (err) {
        return next(err); // Forward any error to the error handler
      }
      return res.json({ message: 'Authentication succeeded', username: req.user.username });
    });
    
  })(req, res, next);

});

router.post('/register', (req, res) => {
  Account.register(new Account({ username: req.body.username,  dailyChallengeScores: new Map(), categoryStats: new Map()}), req.body.password,(err, account) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    passport.authenticate('local')(req, res, () => {
      res.json({ message: "Account created successfully", username: req.user.username });
    });
  });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logout successfully" });
  });
});

router.get('/ping', (req, res) => {
  res.status(200).send("pong!");
});

router.get('/get-username', (req, res) => {
  if(req.user) res.json({ username: req.user.username });
  else res.json({ message: "Not logged in" })
});

export default router;
