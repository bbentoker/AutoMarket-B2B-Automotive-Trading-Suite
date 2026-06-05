import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BrowseListings from './pages/BrowseListings';
import CarDetails from './pages/CarDetails';
import { ToastDemo } from './components/ToastDemo';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/toast';
import UnsubscribeNewsletter from './pages/UnsubscribeNewsletter';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <RequireAuth>
                <BrowseListings />
              </RequireAuth>
            } />
            <Route path="/listings/:id" element={
              <RequireAuth>
                <CarDetails />
              </RequireAuth>
            } />
            <Route path="/toast-demo" element={<ToastDemo />} />
            <Route path="/unsubscribe/:contactId" element={<UnsubscribeNewsletter />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
