import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentHash = window.location.hash.replace('#', '') || '/';
      const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      if (authPaths.some((p) => currentHash.startsWith(p))) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      try {
        const response = await api.get('/user');
        setUser(response.data);
      } catch {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  };

  const isAdmin = () => user?.roles?.some((r) => r.name === 'admin') ?? false;

  const logout = async () => {
    try { await api.post('/logout'); } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
