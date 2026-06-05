import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseJwt } from '../utils/auth';
import { submitDealerLoginCode } from './api';


export const initializeAuth = () => {
  // Get token from URL parameters
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const loginCode = params.get('login-code');

  // Handle login-code if present
  if (loginCode) {
    // Remove login-code from URL without reloading the page
    params.delete('login-code');
    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
    window.history.replaceState({}, '', newUrl);
    
    // Handle the login code asynchronously and return auth data
    return handleLoginCode(loginCode);
  }

  if (token) {
    // Parse token to get expiration
    const tokenData = parseJwt(token);
    
    // Calculate expiration date from token data
    let expirationDate;
    if (tokenData.expiresIn) {
      // If token has expiresIn field (e.g., "1h")
      const hours = parseInt(tokenData.expiresIn);
      expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + hours);
    } else if (tokenData.exp) {
      // If token has exp field (unix timestamp)
      expirationDate = new Date(tokenData.exp * 1000);
    } else {
      // Default to 1 hour if no expiration info
      expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);
    }

    // Remove token from URL without reloading the page
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', newUrl);
    
    return { 
      token, 
      expirationDate: expirationDate.toISOString()
    };
  }

  return null;
};


/**
 * Handles login-code parameter from URL
 * Posts the code to auth/dealer/login-code endpoint and logs response
 */
const handleLoginCode = async (loginCode) => {
  try {
    const data = await submitDealerLoginCode(loginCode);
    console.log('Login code response:', data);
    
    // Check if login was successful and token is present
    if (data.message === "Login successful" && data.token) {
      // Parse token to get expiration
      const tokenData = parseJwt(data.token);
      
      // Calculate expiration date from token data
      let expirationDate;
      if (tokenData.exp) {
        // If token has exp field (unix timestamp)
        expirationDate = new Date(tokenData.exp * 1000);
      } else {
        // Default to 1 hour if no expiration info
        expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1);
      }
      
      // Return auth data for login
      return { 
        token: data.token, 
        expirationDate: expirationDate.toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error handling login code:', error);
    throw error;
  }
};



export const AuthInitializer = ({ children }) => {
  const { login } = useAuth();

  useEffect(() => {
    const initializeAuthAsync = async () => {
      const authData = await initializeAuth();
      if (authData) {
        login(authData.token, authData.expirationDate);
      }
    };
    
    initializeAuthAsync();
  }, [login]);

  return children;
}; 