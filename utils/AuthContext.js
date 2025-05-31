import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await auth.login({ email, password });
      const { token, user: userData } = response.data;
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await auth.signup(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const googleAuth = async (googleData) => {
    try {
      const response = await auth.googleAuth(googleData);
      const { token, user: userData } = response.data;
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Google auth error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Google authentication failed'
      };
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        googleAuth
      }}
    >
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