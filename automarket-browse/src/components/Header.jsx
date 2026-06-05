import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changeLanguage } from '../services/api';
import { getToken } from '../utils/auth';
import SearchFilters from './MiniSearchBar';
import { useTranslation, i18n } from '../i18n';
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || i18n.language || 'en';
  });
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Check if current path matches /listings/:id pattern
  const isListingPage = /^\/listings\/\d+$/.test(location.pathname);

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



  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
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

  return (
    <header className="flex items-center justify-between px-9 py-8 bg-c-grey relative">
      <div className="flex items-center pl-16">
        <Link to="/" className="text-2xl font-bold">
          <img src="https://cdn.automarket.example.com/favicon-dark.png" alt="AutoMarket" className="h-10" />
        </Link>
      </div>
      <nav className="flex items-center gap-10 font-bold text-sm absolute left-1/2 transform -translate-x-1/2">
        {isListingPage ? (
          <SearchFilters />
        ) : (
          <>
            <Link to="/" className="text-gray-600 hover:text-black flex items-center gap-2">
              <img src="/home-icon.svg" alt="" className="w-6 h-6" />
              {t('common.home')}
            </Link>
            <Link to="/shop-cars" className="text-c-red flex items-center gap-2">
              <img src="/car-icon.svg" alt="" className="w-6 h-6" />
              {t('common.shopCars')}
            </Link>
          </>
        )}
      </nav>
      <div className="flex gap-4 items-center relative pr-6 w-80 justify-end">

        {/* Language selection dropdown */}
        <div className="relative flex justify-center">
          <img
            src="/web-icon.svg"
            alt=""
            className={`cursor-pointer hover:opacity-70 transition-opacity transform ${isAuthenticated ? 'scale-100' : 'scale-150'}`}
            onClick={toggleLanguageDropdown}
          />

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
              className="h-10 bg-white border border-gray-300 rounded-xl flex items-center justify-center py-2  text-gray-700 hover:bg-gray-50 transition-colors text-xs w-32"
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


        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 bg-white top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-500">
                  {t('common.signedInAs')} <br />
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="h-[1px] bg-gray-200 my-2"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const token = getToken();
                    const dashboardUrl = new URL(import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.automarket.example.com');
                    if (token) {
                      dashboardUrl.searchParams.set('token', token);
                    }
                    window.open(dashboardUrl.toString(), '_self');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-white text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t('common.dashboard')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-white text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full bg-white text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t('common.logIn')}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 