import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const HeaderPanel = () => {
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
    const handleNavigateHome = () => {
        navigate('/');
      };


      return (
        <div className={styles.loginPanel}>
                <div><Link to="/">Home</Link></div>

                <div className={styles.loginDiv}>
                  <input type='text' placeholder="Användarnamn" 
                  value={chosenAccountname} 
                  onChange = {e => setChosenAccountname(e.target.value)} 
                  className='accountnameField'/>
                  <input type='password' placeholder="Lösenord" 
                  value={chosenPassword} 
                  onChange = {e => setChosenPassword(e.target.value)} 
                  className='passwordField'/>
                  <button onClick={login}>Logga in</button>
                  <button onClick={registerAccount}>Registrera</button>
                </div>

        </div>
      )
}

export default HeaderPanel;