import initialContact from './initialContact.js';
import { roomEvents } from './roomEvents.js';

const sockets = (io) => {

  const rooms = [];

  io.on('connection', (socket) => {

    initialContact(socket, rooms);
    roomEvents(socket, rooms, io);
    

    socket.on('disconnect', () => {
      console.log('Client', socket.request.session.passport.user, 'disconnected from the server');
    });
  });
};

export default sockets;
