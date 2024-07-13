import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPanel.module.css';

const LoginPanel = ({ togglePanelVisibility }) => {
    const navigate = useNavigate();

    const [chosenAccountname, setChosenAccountname] = useState(['']);
    const [chosenPassword, setChosenPassword] = useState(['']);
    
    const registerAccount = async () => {
      const response = await axios.post('/api/loginRoutes/register', {username: chosenAccountname, password: chosenPassword})
      console.log(response.data.text)
    }
    const login = async () => {
        const response = await axios.post('/api/loginRoutes/login', {username: chosenAccountname, password: chosenPassword})
        console.log(response);
        console.log('Logged in as', response.data.user.username)
    }
    const handleMiddlePanelClick = (e) => {
      e.stopPropagation(); 
  };

      return (
        <div className={styles.backgroundDiv} onClick={togglePanelVisibility}>
          <div className={styles.middlePanel} onClick={handleMiddlePanelClick}>
            <div className={styles.loginContainer}>
              <div className={styles.loginPanel}>
                <div className={styles.loginElement}>
                  <input type='text' placeholder="Användarnamn" 
                  value={chosenAccountname} 
                  onChange = {e => setChosenAccountname(e.target.value)} 
                  className='accountnameField'/>
                </div>
                <div>
                  <input type='password' placeholder="Lösenord" 
                  value={chosenPassword} 
                  onChange = {e => setChosenPassword(e.target.value)} 
                  className='passwordField'/>
                  <button onClick={login}>Logga in</button>
                  <button onClick={registerAccount}>Registrera</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
}

export default LoginPanel;