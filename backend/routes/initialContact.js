import express from 'express';
import {getNewQuestion, obfQuestion } from './questionUtils.js';
import {createClientData} from './loginUtils.js'

const router = express.Router();

router.get('/', async (req, res) => {
  // Access session data 
  await createClientData(req);
  const newQuestion = await getNewQuestion(req.session.clientData);
  console.log(req.user);
  res.send({ question: obfQuestion(newQuestion), categories: req.session.clientData.categories, scoreArray: req.session.clientData.currentScores });
});

export default router;
