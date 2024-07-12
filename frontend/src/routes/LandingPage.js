import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPanel from '../components/loginComponent';

function LandingPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(['']);

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

      <div>{username} </div>
      <LoginPanel />
    </div>
  );
}

export default LandingPage;
