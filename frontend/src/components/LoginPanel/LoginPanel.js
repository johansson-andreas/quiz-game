import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPanel.module.css';
import { UserContext } from '../../contexts/UserContext';

const LoginPanel = ({ togglePanelVisibility }) => {
  const navigate = useNavigate();

  const [chosenAccountname, setChosenAccountname] = useState(['']);
  const [chosenPassword, setChosenPassword] = useState(['']);

  const { setUser } = useContext(UserContext);
  const [loginMessage, setLoginMessage] = useState('');


  const registerAccount = async () => {
    try {
      const response = await axios.post('/api/loginRoutes/register', { username: chosenAccountname, password: chosenPassword });
      console.log('Registration successful:', response.data);
      setUser(response.data.username);
      togglePanelVisibility();
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Error response:', error.response.data);
        setLoginMessage(error.response.data.message);

      } else if (error.request) {
        // Request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
    }
  };

  const login = async () => {
    try {
      const response = await axios.post('/api/loginRoutes/login', { username: chosenAccountname, password: chosenPassword });
      console.log('Login successful:', response.data);
      setUser(response.data.username);
      togglePanelVisibility();
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Error response:', error.response.data);
        setLoginMessage(error.response.data.message);

      } else if (error.request) {
        // Request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
    }
  };

  const handleMiddlePanelClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backgroundDiv} onClick={togglePanelVisibility}>
      <div className={styles.middlePanel} onClick={handleMiddlePanelClick}>
        <div className={styles.loginContainer}>
        <div className={styles.loginTextfields}>
          <div className={styles.usernameDiv}>
            <input type='text' placeholder="Användarnamn"
              value={chosenAccountname}
              onChange={e => setChosenAccountname(e.target.value)}
              className='accountnameField' />
          </div>
          <div className={styles.passwordDiv}>
            <input type='password' placeholder="Lösenord"
              value={chosenPassword}
              onChange={e => setChosenPassword(e.target.value)}
              className='passwordField' />
          </div>
        </div>

        <div className={styles.loginButtons}>
          <button onClick={login}>Logga in</button>
          <button onClick={registerAccount}>Registrera</button>
        </div>
        </div>
        <div className={styles.loginMessage}>{loginMessage}</div>
      </div>
    </div>
  )
}

export default LoginPanel;