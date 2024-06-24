import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [playerName, changePlayerName] = useState('');
  const [lobbyName, changeLobbyName] = useState('');

  const mpChoice = (e) => {
    navigate('/main');
  };

  const updateName = (event) => {
    changePlayerName(event.target.value);
  };

  const updateLobby = (event) => {
    changeLobbyName(event.target.value);
  };

  return (
    <div>
    <form >
      <label>
        <input
          type="text"
          value={playerName}
          onChange={updateName}
        />
        <input
          type="text"
          value={lobbyName}
          onChange={updateLobby}
        />
      </label>
      <button type="submit">Submit</button>
    </form> 
    </div>
  );
}

export default LandingPage;
