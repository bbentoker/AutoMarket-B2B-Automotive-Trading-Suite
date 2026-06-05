import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  User,
  LogOut,
  MapPin,
  Star,
  type LucideIcon
} from 'lucide-react';
import apiService from '../utils/api';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon | string;
  path: string;
  iconClassName?: string;
}

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

// Custom icon component that can handle both Lucide icons and SVG files
const IconComponent: React.FC<{
  icon: LucideIcon | string;
  size?: number;
  className?: string;
  iconClassName?: string;
}> = ({ icon, size = 20, className = '', iconClassName = '' }) => {
  if (typeof icon === 'string') {
    // It's an SVG file path
    return (
      <img
        src={icon}
        alt="icon"
        width={size}
        height={size}
        className={`${className} ${iconClassName} flex-shrink-0`}
      />
    );
  } else {
    // It's a Lucide icon component
    const IconComp = icon;
    return <IconComp size={size} className={`${className} ${iconClassName}`} />;
  }
};

const navigationItems: NavigationItem[] = [
  { id: 'fastest', label: 'Your Fastest Selling Cars', icon: '/fastestSelling.svg', path: '/fastest', iconClassName: 'fastest-selling-icon' },
  { id: 'wishlist', label: 'Wishlist', icon: Star, path: '/wishlist' },//do not change icon
  { id: 'overview', label: 'Overview', icon: '/Home.svg', path: '/' },
  { id: 'reserved', label: 'Reserved Cars', icon: '/reservedCars.svg', path: '/reserved-cars', iconClassName: 'reserved-cars-icon ' },
  { id: 'offers', label: 'My Offers', icon: '/Offer.svg', path: '/offers', iconClassName: 'offers-icon' },
  { id: 'purchased', label: 'Purchased Cars', icon: '/PurchasedCars.svg', path: '/purchased', iconClassName: 'purchased-cars-icon' },
  { id: 'invoices', label: 'Invoices', icon: '/Invoices.svg', path: '/invoices', iconClassName: 'invoices-icon' },
  { id: 'tracker', label: 'Car Tracker Status', icon: MapPin, path: '/tracker' },//do not change icon
  { id: 'saved', label: 'Saved cars', icon: Heart, path: '/saved' },//do not change icon
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  { id: 'signout', label: 'Sign Out', icon: LogOut, path: '/signout' },
];

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen = false, onMobileMenuClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleNavigation = async (item: NavigationItem) => {
    if (item.id === 'signout') {
      // Show confirmation dialog for sign out
      const isConfirmed = window.confirm('Are you sure you want to sign out?');

      if (isConfirmed) {
        console.log('🔐 User initiated sign out');
        // Clear token and redirect to login
        logout();
      }
      // Always close mobile menu after sign out attempt
      onMobileMenuClose?.();
      return;
    }
    // Intercept navigation to Fastest Selling Cars and pre-check weekly report availability
    if (item.id === 'fastest') {
      try {
        const result = await apiService.checkWeeklyReportAvailability();
        if (!result.available && result.status === 404) {
          // Block navigation and inform the user
          // alert('Weekly report options not found. Please configure your report preferences first.');
          onMobileMenuClose?.();
          return;
        }
      } catch (e) {
        // On error, do not block navigation
        console.error('Failed to check weekly report availability:', e);
      }
    }

    // Navigate to the selected page if not blocked
    navigate(item.path);

    // Always close mobile menu after navigation
    onMobileMenuClose?.();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        sidebar-container
        fixed left-0 top-0 h-screen w-[290px] bg-white shadow-xl border-r border-gray-100 flex-col animate-slide-in z-50
        lg:flex
        ${isMobileMenuOpen ? 'flex sidebar-mobile-open' : 'hidden lg:flex sidebar-mobile-closed'}
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'transform translate-x-0' : 'transform -translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="sidebar-logo-section flex items-center justify-center px-6 py-6 border-b border-gray-100">
          <div className="logo-container flex items-center justify-center">
            <img
              src="https://cdn.automarket.example.com/favicon-dark.png"
              alt="AutoMarket"
              className="sidebar-logo h-10 w-auto object-contain"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 pl-4 py-6 sidebar-navigation">
          <div className="space-y-2 navigation-items">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`
                  nav-item nav-item-${item.id} ${item.iconClassName || ''}
                  relative w-full flex items-center px-4 py-3 text-left rounded-l-lg transition-all duration-200 group
                  ${isActive(item.path)
                    ? 'nav-item-active text-primary-950 bg-gray-50 font-semibold'
                    : 'nav-item-inactive text-secondary-950 hover:text-primary-950 hover:bg-gray-50 font-medium'
                  }
                `}
              >
                {/* Active Indicator */}
                {isActive(item.path) && (
                  <div className={`active-indicator active-indicator-${item.id} absolute right-0 top-0 w-1 h-full bg-primary-950 rounded-l-full animate-fade-in`}></div>
                )}

                {/* Icon */}
                <IconComponent
                  icon={item.icon}
                  size={25}
                  className={`nav-icon nav-icon-${item.id} mr-3 transition-colors duration-200 ${isActive(item.path) ? 'nav-icon-active text-primary-950' : 'nav-icon-inactive text-secondary-950'
                    }`}
                  iconClassName={item.iconClassName}
                />

                {/* Label */}
                <span className={`nav-label nav-label-${item.id} text-base flex-1 tracking-tight`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className="sidebar-profile-section px-6 py-4 border-t border-gray-100">
            <div className="user-profile-card flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="profile-avatar w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                <User size={20} className="profile-avatar-icon text-white" />
              </div>
              <div className="profile-info flex-1 min-w-0">
                <p className="profile-name text-sm font-semibold text-primary-950 truncate">{user.name}</p>
                <p className="profile-role text-xs text-secondary-950 truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;