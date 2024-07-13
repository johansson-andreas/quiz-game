import {useState} from 'react';
import { Outlet } from 'react-router-dom'; // Outlet is used for nested routing
import HeaderPanel from '../components/HeaderPanel/HeaderPanel.js';
import styles from './Layout.module.css';
import axios from 'axios';
import LoginPanel from '../components/LoginPanel/LoginPanel.js';

const Layout = () => {

  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const togglePanelVisibility = () => {
    setIsPanelVisible(prev => !prev);
  };


  return (
    <div className={styles.layout}>
      <HeaderPanel togglePanelVisibility={togglePanelVisibility} />
      <main>
        {/* Conditional rendering of the panel */}
        {isPanelVisible && (
          <LoginPanel togglePanelVisibility={togglePanelVisibility} />
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
