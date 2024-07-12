import express from 'express';
import passport from 'passport';
import {Account} from '../models/Account.js';

const router = express.Router();

router.post('/register', (req, res) => {
  Account.register(new Account({ username: req.body.username }), req.body.password, (err, account) => {
    if (err) {
      return res.send({ text: err.message });
    }

    passport.authenticate('local')(req, res, () => {
      res.send({ text: "Managed to make account" });
    });
  });
});

router.get('/login', (req, res) => {
  res.render('index', { user: req.user });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send({ user: req.user });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/ping', (req, res) => {
  res.status(200).send("pong!");
});

router.get('/getUsername', (req, res) => {
  res.send({ username: req.user.username });
});

export default router;
