import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import styles from './Header.module.css';

const HeaderPanel = ({ togglePanelVisibility }) => {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleNavigateProfile = () => {
    navigate('/profile');
  };

  const { user, setUser } = useContext(UserContext);
  let loggedIn = false;

  useEffect(() => {
    (user) ? loggedIn = true : loggedIn = false;
  }, [user]);

  const logoutUser = async () => {
    try {
      const response = await axios.get('/api/login-routes/logout');
      console.log('Logout successful:', response.data);
      setUser('');
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
    }
  };


  const notLoggedInActive = {
    display: user ? 'none' : 'block'
  };
  const loggedInActive = {
    display: user ? 'inline-flex' : 'none'
  };


  return (
    <div>
      <div className={styles.headerPanel}>
        <div className={styles.homeButton} onClick={handleNavigateHome}>
          Home
        </div>
        <div style={notLoggedInActive} className={styles.loginButton} onClick={togglePanelVisibility} >
            Logga in
        </div>
        <div style={loggedInActive} className={styles.loggedIn}>
          <div className={styles.usernameDiv} onClick={handleNavigateProfile}>
            {user}
          </div> 
          <div className={styles.logoutButton} onClick={logoutUser} >
          Logga ut
          </div>
        </div>
      </div>
    </div>

  )
}

export default HeaderPanel;