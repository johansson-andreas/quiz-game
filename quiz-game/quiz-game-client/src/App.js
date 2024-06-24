import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SP from './components/SinglePlayer';
import MP from './components/MultiPlayer';
import MPLanding from './components/MultiPlayerLandingPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sp" element={<SP />} />
        <Route path="/mp" element={<MP />} />
        <Route path="/MultiplayerLobby" element={<MPLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
