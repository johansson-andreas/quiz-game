import io from 'socket.io-client';

const socket = io('192.168.50.95:4000', {
  transports: ['websocket'], 
  withCredentials: true
}); 

export default socket;