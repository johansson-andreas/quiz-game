const { shuffleArray, getNewQuestion } = require('./socketUtils');
const Question = require('../models/Question'); 
const CategoryIcon = require('../models/CategoryIcon');


module.exports = function(socket, session) {
  let client = session.clientData;
  socket.on('initialContact', async () => {
    try {
      if (client.unusedQuestions.length === 0) {
        client.unusedQuestions = shuffleArray(await Question.find());
      }

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

      socket.emit('newQuestion', getNewQuestion(client));
      socket.emit('questionCategories', client.categories);

    } catch (err) {
      console.error(`Failed to populate default question queue for ${client}:`, err);
    }
  });
};