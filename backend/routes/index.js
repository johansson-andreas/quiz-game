import express from 'express';
import questionRoutes from './question-routes.js';
import loginRoutes from './login-routes.js';
import dailyChallengeRoutes from './daily-challenge-routes.js';


const router = express.Router();

// Use route modules
router.use('/question-routes', questionRoutes);
router.use('/login-routes', loginRoutes);
router.use('/daily-challenge-routes', dailyChallengeRoutes);


export default router;
