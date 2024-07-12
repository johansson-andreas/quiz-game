// routes/initialContact.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Account = require('../models/Account');


router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.send({text: err.message});
        }

        passport.authenticate('local')(req, res, function () {
            res.send({text: "Managed to make account"}) 
        });
    });
});

router.get('/login', function(req, res) {
    res.render( { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.send({ user : req.user })
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/getUsername', function(req,res){
    res.send({username: req.user.username});

})

module.exports = router;