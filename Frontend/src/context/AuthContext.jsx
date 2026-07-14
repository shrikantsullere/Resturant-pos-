import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/services/api';
import socketService from '@/sockets/socket.service';

const AuthContext = createContext();

export const roles = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  WAITER: 'WAITER',
  CHEF: 'CHEF',
  CASHIER: 'CASHIER',
  CUSTOMER: 'CUSTOMER',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse saved user', e);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      socketService.connect(user.id);
    }
    return () => socketService.disconnect();
  }, [user?.id]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (googleToken) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google-login', { token: googleToken });
      const { user: userData, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google login failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const appleLogin = useCallback(async (appleToken, appleUser) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/apple-login', { token: appleToken, user: appleUser });
      const { user: userData, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Apple login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Apple login failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    socketService.disconnect();
    window.location.href = '/login';
  }, []);

  const getDashboardPath = useCallback((roleName) => {
    const role = roleName?.toLowerCase().trim();
    const paths = {
      admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      waiter: '/waiter/dashboard',
      chef: '/chef/dashboard',
      cashier: '/cashier/dashboard',
      customer: '/customer/home'
    };
    return paths[role] || '/';
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    login,
    googleLogin,
    appleLogin,
    logout,
    loading,
    getDashboardPath
  }), [user, setUser, login, googleLogin, appleLogin, logout, loading, getDashboardPath]);



  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
