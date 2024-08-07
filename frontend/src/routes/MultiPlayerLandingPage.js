import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import LoginPanel from "../components/LoginPanel/LoginPanel";
import socket from "../Socket";
import "./styles/multiPlayerLandingStyle.css";
import MultiPlayerLobby from "../components/MultiPlayerBody/MultiPlayerLobby";

function LandingPage() {
  const navigate = useNavigate();
  const [playerName, changePlayerName] = useState("");
  const [lobbyName, changeLobbyName] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const location = useLocation();
  const [roomList, setRoomlist] = useState([]);
  const [state, setState] = useState('login');

  const { user } = useContext(UserContext);

  const mpChoice = (e) => {
    navigate("/main");
  };


  useEffect(() => {
    if (location.pathname === "/MultiplayerLobby") {
      if (user) {
        socket.connect();
        console.log("connected to socketio");
        setState('default')
        return () => {
          if (socket.connected) {
            socket.disconnect();
          }
        };
      }
      else { setState('login')}
    }
  }, [user]);



  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div>
      <MultiPlayerLobby state={state} setState={setState}/>
    </div>
  );
}

export default LandingPage;
