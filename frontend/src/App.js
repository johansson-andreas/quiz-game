import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './routes/LandingPage.js';
import SP from './routes/SinglePlayer.js';
import MP from './routes/MultiPlayer.js';
import MPLanding from './routes/MultiPlayerLandingPage.js';
import Admin from './routes/AdminPage.js';
import DailyChallengeLanding from './routes/DailyChallengeLanding.js'; 
import socket from './components/Socket';

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sp" element={<SP />} />
        <Route path="/mp" element={<MP />} />
        <Route path="/MultiplayerLobby" element={<MPLanding />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/daily" element={<DailyChallengeLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
