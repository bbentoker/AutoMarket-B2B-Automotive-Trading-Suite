import { useEffect, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseJwt } from '../utils/auth';
import apiService from '../utils/api';

interface AuthInitializerProps {
  children: ReactNode;
}

export const initializeAuth = () => {
  // Get authentication data from URL parameters
  console.log('🔍 initializeAuth called');
  console.log('🔍 window.location.search:', window.location.search);
  
  const params = new URLSearchParams(window.location.search);
  console.log('🔍 URLSearchParams created:', params.toString());
  
  const loginToken = params.get('login_token'); // Login code that needs to be sent to API
  const jwtToken = params.get('token'); // Direct JWT token from backend
  
  console.log('🔍 Login token extracted:', loginToken);
  console.log('🔍 JWT token extracted:', jwtToken);

  if (loginToken) {
    console.log('🚀 Login token found in URL, will use API flow');
    return { loginCode: loginToken, type: 'login_code' };
  } else if (jwtToken) {
    console.log('🚀 JWT token found in URL, will use direct authentication');
    return { token: jwtToken, type: 'jwt_token' };
  }

  return null;
};

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { login, markInitialized, isAuthenticated } = useAuth();

  useEffect(() => {
    // Set a timeout to redirect to login if authentication takes too long
    const authTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        console.log('⏰ Authentication timeout, redirecting to login');
        const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3001';
        window.location.href = landingUrl;
      }
    }, 10000); // 10 second timeout
    console.log('🎬 AuthInitializer useEffect triggered');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 URL search params:', window.location.search);
    console.log('🔍 URL hash:', window.location.hash);
    console.log('🔍 URL pathname:', window.location.pathname);
    console.log('🔍 Current auth state - isAuthenticated:', isAuthenticated);
    
    // Manual URL parsing to debug
    const url = new URL(window.location.href);
    console.log('🔍 Manual URL parsing:');
    console.log('  - searchParams:', url.searchParams.toString());
    console.log('  - has token:', url.searchParams.has('token'));
    console.log('  - token value:', url.searchParams.get('token'));
    
    const authData = initializeAuth();
    console.log('📦 Auth data returned:', authData);
    
    if (authData?.type === 'login_code' && authData.loginCode) {
      console.log('🚀 Login code found, calling API to authenticate...');
      
      // Call the API to get the actual authentication token
      console.log('🚀 Making API call to login endpoint...');
      console.log('📤 Sending login code:', authData.loginCode);
      apiService.loginWithCode(authData.loginCode)
        .then(response => {
          console.log('✅ API response received:', response);
          
          // The response structure is { message, token, user } not { data: { token, user } }
          if (response.token) {
            console.log('🔐 Got authentication token from API, calling login function');
            console.log('👤 User data from API:', response.user);
            
            // Parse the JWT token to get expiration date
            const tokenData = parseJwt(response.token);
            let expirationDate;
            
            if (tokenData?.exp) {
              // Use the expiration from the JWT token
              expirationDate = new Date(tokenData.exp * 1000);
              console.log('⏰ Using JWT expiration date:', expirationDate);
            } else {
              // Fallback to 24 hours if no expiration in token
              expirationDate = new Date();
              expirationDate.setHours(expirationDate.getHours() + 24);
              console.log('⚠️ No expiration in JWT, defaulting to 24 hours');
            }
            
            // Call login with the token from API response
            login(response.token, expirationDate.toISOString());
            
            // Remove login code from URL after successful authentication
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, '', newUrl);
            console.log('🧹 Removed login code from URL');
          } else {
            console.log('❌ No token in API response');
            console.log('📄 Response structure:', response);
          }
        })
        .catch(error => {
          console.error('❌ API call failed:', error);
        });
    } else if (authData?.type === 'jwt_token' && authData.token) {
      console.log('🚀 JWT token found, using direct authentication...');
      console.log('📤 Using JWT token directly:', authData.token);
      
      // Parse the JWT token to get expiration date
      const tokenData = parseJwt(authData.token);
      let expirationDate;
      
      if (tokenData?.exp) {
        // Use the expiration from the JWT token
        expirationDate = new Date(tokenData.exp * 1000);
        console.log('⏰ Using JWT expiration date:', expirationDate);
      } else {
        // Fallback to 24 hours if no expiration in token
        expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        console.log('⚠️ No expiration in JWT, defaulting to 24 hours');
      }
      
      // Call login with the JWT token directly
      login(authData.token, expirationDate.toISOString());
      
      // Remove token from URL after successful authentication
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      console.log('🧹 Removed JWT token from URL');
    } else {
      console.log('❌ No authentication data found, redirecting to login');
      
      // Check if user is already authenticated from localStorage
      const existingToken = localStorage.getItem('token');
      if (!existingToken) {
        console.log('🔄 No existing token found, redirecting to login page');
        const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3001';
        window.location.href = landingUrl;
      } else {
        console.log('✅ Existing token found in localStorage, user should be authenticated');
      }
    }

    // Mark auth initialization as complete
    console.log('🏁 Marking auth initialization as complete');
    markInitialized();
    
    // Clear timeout if user gets authenticated
    if (isAuthenticated) {
      clearTimeout(authTimeout);
    }
    
    // Cleanup timeout on unmount
    return () => {
      clearTimeout(authTimeout);
    };
  }, [login, markInitialized, isAuthenticated]);

  return children;
}; 