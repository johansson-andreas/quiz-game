import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import LoginPanel from "../components/LoginPanel/LoginPanel";
import socket from "../Socket";
import "./styles/multiPlayerLandingStyle.css";

function LandingPage() {
  const navigate = useNavigate();
  const [playerName, changePlayerName] = useState("");
  const [lobbyName, changeLobbyName] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const location = useLocation();
  const [roomList, setRoomlist] = useState([]);

  const { user } = useContext(UserContext);

  const mpChoice = (e) => {
    navigate("/main");
  };

  const updateLobby = (event) => {
    changeLobbyName(event.target.value);
  };
  const createNewLobby = () => {
    socket.emit('createNewLobby', "Test3")
  };



  useEffect(() => {
    if (location.pathname === "/MultiplayerLobby") {
      if (user) {
        socket.connect();
        console.log("connected to socketio");

        return () => {
          if (socket.connected) {
            socket.disconnect();
          }
        };
      }
    }
  }, [user]);

  const getEntryStyle = (index) => {
    if(index % 2 == 0) return 'lobbyEntry evenEntry';
    else return 'lobbyEntry oddEntry';

  }

  const joinLobby = (lobbyName) => {
      console.log(lobbyName)
  }

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("listOfCurrentRooms", (rooms) => {
      console.log("Received list of room:", rooms);
      setRoomlist(rooms);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {}, [roomList]);

  return (
    <div>
      {user ? (
        <div id="mainBody">
          <div id="mainForm">
            <button onClick={createNewLobby} id="newLobbyButton">
              Skapa nytt rum
            </button>
            <div id="mainLobbyDiv">
              <div id="roomTitle">Nuvarande rum: </div>{" "}
              <div id="lobbiesDiv">
                {roomList.map((room, index) => (
                  <div className={getEntryStyle(index)} key={room} onClick={() => joinLobby(room)}>
                    {" "}
                    <label >{room}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <LoginPanel />{" "}
        </div>
      )}
    </div>
  );
}

export default LandingPage;
