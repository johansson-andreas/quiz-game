import { io } from 'socket.io-client';


const socket = io('localhost:4000', {
  transports: ['websocket'], 
  withCredentials: true,
});  

/*
const socket = io('192.168.50.95:4000', {
  transports: ['websocket'], 
  withCredentials: true
});  
*/
/*
const socket = io('192.168.1.250:4000', {
  transports: ['websocket'], 
  withCredentials: true,
  query: { clientId }
}); 
*/

