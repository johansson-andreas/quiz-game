import {useState, useEffect, useContext} from 'react';
import { Outlet } from 'react-router-dom'; // Outlet is used for nested routing
import HeaderPanel from '../components/HeaderPanel/HeaderPanel.js';
import styles from './Layout.module.css';
import axios from 'axios';
import LoginPanel from '../components/LoginPanel/LoginPanel.js';
import { UserContext } from '../contexts/UserContext.js';

const Layout = () => {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/loginroutes/getUsername'); 
        if (response.data.username) {
          setUser(response.data.username);
          console.log("Setting user to", response.data.username)
        }
        else
        {
          console.log(response)
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };

    fetchUser();
  }, [setUser]);


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
