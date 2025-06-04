import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './api';
import { Alert } from 'react-native';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
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
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials. Please try again.'
      );
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await auth.signup(userData);
      
      if (response.data.requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true,
          data: response.data 
        };
      }
      
      const { token, user: newUser } = response.data;
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, data: response.data };
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        error.message || 'Unable to create account. Please try again.'
      );
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const verifyPhone = async (phoneNumber, code) => {
    try {
      const response = await auth.verifyPhone({ phoneNumber, code });
      return { success: true, data: response.data };
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error.message || 'Unable to verify phone number. Please try again.'
      );
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await users.updateProfile(profileData);
      const updatedUser = response.data;
      
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, data: updatedUser };
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error.message || 'Unable to update profile. Please try again.'
      );
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        verifyPhone,
        updateProfile,
        checkUser
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