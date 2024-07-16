import express from 'express';
import initialContact from './initialContact.js';
import questionRoutes from './questionRoutes.js';
import loginRoutes from './loginRoutes.js';
import dailyChallengeRoutes from './dailyChallengeRoutes.js';


const router = express.Router();

// Use route modules
router.use('/initialContact', initialContact);
router.use('/questionRoutes', questionRoutes);
router.use('/loginRoutes', loginRoutes);
router.use('/dailyChallengeRoutes', dailyChallengeRoutes);


export default router;
