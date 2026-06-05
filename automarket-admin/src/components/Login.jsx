import React, { useState } from 'react';
import { login as apiLogin } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin(username, password);

      if (response.status === 200) {
        const data = await response.json();

        // Debug: Log the response data to understand the format
        console.log('Login response data:', data);

        // Check if the response contains an error in the token object
        if (data.token && data.token.error) {
          alert('Login failed: ' + data.token.error);
          return;
        }

        // Check if the response has a valid token
        if (data.token) {
          // Store token in both formats for compatibility
          let tokenValue = null;

          // If token is a string, it's valid
          if (typeof data.token === 'string') {
            tokenValue = data.token;
          }
          // If token is an object with access_token, it's valid
          else if (data.token.access_token) {
            tokenValue = data.token.access_token;
          }
          // If token is an object, try to extract the actual token
          else if (data.token && Object.keys(data.token).length > 0) {
            tokenValue = data.token.token || data.token;
          }

          if (tokenValue) {
            // Store in both formats for compatibility
            localStorage.setItem('token', tokenValue);
            login(data);
            onLogin();
          } else {
            alert('Login failed: Invalid response format - no valid token received');
          }
        } else {
          alert('Login failed: Invalid response format - no token received');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Login failed: ' + (errorData.message || `HTTP ${response.status}`));
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">Welcome Back</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
