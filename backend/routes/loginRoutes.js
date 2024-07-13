import express from 'express';
import passport from 'passport';
import { Account } from '../models/Account.js';

const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err); 
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed', info });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err); 
      }
      return res.json({ message: 'Authentication succeeded', user });
    });
  })(req, res, next);
});

router.post('/register', (req, res) => {
  Account.register(new Account({ username: req.body.username }), req.body.password, (err, account) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    passport.authenticate('local')(req, res, () => {
      res.json({ message: "Account created successfully" });
    });
  });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.redirect('/');
  });
});

router.get('/ping', (req, res) => {
  res.status(200).send("pong!");
});

router.get('/getUsername', (req, res) => {
  res.send({ username: req.user.username });
});

export default router;
