import { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [role, setRole] = useState();


  return (
    <UserContext.Provider value={{ user, setUser, role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};
