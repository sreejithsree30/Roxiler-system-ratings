import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log(error)
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signup = async (name, email, password, address) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, address });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors.join(', ')
          : 'Signup failed')
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updatePassword = async (password) => {
    try {
      await api.put(`/users/${user?.id}/password`, { password });
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors.join(', ')
          : 'Password update failed')
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updatePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
