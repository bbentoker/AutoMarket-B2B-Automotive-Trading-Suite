import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changeLanguage } from '../services/api';
import { getToken } from '../utils/auth';
import { useTranslation, i18n } from '../i18n';

const HeaderMobile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || i18n.language || 'en';
  });
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'de', name: 'Deutsch' }
  ];

  useEffect(() => {
    // Priority: 1. localStorage (updated immediately on change), 2. User's language preference, 3. Default 'en'
    const lang = localStorage.getItem('selectedLanguage') || user?.language || 'en';
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
  }, [user]);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_LANDING_URL}/login`;
  };

  const handleRegister = () => {
    window.location.href = `${import.meta.env.VITE_LANDING_URL}/register`;
  };

  const handleHome = () => {
    window.location.href = '/';
    setIsMenuOpen(false);
  };

  const handleShopCars = () => {
    window.location.href = '/';
    setIsMenuOpen(false);
  };

  const handleAbout = () => {
    window.location.href = 'https://www.automarket.example.com/about';
    setIsMenuOpen(false);
  };

  const handleContact = () => {
    window.location.href = 'https://www.automarket.example.com/contact-us';
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleDashboardNavigation = (path) => {
    const token = getToken();
    const dashboardUrl = new URL(import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.automarket.example.com');
    dashboardUrl.pathname = path;
    if (token) {
      dashboardUrl.searchParams.set('token', token);
    }
    window.open(dashboardUrl.toString(), '_self');
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    const isConfirmed = window.confirm('Are you sure you want to sign out?');
    if (isConfirmed) {
      handleLogout();
    }
  };

  const handleLanguageSelection = async (languageCode) => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    i18n.changeLanguage(languageCode);
    setIsLanguageDropdownOpen(false);

    // Call API to update user's language preference
    await changeLanguage(languageCode);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const closeSidebar = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between px-3 py-8 bg-c-white w-full">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">
            <img src="https://cdn.automarket.example.com/favicon-dark.png" alt="AutoMarket" className="h-8 " />
          </Link>
        </div>

        <div className="flex gap-4 items-center relative">

          {/* Language selection dropdown */}
          <div className="relative flex justify-center">
            {isAuthenticated && (
              <img
                src="/web-icon.svg"
                alt=""
                className={`cursor-pointer hover:opacity-70 transition-opacity w-6 h-6 ${isAuthenticated ? '' : 'scale-110'}`}
                onClick={toggleLanguageDropdown}
              />
            )}

            {isLanguageDropdownOpen && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-5 w-40 bg-white rounded-xl shadow-lg border border-gray-200  z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelection(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:border-none transition-colors rounded-none ${selectedLanguage === lang.code ? 'bg-gray-200 font-medium ' : ''
                      }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* langugae logo  */}
          {isAuthenticated ? (<><div onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-c-white border border-gray-200 rounded-full flex items-center gap-3 py-1 pl-3 pr-2">

            <button

              className="flex flex-col gap-1 p-1 hover:bg-gray-200 rounded transition-colors bg-white"
            >
              <img src="/hamburger-icon.svg" alt="" className="w-4 h-4" />
            </button>
            {isAuthenticated && user?.name && (
              <div
                className="h-8 w-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const token = getToken();
                  const dashboardUrl = new URL(import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.automarket.example.com');
                  if (token) {
                    dashboardUrl.searchParams.set('token', token);
                  }
                  window.open(dashboardUrl.toString(), '_self');
                }}
              >
                <span className="text-white text-xs">{getInitial(user.name)}</span>
              </div>
            )}
          </div></>) : (<>
            {/* login and register buttons */}
            <div className="flex gap-3 items-center">
              {/* icon here */}
              <button
                onClick={handleLogin}
                className="h-10 bg-white border border-gray-300 rounded-xl flex items-center justify-center py-2  text-gray-700 hover:bg-gray-50 transition-colors text-xs w-20"
              >
                {t('common.login')}
              </button>
              <button
                onClick={handleRegister}
                className="h-10 bg-c-red text-white rounded-xl flex items-center justify-center py-2  hover:bg-c-red-dark transition-colors text-xs w-32"
              >
                {t('common.register')}
              </button>
            </div>
          </>)}
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <img src="https://cdn.automarket.example.com/favicon-dark.png" alt="AutoMarket" className="h-10" />
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-6 overflow-y-auto">
            <nav className="flex flex-col space-y-2 px-4">
              {/* Home */}
              <button
                onClick={handleHome}
                className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <img src="/home-icon.svg" alt="Home" className="w-6 h-6" />
                <span className="text-lg font-medium">{t('common.home')}</span>
              </button>

              {/* Shop Cars */}
              <button
                onClick={handleShopCars}
                className="flex items-center gap-4 px-4 py-4 text-c-red hover:bg-c-red/10 rounded-lg transition-colors text-left border-l-4 border-c-red"
              >
                <img src="/car-icon.svg" alt="Shop Cars" className="w-6 h-6" />
                <span className="text-lg font-medium">{t('common.shopCars')}</span>
              </button>

              {/* About/Contact moved to the bottom of the sidebar */}

              {/* Dashboard Items - Only show when authenticated */}
              {isAuthenticated && (
                <>
                  {/* Wishlist */}
                  <button
                    onClick={() => handleDashboardNavigation('/wishlist')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Wishlist</span>
                  </button>

                  {/* Your Fastest Selling Cars */}
                  <button
                    onClick={() => handleDashboardNavigation('/fastest')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M19 18H21C21 17.5 20.9 16.5 20.5 15.8C20.2 15.4 17.5 14 15.8 14.4C15.7 14.4 15.6 14.4 15.5 14.3C15.5 14.3 15.1 13.2 13.7 12.5C12.4 11.9 9.8 11.4 4.2 12.6L4.8 13.6C4.9 13.7 4.9 13.8 4.9 13.9C4.9 14 4.8 14.1 4.7 14.1L1.1 16V17.2L2.8 18H3.2C3.3 17.2 4 16.6 4.9 16.6C5.8 16.6 6.5 17.2 6.6 18H14.1C14.2 17.2 14.9 16.6 15.8 16.6C16.7 16.6 17.4 17.2 17.5 18H19ZM20.5 19H18C18 18.3 17.4 17.7 16.7 17.7C16 17.7 15.4 18.3 15.4 19H6.8C6.8 18.3 6.2 17.7 5.5 17.7C4.8 17.7 4.2 18.3 4.2 19H2.8C2.7 19 2.6 19 2.5 19L0.5 17.5C0.4 17.4 0.4 17.3 0.4 17.2V15.6C0.4 15.5 0.5 15.4 0.6 15.4L4.1 13.4L3.3 12.3C3.2 12.2 3.2 12.1 3.2 12C3.2 11.9 3.3 11.8 3.4 11.8C5.4 11.2 7.2 10.9 8.7 10.9C9.8 10.9 10.7 11.1 11.5 11.4C12.1 11.6 12.4 12.1 12.5 12.4C14.2 12.1 19.5 14.1 19.6 14.2C19.7 14.2 19.8 14.3 19.8 14.4C20.4 15.5 20.4 17.7 20.4 17.8C20.4 17.9 20.3 19 20.5 19Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Your Fastest Selling Cars</span>
                  </button>

                  {/* Overview */}
                  <button
                    onClick={() => handleDashboardNavigation('/')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M10 20V13H14V20C14 20.6 14.4 21 15 21H18C18.6 21 19 20.6 19 20V10H20.5C21 10 21.2 9.4 20.9 9L12.5 0.5C12.2 0.2 11.8 0.2 11.5 0.5L3.1 9C2.8 9.4 3 10 3.5 10H5V20C5 20.6 5.4 21 6 21H9C9.6 21 10 20.6 10 20Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Overview</span>
                  </button>

                  {/* Reserved Cars */}
                  <button
                    onClick={() => handleDashboardNavigation('/reserved-cars')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M4 2C3.4 2 3 2.4 3 3V4H5V3C5 2.4 5.4 2 6 2H8C8.6 2 9 2.4 9 3V4H15V3C15 2.4 15.4 2 16 2H18C18.6 2 19 2.4 19 3V4H21C21.6 4 22 4.4 22 5V20C22 20.6 21.6 21 21 21H3C2.4 21 2 20.6 2 20V5C2 4.4 2.4 4 3 4H4V2ZM4 6V19H20V6H4ZM6 8H8V10H6V8ZM6 12H8V14H6V12Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Reserved Cars</span>
                  </button>

                  {/* My Offers */}
                  <button
                    onClick={() => handleDashboardNavigation('/offers')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M16 19.5C16.3 19.5 16.6 19.4 16.9 19.3C17.2 19.2 17.4 19.1 17.6 18.9L20.3 16C20.5 15.7 20.6 15.3 20.6 15V14.9C20.6 14.6 20.5 14.3 20.4 14.1C20.2 13.9 20 13.7 19.7 13.6C19.5 13.5 19.2 13.5 18.9 13.5C18.6 13.6 18.4 13.7 18.2 14L16.3 15.5C16.2 15.4 16.1 15.3 15.9 15.2C15.8 15.1 15.6 15 15.4 15H13C12.8 14.8 12.6 14.6 12.5 14.4C12.3 14.2 12.2 14 12.2 13.8C11.9 13.8 11.6 13.9 11.3 14C11 14.1 10.7 14.2 10.5 14.4L8.4 16.5L7.9 16C7.8 15.9 7.7 15.9 7.6 15.9C7.5 15.9 7.4 15.9 7.3 16L3.5 19.9C3.4 20 3.4 20.1 3.4 20.2C3.4 20.3 3.4 20.4 3.5 20.4L7.6 23.5C7.7 23.6 7.8 23.6 7.9 23.6C8 23.6 8.1 23.6 8.2 23.5L10.1 21.6C10.2 21.5 10.3 21.4 10.4 21.3C10.5 21.2 10.6 21.1 10.7 21H16ZM7.9 22.7L4.3 19.2L5.6 17.8L9.2 21.3L7.9 22.7ZM10.2 18.9L9 20.1L6.9 18L8.8 16.2C9.1 15.8 9.5 15.5 10 15.3C10.5 15.1 11 15 11.5 15C11.7 15 11.9 15 12.1 15.1C12.2 15.1 12.3 15.2 12.4 15.2C12.4 15.3 12.5 15.4 12.5 15.5C12.5 15.6 12.5 15.7 12.5 15.8H15.4C15.5 15.8 15.6 15.8 15.7 15.9C15.8 15.9 15.9 16 16 16C16.1 16 16.2 16.1 16.3 16.1C16.4 16.2 16.5 16.3 16.5 16.4C16.5 16.5 16.5 16.6 16.5 16.7H12.8V17.3H15.4C15.6 17.3 15.8 17.2 16 17.1C16.2 17 16.4 16.9 16.5 16.7L18.7 14.5C18.7 14.5 18.8 14.5 18.8 14.5C18.8 14.5 18.9 14.5 18.9 14.5C19 14.5 19 14.6 19 14.7V15C19 15.1 19 15.2 18.9 15.3L16.2 18.4C16.1 18.5 16 18.6 15.9 18.6C15.8 18.7 15.7 18.7 15.6 18.7H10.5C10.4 18.7 10.3 18.8 10.2 18.9Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">My Offers</span>
                  </button>

                  {/* Purchased Cars */}
                  <button
                    onClick={() => handleDashboardNavigation('/purchased')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M7 18C7.6 18 8 17.6 8 17C8 16.4 7.6 16 7 16C6.4 16 6 16.4 6 17C6 17.6 6.4 18 7 18ZM17 18C17.6 18 18 17.6 18 17C18 16.4 17.6 16 17 16C16.4 16 16 16.4 16 17C16 17.6 16.4 18 17 18ZM19 4H18V3C18 2.4 17.6 2 17 2H16C15.4 2 15 2.4 15 3V4H9V3C9 2.4 8.6 2 8 2H7C6.4 2 6 2.4 6 3V4H5C3.9 4 3 4.9 3 6V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V6C21 4.9 20.1 4 19 4ZM19 19H5V8H19V19Z" fill="#A3AED0"/>
                        <path d="M9 12H15V13H9V12ZM9 14H15V15H9V14Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Purchased Cars</span>
                  </button>

                  {/* Invoices */}
                  <button
                    onClick={() => handleDashboardNavigation('/invoices')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM20 20H4V4H20V20Z" fill="#A3AED0"/>
                        <path d="M6 8H8V10H6V8ZM6 12H8V14H6V12ZM6 16H8V18H6V16ZM10 8H18V10H10V8ZM10 12H18V14H10V12ZM10 16H15V18H10V16Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Invoices</span>
                  </button>

                  {/* Car Tracker Status */}
                  <button
                    onClick={() => handleDashboardNavigation('/tracker')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M20 10C20 16 12 22 12 22C12 22 4 16 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" fill="#A3AED0"/>
                        <circle cx="12" cy="10" r="3" fill="white"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Car Tracker Status</span>
                  </button>

                  {/* Saved Cars */}
                  <button
                    onClick={() => handleDashboardNavigation('/saved')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M19 14C20.49 12.54 22 10.79 22 8.5C22 5.46 19.54 3 16.5 3C14.74 3 13.5 3.5 12 5C10.5 3.5 9.26 3 7.5 3C4.46 3 2 5.46 2 8.5C2 10.79 3.51 12.54 5 14L12 21L19 14Z" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Saved cars</span>
                  </button>

                  {/* Profile */}
                  <button
                    onClick={() => handleDashboardNavigation('/profile')}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M19 21V19C19 17.8954 18.1046 17 17 17H7C5.89543 17 5 17.8954 5 19V21" fill="#A3AED0"/>
                        <circle cx="12" cy="7" r="4" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Profile</span>
                  </button>

                  {/* About Us (authenticated) */}
                  <button
                    onClick={handleAbout}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <img src="/about-us-icon.svg" alt="About Us" className="w-6 h-6" />
                    <span className="text-lg font-medium">{t('common.aboutUs')}</span>
                  </button>

                  {/* Contact (authenticated) */}
                  <button
                    onClick={handleContact}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <img src="/contact-icon.svg" alt="Contact" className="w-6 h-6" />
                    <span className="text-lg font-medium">{t('common.contact')}</span>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" fill="#A3AED0"/>
                        <rect x="9" y="11" width="8" height="2" fill="#A3AED0"/>
                        <polygon points="16,8 21,12 16,16" fill="#A3AED0"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Sign Out</span>
                  </button>
                </>
              )}
              {/* About/Contact for unauthenticated users (placed last) */}
              {!isAuthenticated && (
                <>
                  <button
                    onClick={handleAbout}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <img src="/about-us-icon.svg" alt="About Us" className="w-6 h-6" />
                    <span className="text-lg font-medium">{t('common.aboutUs')}</span>
                  </button>
                  <button
                    onClick={handleContact}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <img src="/contact-icon.svg" alt="Contact" className="w-6 h-6" />
                    <span className="text-lg font-medium">{t('common.contact')}</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-200 p-6">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">{getInitial(user.name)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{t('common.signedInAs')}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.login')}
                </button>
                <button
                  onClick={handleRegister}
                  className="w-full bg-c-red text-white py-3 px-4 rounded-lg hover:bg-c-red-dark transition-colors"
                >
                  {t('common.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderMobile; 