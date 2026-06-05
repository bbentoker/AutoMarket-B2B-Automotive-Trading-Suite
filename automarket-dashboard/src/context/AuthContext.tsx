import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setToken, removeToken, isTokenValid, getUserFromToken } from '../utils/auth';

interface User {
  id: number;
  role: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAuthInitialized: boolean;
  login: (token: string, expirationDate: string) => void;
  logout: () => void;
  checkTokenExpiration: () => void;
  markInitialized: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);

  const redirectToLanding = () => {
    const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3001';
    window.location.href = landingUrl;
  };

  const checkTokenExpiration = () => {
    const valid = isTokenValid();
    
    if (!valid) {
      console.log('❌ Token expired, logging out and redirecting');
      logout();
      redirectToLanding();
    }
  };

  const login = (token: string, expirationDate: string) => {
    console.log('🔐 Login called with:');
    console.log('  Token:', token);
    console.log('  Expiration:', expirationDate);
    
    // Store token in localStorage
    setToken(token, expirationDate);
    
    const userData = getUserFromToken();
    console.log('👤 User data from token:', userData);
    
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ User authenticated successfully');
      console.log('🔍 Auth state after login - isAuthenticated:', true, 'user:', userData);
      
      // URL cleanup is now handled in AuthInitializer after API call
    } else {
      console.log('❌ Failed to extract user data from token');
    }
  };

  const logout = () => {
    console.log('🔐 Logging out user...');
    console.log('🔍 Logout called from:', new Error().stack);
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to landing URL
    console.log('🔄 Redirecting to landing URL...');
    redirectToLanding();
  };

  const markInitialized = () => {
    console.log('✅ Auth initialization marked complete');
    setIsAuthInitialized(true);
  };

  useEffect(() => {
    // Check if there's any authentication data in the URL first
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlLoginToken = params.get('login_token');
    
    if (urlToken || urlLoginToken) {
      console.log('🔍 Authentication data found in URL, skipping localStorage check');
      console.log('  - token:', urlToken ? 'present' : 'not present');
      console.log('  - login_token:', urlLoginToken ? 'present' : 'not present');
      // Don't check localStorage if there's URL authentication data - let AuthInitializer handle it
    } else {
      // Only check localStorage if no URL authentication data exists
      console.log('🔍 No URL authentication data, checking localStorage');
      if (isTokenValid()) {
        const userData = getUserFromToken();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          console.log('🎯 User authenticated on app load from stored token');
        }
      } else {
        console.log('❌ No valid token in localStorage');
      }
    }

    // Set up token expiration check interval
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 5 * 60000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isAuthInitialized,
    login,
    logout,
    checkTokenExpiration,
    markInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 