const Question = require('../models/Question'); 
const { shuffleArray } = require('./socketUtils');

module.exports = function(socket, session) {
    let client = session.clientData;
    const fetchQuestionsByTags = async (tags) => {
        try {
          const matchingQuestions = await Question.find({ tags: { $in: tags } });
          client.cachedQuestions = shuffleArray(matchingQuestions);
          client.unusedQuestions = [...client.cachedQuestions];
        } catch (err) {
          console.error('Failed to fetch questions by tags:', err);
        }
      };

    socket.on('fetchQuestionsByTags', (data) => {
        client.categories = data;
        const enabledTags = client.categories
          .filter(category => category.enabled)
          .map(category => category._id);
  
        fetchQuestionsByTags(enabledTags);
        session.save();

      });
};