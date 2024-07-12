import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginPanel = () => {
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
    const changeChosenAccountname = async (e) => {
        setChosenAccountname(e.target.value);
    };
    useEffect(() => 
    {
        console.log(chosenAccountname)
    }, [chosenAccountname])


      return (
        <div>
                <input type='text' placeholder="Användarnamn" 
                value={chosenAccountname} 
                onChange = {e => setChosenAccountname(e.target.value)} />
                <input type='text' placeholder="Lösenord" 
                value={chosenPassword} 
                onChange = {e => setChosenPassword(e.target.value)} />
                <button onClick={login}>Logga in</button>
                <button onClick={registerAccount}>Registrera</button>

        </div>
      )
}

export default LoginPanel;