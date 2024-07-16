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
  const { user, setUser } = useContext(UserContext);
  let loggedIn = false;

  useEffect(() => {
    (user) ? loggedIn = true : loggedIn = false;
    console.log(loggedIn)
    console.log(user);
  }, [user]);

  const logoutUser = async () => {
    try {
      const response = await axios.get('/api/loginRoutes/logout');
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
        <div>
          <Link to="/">Home</Link>
        </div>
        <div style={notLoggedInActive} className={styles.notLoggedIn}>
          <button onClick={togglePanelVisibility} className={styles.toggleButton}>
            Logga in
          </button>
        </div>
        <div style={loggedInActive} className={styles.loggedIn}>
          <div className={styles.usernameDiv}>
            {user}
          </div> 
          <button onClick={logoutUser}>
            Logga ut
          </button>
        </div>
      </div>
    </div>

  )
}

export default HeaderPanel;