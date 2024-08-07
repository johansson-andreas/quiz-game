import { getNewQuestion, getNewQuestionQueue, sendScoreArray, sendNewQuestion } from './socketUtils.js'
import {Question} from '../models/Question.js';
import {CategoryIcon} from '../models/CategoryIcon.js';



const initialContact = (socket, rooms) => {

  const username = socket.request.session.passport.user;
  console.log('Client', username, 'connected to the server');


  // main namespace
  socket.on('initialContact', async () => {
    try {
    } catch (err) {
    }
  });
};

export default initialContact;