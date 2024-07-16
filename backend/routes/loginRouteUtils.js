import {Question} from '../models/Question.js';
import {CategoryIcon} from '../models/CategoryIcon.js';
import { getNewQuestionQueue } from './questionRouteUtils.js';

export const createClientData = async (req) => {
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
  
    if (clientData.cachedQuestions.length === 0) {
      clientData.cachedQuestions = await getNewQuestionQueue();
    }
  
    let scoreArray = null;
    if (Object.keys(session.clientData.currentScores).length > 0) {
      scoreArray = clientData.currentScores;
    }
  }