import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet is used for nested routing
import HeaderPanel from '../components/HeaderPanel/HeaderPanel.js';

const Layout = () => {
  return (
    <div>
      <header>
        {/* Your static header content */}
        <HeaderPanel />
      </header>
      <main>
        {/* Outlet renders the nested route components */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
