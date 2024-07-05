import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const spChoice = (event) => {
    navigate('/sp');
  };

  const mpChoice = (e) => {
    navigate('/daily');
  };

  return (
    <div>
      <button onClick={spChoice}>Spela själv</button>
      <button onClick={mpChoice}>Dagens frågor</button>
    </div>
  );
}

export default LandingPage;
