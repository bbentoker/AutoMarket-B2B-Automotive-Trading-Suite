import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken, isTokenValid, getUserFromToken, parseJwt } from '../utils/auth';
import { submitDealerLoginCode } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check URL parameters first
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      const loginCode = params.get('login-code');

      try {
        if (loginCode) {
          // Handle login-code
          params.delete('login-code');
          const newSearch = params.toString();
          const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
          window.history.replaceState({}, '', newUrl);

          const data = await submitDealerLoginCode(loginCode);
          if (data.message === "Login successful" && data.token) {
            const tokenData = parseJwt(data.token);
            let expirationDate;
            if (tokenData.exp) {
              expirationDate = new Date(tokenData.exp * 1000);
            } else {
              expirationDate = new Date();
              expirationDate.setHours(expirationDate.getHours() + 1);
            }
            login(data.token, expirationDate.toISOString());
            setLoading(false);
            return;
          }
        } else if (tokenFromUrl) {
          // Handle token from URL
          const tokenData = parseJwt(tokenFromUrl);
          let expirationDate;
          if (tokenData.expiresIn) {
            const hours = parseInt(tokenData.expiresIn);
            expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + hours);
          } else if (tokenData.exp) {
            expirationDate = new Date(tokenData.exp * 1000);
          } else {
            expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 1);
          }

          // Remove token from URL
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', newUrl);

          login(tokenFromUrl, expirationDate.toISOString());
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      }

      // 2. Fallback to local storage check
      if (isTokenValid()) {
        setUser(getUserFromToken());
      } else {
        removeToken();
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token, expirationDate) => {
    setToken(token, expirationDate);
    setUser(getUserFromToken());
  };

  const logout = () => {
    removeToken();
    setUser(null);
    // window.location.href = import.meta.env.VITE_LANDING_URL;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
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