import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedAuth = localStorage.getItem('authData');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        // Check if the stored auth is still valid
        const now = new Date();
        const expirationDate = new Date(parsedAuth.expirationDate);
        if (now < expirationDate) {
          setAuthData(parsedAuth);
        } else {
          // Remove expired auth data
          localStorage.removeItem('authData');
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('authData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data) => {
    // Add expiration date (e.g., 24 hours from now)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);

    const authInfo = {
      ...data,
      expirationDate: expirationDate.toISOString(),
    };

    setAuthData(authInfo);
    localStorage.setItem('authData', JSON.stringify(authInfo));
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem('authData');
    localStorage.removeItem('token'); // Also remove direct token for compatibility
  };

  const isSigned = () => {
    if (!authData) return false;
    const now = new Date();
    const expirationDate = new Date(authData.expirationDate);
    return now < expirationDate;
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout, isSigned, isLoading }}>
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
