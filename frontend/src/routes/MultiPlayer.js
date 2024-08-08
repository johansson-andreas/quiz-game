import socket from "../Socket.js";
import { useState, useEffect } from "react";

const MultiPlayer = ({ lobbyName }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    console.log("users", Object.keys(users));
  }, [users]);

  useEffect(() => {
    socket.emit("getRoomInfo", lobbyName);
    console.log("requesting room info");

    socket.on("sendRoomInfo", (lobbyInfo) => {
      console.log("room info", lobbyInfo);
      setUsers(lobbyInfo.users);
    });

    socket.on("currentUsersInRoom", (currentUsers) => {
      console.log("current users", currentUsers);
      setUsers(currentUsers);
    });

    return () => {
      socket.emit("leaveRoom");
      socket.off("getRoomInfo");
      socket.off("sendRoomInfo");
      socket.off("currentUsersInRoom");
    };
  }, []);

  return (
    <div>
      <h1>MultiPlayer Page</h1>
      <p>Lobby Name: {lobbyName}</p>
      <div className="questionDiv"></div>
      <div className="mpScoreDiv">
        {users ? (
          Object.keys(users).map((user) => (
            <div key={user} className="userEntry">
              <div className="usernameEntry">{users[user].username}</div>
              <div className="scoreEntry">Score: {users[user].score}</div>
            </div>
          ))
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};
export default MultiPlayer;
