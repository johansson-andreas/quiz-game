import express from 'express';
import { DailyChallengeQuestions, generateNewQuestions} from '../models/DailyChallengeQuestions.js';
import { getNewQuestion, obfQuestion} from './dailyChallengeRouteUtils.js';
  
const router = express.Router();


router.get('/initial-contact', async (req, res, next) => {
    try {
        // Check if there is no session data or if the date in session data is different from today
        //TODO: CHANGE TO CHECKING DATABASE FOR ACCOUNT INSTEAD OF USING SESSION DATA
        if (!req.session.dailyChallengeData) {
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
                questionsRemaining: todaysQuestions.questionIDs,
                todaysScore: 0
            };
        }

        const dailyChallengeData = req.session.dailyChallengeData;
        res.json(dailyChallengeData);
    } catch (error) {
        console.error('Error in requestDailyQuestions:', error);
        res.status(500).json({ error: 'Failed to fetch daily challenge questions' });
    }
});
router.get('/request-question', async (req, res, next) => {
    try {
        const newQuestion = await getNewQuestion(req)
        console.log('rq newquestion', newQuestion)

        res.json(obfQuestion(newQuestion));
    }
    catch (error) {
        console.error('Error in requestDailyQuestions:', error);
        res.status(500).json({ error: 'Failed to fetch new daily question' });
    }
});

export default router;