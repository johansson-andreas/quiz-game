const { getNewQuestion, getNewQuestionQueue, shuffleArray } = require('./socketUtils');
const Question = require('../models/Question'); 
const CategoryIcon = require('../models/CategoryIcon');


module.exports = function(socket, session) {
  let client = session.clientData;
  socket.on('initialContact', async () => {
    try {

      if (Object.keys(client.categories).length === 0) {
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

        client.categories = updatedTagsWithCounts;
      }
      session.save();

      if(client.cachedQuestions.length === 0) client.cachedQuestions = await getNewQuestionQueue();

      let newQuestion = await getNewQuestion(client)
      const obsOptionsQuestion = {
        text: newQuestion.text,
        tags: newQuestion.tags,
        choices: [...newQuestion.incorrectAnswers, newQuestion.correctAnswer],
      }

      socket.emit('newQuestion', obsOptionsQuestion);
      socket.emit('questionCategories', client.categories);

    } catch (err) {
      console.error(`Failed to populate default question queue for ${client}:`, err);
    }
  });
};