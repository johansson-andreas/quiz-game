import express from 'express';
import {createClientData, getNewQuestion, obfQuestion } from './routesUtils.js';

const router = express.Router();

router.get('/', async (req, res) => {
  // Access session data 
  await createClientData(req);
  const newQuestion = await getNewQuestion(req.session.clientData);

  res.send({ question: obfQuestion(newQuestion), categories: req.session.clientData.categories, scoreArray: req.session.clientData.currentScores });
});

export default router;
