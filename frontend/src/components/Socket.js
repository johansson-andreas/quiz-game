import Cookies from 'js-cookie';
import { io } from 'socket.io-client';

let clientId = Cookies.get('clientId');

const generateUniqueID = () => {
  return 'id-' + Math.random().toString(36).substr(2, 16);
};
/*
const socket = io('192.168.50.95:4000', {
  transports: ['websocket'], 
  withCredentials: true,
  query: { clientId }
});  */
const socket = io('192.168.1.250:4000', {
  transports: ['websocket'], 
  withCredentials: true,
  query: { clientId }
}); 

if (!clientId) {
  clientId = generateUniqueID();
  Cookies.set('clientId', clientId, { expires: 365 }); // Expires in 1 year
}

export default socket;