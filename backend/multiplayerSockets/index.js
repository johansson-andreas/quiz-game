import initialContact from './initialContact.js';
import { roomEvents } from './roomEvents.js';

const sockets = (io) => {

  const rooms = [];

  io.on('connection', (socket) => {

    initialContact(socket, rooms);
    roomEvents(socket, rooms, io);
    

    socket.on('disconnect', () => {
      if(socket.request.session.passport) console.log('Client', socket.request.session.passport.user, 'disconnected from the server');
    });
  });
};

export default sockets;
