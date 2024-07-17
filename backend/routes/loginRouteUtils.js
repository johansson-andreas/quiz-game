
import { getNewQuestionQueue, getQuestionCategories } from './questionRouteUtils.js';

export const createClientData = async (req) => {
  console.log('Creating new client data')
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
  
    getQuestionCategories();
  
    if (Object.keys(clientData.categories).length === 0) {
  
      clientData.categories = await getQuestionCategories();

      clientData.categories.map(category => category.enabled = true)
    }
  
    if (clientData.cachedQuestions.length === 0) {
      clientData.cachedQuestions = await getNewQuestionQueue();
    }
  
    let scoreArray = null;
    if (Object.keys(session.clientData.currentScores).length > 0) {
      scoreArray = clientData.currentScores;
    }
  }