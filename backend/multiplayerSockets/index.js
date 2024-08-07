import initialContact from './initialContact.js';
import { submittedAnswer, getQueueByTags, getNewQuestionRequest } from './questionEvents.js';
import { createNewLobby } from './roomEvents.js';

const sockets = (io) => {

  const rooms = [];

  io.on('connection', (socket) => {

    const session = socket.request.session;

    initialContact(socket, rooms);
    createNewLobby(socket, rooms, io);
    

    socket.on('disconnect', () => {
      console.log('Client', socket.request.session.passport.user, 'disconnected from the server');
    });
  });
};

export default sockets;
