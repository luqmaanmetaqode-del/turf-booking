import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = 'https://turfx.metaqode.co.in/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const logout = async () => {
    // Notify backend (best-effort — don't block on failure)
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      axios.post(`${API}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
