import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthInitialized } = useAuth();

  if (!isAuthInitialized) {
    console.log('⏳ Waiting for auth initialization...');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Auth initialized, rendering app');
  return <>{children}</>;
}; 