import React from 'react';
import { useAuth } from '../context/AuthContext';

const RequireAuth = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const landingUrl = import.meta.env.VITE_LANDING_URL;

    if (loading) {
        return <div className="min-h-screen w-screen bg-stone-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>; // Or a proper loading spinner
    }

    if (!isAuthenticated) {
        window.location.href = landingUrl;
        return null;
    }

    return children;
};

export default RequireAuth;
