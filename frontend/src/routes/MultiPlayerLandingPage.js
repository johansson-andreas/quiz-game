import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import socket from "../Socket";
import "./styles/multiPlayerLandingStyle.css";
import MultiPlayerLobby from "../components/MultiPlayerBody/MultiPlayerLobby";
import MultiPlayer from "../components/MultiPlayerBody/MultiPlayer";

function LandingPage() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const location = useLocation();
  const [state, setState] = useState("login");
  const [currentLobbyName, setCurrentLobbyName] = useState("");

  const { user } = useContext(UserContext);

  const joinedLobby = (lobbyName) => {
    setCurrentLobbyName(lobbyName);
    setState("inGame");
  };

  useEffect(() => {
    if (location.pathname === "/MultiplayerLobby") {
      if (user) {
        socket.connect();
        setState("default");
        return () => {
          if (socket.connected) {
            socket.disconnect();
          }
        };
      } else {
        setState("login");
      }
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
    <>
      {state !== "inGame" ? (
        <MultiPlayerLobby
          state={state}
          setState={setState}
          joinedLobby={joinedLobby}
        />
      ) : (
        <MultiPlayer lobbyName={currentLobbyName} />
      )}
    </>
  );
}

export default LandingPage;
