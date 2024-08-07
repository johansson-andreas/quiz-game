import socket from "../Socket.js";
import { useState, useEffect } from "react";

const MultiPlayer = ({lobbyName}) => {

    const [users, setUsers] = useState([]);


    useEffect(() => {
      console.log(users);

    }, [users])

    useEffect(() => {
      socket.emit('getRoomInfo', lobbyName);
      console.log('requesting room info')

      socket.on('sendRoomInfo', (lobbyInfo) => {
        console.log('room info', lobbyInfo);
        setUsers(Object.keys(lobbyInfo.users));
      })
      socket.on('currentUsersInRoom', (currentUsers) => {
        console.log('current users', currentUsers);
        setUsers(currentUsers.array.map(user => ({
          username: user.username,
          score: user.score
        })));
      });

      return () => {
        socket.off('getRoomInfo');
        socket.off('sendRoomInfo')
        socket.off('currentUsersInRoom')
      };
    }, [])


    return (
        <div>
          <h1>MultiPlayer Page</h1>
          <p>Lobby Name: {lobbyName}</p>
          {users ? Object.keys(users).map(user => {
            <div>{user}</div>

          }) : ( <div></div>)}
        </div>
      );
}
export default MultiPlayer;