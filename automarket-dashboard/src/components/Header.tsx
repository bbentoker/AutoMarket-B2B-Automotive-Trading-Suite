import React, { useState } from 'react';
import { Home, Menu, X } from 'lucide-react';
import { getToken } from '../utils/auth';

interface HeaderProps {
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-[290px] right-0 h-16 lg:h-20 bg-white border-b border-gray-100 z-50">
      <div className="flex items-center justify-between h-full px-4 lg:px-5">
        {/* Mobile Menu Button */}
        <button 
          onClick={handleMobileMenuToggle}
          className="lg:hidden flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X size={20} className="text-primary-950" />
          ) : (
            <Menu size={20} className="text-primary-950" />
          )}
        </button>

        {/* Dashboard Title */}
        <h1 className="text-xl lg:text-[34px] font-bold text-primary-950 leading-tight lg:leading-[42px] tracking-tight">
          My Dashboard
        </h1>

        {/* Navigation Section */}
        <div className="flex items-center">
          {/* Homepage Button - Hidden on mobile */}
          <button 
          onClick={() => {
            // get the token
            const token = getToken();
            window.location.href = import.meta.env.VITE_BROWSE_APP_URL ? `${import.meta.env.VITE_BROWSE_APP_URL}/?token=${token}` : 'https://browse.automarket.example.com/?token=' + token;
          }}
          className="hidden md:flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 bg-white border border-gray-300 rounded-full hover:shadow-sm transition-shadow">
            <Home size={20} className="text-primary-950" />
            <span className="text-sm lg:text-base font-medium text-primary-950">Browse Cars</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;