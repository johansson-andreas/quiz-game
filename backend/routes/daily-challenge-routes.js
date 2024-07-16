import express from 'express';
import { DailyChallengeQuestions, generateNewQuestions} from '../models/DailyChallengeQuestions.js';
  
const router = express.Router();


router.get('/request-daily-questions', async (req, res, next) => {
    try {
        // Check if there is no session data or if the date in session data is different from today
        if (!req.session.dailyChallengeData || req.session.dailyChallengeData.date !== new Date().toDateString()) {
            let todaysQuestions = await DailyChallengeQuestions.findOne({ date: new Date() }, 'questionIDs').lean();

            if (!todaysQuestions) {
                // If no questions found for today, generate new questions
                console.log('No daily questions found, generating new questions')
                const questionIds = await generateNewQuestions();
                todaysQuestions = { questionIDs: questionIds };
            }

            // Update session data
            req.session.dailyChallengeData = {
                date: new Date(),
                todaysQuestions: todaysQuestions.questionIDs
            };
        }

        const dailyChallengeData = req.session.dailyChallengeData;
        res.json(dailyChallengeData);
    } catch (error) {
        console.error('Error in requestDailyQuestions:', error);
        res.status(500).json({ error: 'Failed to fetch daily challenge questions' });
    }
});

export default router;