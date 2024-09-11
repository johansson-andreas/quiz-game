import React, { useState, useEffect } from 'react';
import LoginPanelComponent from './LoginPanelComponent';
import DefaultComponent from './DefaultComponent';
import CreateLobbyComponent from './CreateLobbyComponent';
import socket from '../../Socket';
import styles from './MultiPlayerLobby.module.css';

const MultiPlayerLobby = ({ state, setState, joinedLobby }) => {
  const [playerName, changePlayerName] = useState('');
  const [joinLobbyName, setJoinLobbyName] = useState('');
  const [chosenWinCon, setChosenWinCon] = useState('correctCon');
  const [createLobbyName, setCreateLobbyName] = useState('');
  const [correctWinConNumber, setCorrectWinConNumber] = useState(10);
  const [amountWinConNumber, setAmountWinConNumber] = useState(15);
  const [newLobbyPassword, setNewLobbyPassword] = useState('');
  const [newLobbyTimer, setNewLobbyTimer] = useState(5);
  const [joinLobbyPassword, setJoinLobbyPassword] = useState('');
  const [currentLobby, setCurrentLobby] = useState(null);
  const [users, setUsers] = useState([]);
  const [lobbyCreateErrorText, setLobbyCreateErrorText] = useState('');

  const updateLobbyName = (event) => {
    setJoinLobbyName(event.target.value);
  };

  const updateLobbyPassword = (event) => {
    setJoinLobbyPassword(event.target.value);
  };

  const newLobbyCreator = () => {
    setState('create');
  };

  const createNewLobby = (event) => 
    {
      setJoinLobbyName(createLobbyName)
      setJoinLobbyPassword(joinLobbyPassword)
      const newLobby = {
        lobbyName:createLobbyName,
        chosenWinCon:chosenWinCon,
        winConNumber: chosenWinCon === 'correctCon' ? correctWinConNumber : amountWinConNumber,
        password: newLobbyPassword,
        questionTimer: newLobbyTimer
      }
      event.preventDefault();
      const response = socket.emit('createNewLobby', newLobby);
      console.log('creating new lobby', response)
    }
  const joinExLobby = (e, lobbyName) => 
    {
      e.preventDefault();
      joinLobby(lobbyName, joinLobbyPassword);
    }
  const joinLobby = (lobbyName, joinLobbyPassword) => {
    socket.emit('joinLobby', {lobbyName, joinLobbyPassword});
    console.log('trying to join', lobbyName, 'password', joinLobbyPassword);
  };

  useEffect(() => {
    socket.on('createdNewLobby', (data) => {
      if(data == "A lobby with that name already exists")
        {
          setLobbyCreateErrorText(data);
        }
        else
        {
          console.log('New lobby created:', data.newLobby);
          socket.emit('joinLobby', {lobbyName: data.newLobby.lobbyName, joinLobbyPassword:data.newLobby.password});
          setState('default');
        }

    });

    socket.on('lobbyJoinTry', (lobbyName) => {
      if(lobbyName) {
        joinedLobby(lobbyName)
    }});

    return () => {
      socket.off('createdNewLobby');
      socket.off('currentUsersInRoom');
    };
  }, []);


  const updateChosenWinCon = (event) => {
    setChosenWinCon(event.target.value);
  };

  const renderContent = () => {
    switch (state) {
      case 'login':
        return <LoginPanelComponent />;
      case 'default':
        return (
          <>
          <DefaultComponent
            createNewLobby={newLobbyCreator}
            updateLobbyName={updateLobbyName}
            joinExLobby={joinExLobby}
            joinLobbyName={joinLobbyName}
            updateLobbyPassword={updateLobbyPassword}
          />
          </>
        );
      case 'create':
        return (
          <CreateLobbyComponent
            createNewLobby={createNewLobby}
            createLobbyName={createLobbyName}
            setCreateLobbyName={setCreateLobbyName}
            chosenWinCon={chosenWinCon}
            updateChosenWinCon={updateChosenWinCon}
            setState={setState}
            setAmountWinConNumber={setAmountWinConNumber}
            setCorrectWinConNumber={setCorrectWinConNumber}
            setNewLobbyPassword={setNewLobbyPassword}
            newLobbyPassword={newLobbyPassword}
            newLobbyTimer={newLobbyTimer}
            setNewLobbyTimer={setNewLobbyTimer}
            lobbyCreateErrorText={lobbyCreateErrorText}
          />
        );
      default:
        return <div>Oopsie this is not supposed to happen</div>;
    }
  };

  return (
    <div className={styles.mainBody}>
      <div className={styles.mainForm}>{renderContent()}</div>
    </div>
  );
};

export default MultiPlayerLobby;