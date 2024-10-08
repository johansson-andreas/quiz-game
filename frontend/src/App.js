import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameModePanel from './components/GameModePanel/GameModePanel.js';
import NewPage from './routes/NewPage.js';
import SP from './routes/SinglePlayer.js';
import MPLanding from './routes/MultiPlayerLandingPage.js';
import DailyChallenge from './routes/DailyChallenge.js'; 
import Layout from './layouts/Layout.js';
import { UserProvider } from './contexts/UserContext.js';
import QuestionForm from './routes/QuestionForm.js';
import ProfilePage from './routes/ProfilePage.js';
import AdminPage from './routes/AdminPage.js';
import MultiPlayer from './components/MultiPlayerBody/MultiPlayer.js';
import Gauntlet from './routes/Gauntlet/Gauntlet.js';

import './App.css';

import 'bootstrap/dist/css/bootstrap.css';



const App = () => {
  
  return (
    <UserProvider>
    <Router>
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<GameModePanel />} />
        <Route path="/sp" element={<SP />} />
        <Route path="/MultiplayerLobby" element={<MPLanding />} />
        <Route path="/QuestionForm" element={<QuestionForm />} />
        <Route path="/NewPage" element={<NewPage />} />

        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/Admin" element={<AdminPage />} />
        <Route path="/MultiPlayer" element={<MultiPlayer />} />
        <Route path="/Gauntlet" element={<Gauntlet />} />

        </Route>
      </Routes>
    </Router>
    </UserProvider>

  );
}

export default App;
