import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SP from './pages/SinglePlayer';
import MP from './pages/MultiPlayer';
import MPLanding from './pages/MultiPlayerLandingPage';
import Admin from './pages/AdminPage';
import DailyChallengeLanding from './pages/DailyChallengeLanding.js'; 
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
