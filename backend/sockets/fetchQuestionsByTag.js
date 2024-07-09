const Question = require('../models/Question'); 
const { fetchQuestionsByTags } = require('./socketUtils');

module.exports = function(socket, session) {

    let client = session.clientData;
    socket.on('fetchQuestionsByTags', (data) => {
        client.categories = data;
        const enabledTags = client.categories
          .filter(category => category.enabled)
          .map(category => category._id);
        fetchQuestionsByTags(session, enabledTags);
        session.save();

      });
};