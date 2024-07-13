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
  const { user } = useContext(UserContext);
  console.log("HeaderPanel username:", user)


  return (
    <div>
      <div className={styles.headerPanel}>
        <div><Link to="/">Home</Link></div>
        <div className="notLoggedIn"><button onClick={togglePanelVisibility} className={styles.toggleButton}>
          Toggle Panel
        </button>
        </div>
        <div className="loggedIn">{user}</div>
      </div>
    </div>
        
      )
}

export default HeaderPanel;