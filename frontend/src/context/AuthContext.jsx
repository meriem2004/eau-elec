import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedExpiresAt = localStorage.getItem('tokenExpiresAt');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedExpiresAt) {
        setExpiresAt(Number(storedExpiresAt));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: jwt, user: userData, expiresAt: exp } = response.data;
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    if (exp) {
      setExpiresAt(exp);
      localStorage.setItem('tokenExpiresAt', String(exp));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setExpiresAt(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiresAt');
  };

  // Auto-logout à expiration du token (si expiresAt est fourni par le backend)
  useEffect(() => {
    if (!token || !expiresAt) return undefined;

    const now = Date.now();
    const delay = expiresAt - now;

    if (delay <= 0) {
      logout();
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      logout();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [token, expiresAt]);

  const value = {
    user,
    token,
    expiresAt,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}



