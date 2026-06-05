import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reserved from './pages/Reserved';
import Offers from './pages/Offers';
import CarsForSale from './pages/CarsForSale';
import Dealers from './pages/Dealers';
import EmailContacts from './pages/EmailContacts';
import Activity from './pages/Activity';
import AddDeal from './pages/AddDeal';
import AddDealer from './pages/AddDealer';
import ListingDetail from './pages/ListingDetail';
import MakeOffer from './pages/MakeOffer';
import DealerDetail from './pages/DealerDetail';
import StatusPage from './pages/StatusPage';
import Blogs from './pages/Blogs';
import { Toaster } from 'react-hot-toast';
import Test from './components/Test';
import ScrapedDealers from './pages/ScrapedDealers';
import DealerSolds from './pages/DealerSolds';
import AddScrapedDealer from './pages/AddScrapedDealer';
import LoginUrls from './pages/LoginUrls';
import WishlistOptions from './pages/WishlistOptions';
import WishlistOrders from './pages/WishlistOrders';
import ScrapingAnalysis from './pages/ScrapingAnalysis';

// Protected Route wrapper component
const ProtectedRoutes = () => {
  const { isSigned, isLoading } = useAuth();

  // Show loading while checking authentication state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isSigned()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="add-deal" element={<AddDeal />} />
        <Route path="add-dealer" element={<AddDealer />} />
        <Route path="offers" element={<Offers />} />
        <Route path="dealers" element={<Dealers />} />
        <Route path="email-contacts" element={<EmailContacts />} />
        <Route path="activity" element={<Activity />} />
        <Route path="listing/:id" element={<ListingDetail />} />
        <Route path="make-offer" element={<MakeOffer />} />
        <Route path="dealers/:id" element={<DealerDetail />} />
        <Route path="status/:statusId" element={<StatusPage />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="test" element={<Test />} />
        <Route path="scraped-dealers" element={<ScrapedDealers />} />
        <Route path="add-scraped-dealer" element={<AddScrapedDealer />} />
        <Route path="dealer-solds/:dealerId" element={<DealerSolds />} />
        <Route path="login-urls" element={<LoginUrls />} />
        <Route path="wishlist-options" element={<WishlistOptions />} />
        <Route path="wishlist-orders" element={<WishlistOrders />} />
        <Route path="scraping-analysis" element={<ScrapingAnalysis />} />
      </Route>
    </Routes>
  );
};

function AppContent() {
  const { isSigned, isLoading } = useAuth();
  const handleLogin = () => {
    // Navigation will be handled by the router
    console.log('Login successful');
  };

  // Show loading while checking authentication state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={!isSigned() ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />}
        />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
