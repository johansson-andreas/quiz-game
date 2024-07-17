import express from 'express';
import { DailyChallengeQuestions, generateNewQuestions} from '../models/DailyChallengeQuestions.js';
import { getNewQuestion, obfQuestion} from './dailyChallengeRouteUtils.js';
import {getQuestionCategories } from './questionRouteUtils.js'
  
const router = express.Router();


router.get('/initial-contact', async (req, res, next) => {
    try {
        // Check if there is no session data or if the date in session data is different from today
        //TODO: CHANGE TO CHECKING DATABASE FOR ACCOUNT INSTEAD OF USING SESSION DATA
        if (!req.session.dailyChallengeData) {
            const today = new Date(); //Setting todays time to 0s as MongoDB's Date field will always include a time (which we set to 0s when we created todays document)
            today.setHours(0, 0, 0, 0);
            let todaysQuestions = await DailyChallengeQuestions.findOne({ date: today}, 'questionIDs').lean();

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
                todaysScore: 0,
                currentQuestion: {}
            };
            req.session.dailyChallengeData.currentQuestion = await getNewQuestion(req)
        }
        let categories = await getQuestionCategories();
        const initialDataToSend = {
            questionsRemaining: req.session.dailyChallengeData.questionsRemaining,
            todaysScore: req.session.dailyChallengeData.todaysScore,
            currentQuestion: obfQuestion(req.session.dailyChallengeData.currentQuestion)
        }   
        const dailyChallengeData = ({dcd: initialDataToSend, categories: categories});
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

router.post('/submit-answer', async (req, res) => {
    const dailyChallengeData = req.session.dailyChallengeData;
    if(dailyChallengeData) {
      const answer = req.body.submittedAnswer;
      if(answer === dailyChallengeData.currentQuestion.correctAnswer) dailyChallengeData.todaysScore+=1;
  
      res.send({ todaysScore: dailyChallengeData.todaysScore, correctAnswer: dailyChallengeData.currentQuestion.correctAnswer });

    }
  });
  

export default router;