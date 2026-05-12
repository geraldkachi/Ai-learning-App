/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useState, useEffect, useContext } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string | null;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}


const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      if (token && userString) {
        const userData = JSON.parse(userString);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuthStatus();
  }, []);


  const login = (userData: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };


  // const login = async (email: string, password: string) => {
  //   try {
  //     const response = await authService.login(email, password);
      
  //     console.log('Login response:', response); // Debug log
      
  //     if (response.success && response.token && response.user) {
  //       // Store in localStorage
  //       localStorage.setItem('token', response.token);
  //       localStorage.setItem('user', JSON.stringify(response.user));
        
  //       // Update state
  //       setUser(response.user);
  //       setIsAuthenticated(true);
        
  //       return response;
  //     } else {
  //       throw new Error(response.message || 'Login failed');
  //     }
  //   } catch (error) {
  //     console.error('Login error in context:', error);
  //     throw error;
  //   }
  // };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const updateUser = (updatedUserData: any) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;