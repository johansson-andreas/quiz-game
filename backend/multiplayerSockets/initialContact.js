const initialContact = (socket, rooms) => {

  if(socket.request.session.passport) 
    {
      const username = socket.request.session.passport.user;
  console.log('Client', username, 'connected to the server');


  // main namespace
  socket.on('initialContact', async () => {
    try {
    } catch (err) {
    }
  });
}
};

export default initialContact;