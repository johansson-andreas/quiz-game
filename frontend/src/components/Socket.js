import io from 'socket.io-client';

const socket = io('localhost:4000', {
  transports: ['websocket'], 
  withCredentials: true
}); 

export default socket;