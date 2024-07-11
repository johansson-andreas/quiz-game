// routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const initialContact = require('./initialContact');
const questionRoutes = require('./questionRoutes');


// Use route modules
router.use('/initialContact', initialContact);
router.use('/questionRoutes', questionRoutes);


module.exports = router;
