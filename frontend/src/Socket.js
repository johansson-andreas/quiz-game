import { io } from 'socket.io-client';

/*
const socket = io('localhost:4000', {
  transports: ['websocket'], 
  withCredentials: true,
  autoConnect: false
});  
*/



const socket = io('localhost:4000', {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  pingTimeout: 10000,
  pingInterval: 5000,
  autoConnect: false
});  



export default socket;