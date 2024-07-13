import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const HeaderPanel = ({ togglePanelVisibility }) => {
    const navigate = useNavigate();

    const handleNavigateHome = () => {
        navigate('/');
      };


      return (
        <div>
          <div className={styles.headerPanel}>
                  <div><Link to="/">Home</Link></div>
                  <div><button onClick={togglePanelVisibility} className={styles.toggleButton}>
                    Toggle Panel
                  </button>
                  </div>
          </div>
        
        </div>
      )
}

export default HeaderPanel;