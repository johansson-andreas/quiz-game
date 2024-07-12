// routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const initialContact = require('./initialContact');
const questionRoutes = require('./questionRoutes');
const loginRoutes = require('./loginRoutes');



// Use route modules
router.use('/initialContact', initialContact);
router.use('/questionRoutes', questionRoutes);
router.use('/loginRoutes', loginRoutes);


module.exports = router;
