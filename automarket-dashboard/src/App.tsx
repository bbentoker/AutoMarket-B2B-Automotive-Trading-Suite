import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthInitializer } from './components/AuthInitializer';
import { AuthGuard } from './components/AuthGuard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import ReservedCars from './pages/ReservedCars';
import PurchasedCars from './pages/PurchasedCars';
import CarTrackerStatus from './pages/CarTrackerStatus';
import MyOffers from './pages/MyOffers';
import Invoices from './pages/Invoices';
import SavedCars from './pages/SavedCars';
import FastestSelling from './pages/FastestSelling';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <AuthProvider>
      <AuthInitializer>
        <AuthGuard>
          <Router>
            <div className="min-h-screen font-dm-sans" style={{ backgroundColor: '#F4F7FE' }}>
              <Sidebar 
                isMobileMenuOpen={isMobileMenuOpen} 
                onMobileMenuClose={handleMobileMenuClose}
              />
              <Header onMobileMenuToggle={handleMobileMenuToggle} />
              <Routes>
                <Route path="/" element={<MainContent />} />
                <Route path="/reserved-cars" element={<ReservedCars />} />
                <Route path="/purchased" element={<PurchasedCars />} />
                <Route path="/tracker" element={<CarTrackerStatus />} />
                <Route path="/offers" element={<MyOffers />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/saved" element={<SavedCars />} />
                <Route path="/fastest" element={<FastestSelling />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          </Router>
        </AuthGuard>
      </AuthInitializer>
    </AuthProvider>
  );
}

export default App;