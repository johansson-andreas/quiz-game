import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const spChoice = (event) => {
    navigate('/sp');
  };

  const mpChoice = (e) => {
    navigate('/MultiplayerLobby');
  };

  return (
    <div>
      <button onClick={spChoice}>SP</button>
      <button onClick={mpChoice}>MP</button>
    </div>
  );
}

export default LandingPage;
