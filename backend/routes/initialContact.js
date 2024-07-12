import express from 'express';
import { getNewQuestion, obfQuestion, getNewQuestionQueue } from './routesUtils.js';
import {Question} from '../models/Question.js';
import {CategoryIcon} from '../models/CategoryIcon.js';

const router = express.Router();

router.get('/', async (req, res) => {
  // Access session data 
  const session = req.session;

  if (!session.clientData) {
    session.clientData = {
      unusedQuestions: [],
      categories: {},
      cachedQuestions: [],
      username: '',
      clientId: session.id,
      currentScores: {},
      currentQuestion: {}
    };
    session.save();
  }

  const clientData = session.clientData;

  if (Object.keys(clientData.categories).length === 0) {
    const tagsWithCounts = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } } // Sort by count in descending order
    ]);

    const catIconDB = await CategoryIcon.find();
    const categoryIcons = catIconDB.map(category => ({
      catName: category.catName,
      iconName: category.iconName
    }));

    const updatedTagsWithCounts = tagsWithCounts.map(tag => {
      const tempTag = { ...tag };
      const categoryIcon = categoryIcons.find(category => category.catName === tempTag._id);
      if (categoryIcon) {
        tempTag.icon = categoryIcon.iconName;
      }
      tempTag.enabled = true;
      return tempTag;
    });

    clientData.categories = updatedTagsWithCounts;
  }

  session.save();

  if (clientData.cachedQuestions.length === 0) {
    clientData.cachedQuestions = await getNewQuestionQueue();
  }

  const newQuestion = await getNewQuestion(clientData);

  let scoreArray = null;
  if (Object.keys(session.clientData.currentScores).length > 0) {
    scoreArray = clientData.currentScores;
  }

  res.send({ question: obfQuestion(newQuestion), categories: clientData.categories, scoreArray: scoreArray });
});

export default router;
