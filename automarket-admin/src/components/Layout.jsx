import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaCar,
  FaChartLine,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
} from 'react-icons/fa';
import { getStatusesWithCounts } from '../utils/api';

// Hardcoded statuses - only fetch counts dynamically
const HARDCODED_STATUSES = [
  { id: 1, name: 'Cars for Sale' },
  { id: 2, name: 'Reserved' },
  { id: 3, name: 'Offers' },
  { id: 4, name: 'Purchased' },
  { id: 5, name: 'Proforma Invoice Sent' },
  { id: 6, name: 'Payment Received' },
  { id: 7, name: 'Payment Sent' },
  { id: 8, name: 'Transport Booked' },
  { id: 9, name: 'Documents Sent' },
  { id: 10, name: 'Car Picked Up' },
  { id: 11, name: 'Car Delivered' },
  { id: 12, name: 'Car De-registered' },
  { id: 13, name: 'Deal Done' },
  { id: 14, name: 'No Deal' },
];

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [statuses, setStatuses] = useState(
    HARDCODED_STATUSES.map((status) => ({ ...status, count: 0, notViewedCount: 0 }))
  );
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch new listings count and status counts on component mount and page navigation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatusesLoading(true);

        // Fetch status counts and merge with hardcoded statuses
        const statusesData = await getStatusesWithCounts();
        console.log(statusesData);
        // Create a map for quick lookup of counts
        const countsMap = new Map();
        (statusesData || []).forEach((item) => {
          countsMap.set(item.status.id, {
            count: item.count,
            notViewedCount: item.notViewedCount,
          });
        });

        // Merge hardcoded statuses with fetched counts
        const updatedStatuses = HARDCODED_STATUSES.map((status) => ({
          ...status,
          count: countsMap.get(status.id)?.count || 0,
          notViewedCount: countsMap.get(status.id)?.notViewedCount || 0,
        }));
        console.log(updatedStatuses);
        setStatuses(updatedStatuses);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]); // Refetch on page navigation

  // Helper function to determine if a link is active
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  // Helper function to get link classes
  const getLinkClasses = (path) => {
    const baseClasses =
      'inline-flex items-center px-1 pt-1 border-b-2 transition-colors duration-200';
    if (isActiveLink(path)) {
      return `${baseClasses} text-blue-600 border-blue-600 bg-blue-50`;
    }
    return `${baseClasses} text-gray-900 border-transparent hover:border-gray-300 hover:text-gray-700`;
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* navbar */}
      <nav
        className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-fit' : 'w-52'} flex flex-col py-4`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="h-full flex flex-col justify-between">
          {/* navbar items */}
          <div className="flex flex-col space-y-4 px-2">
            <Link to="/" className="text-xl font-bold text-gray-800 my-4">
              {isCollapsed ? 'CS' : 'Car Sales Admin'}
            </Link>
            <Link to="/add-deal" className={getLinkClasses('/add-deal')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Add Deal</span>}
            </Link>
            <Link to="/add-dealer" className={getLinkClasses('/add-dealer')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Add Dealer</span>}
            </Link>

            <Link to="/offers" className={getLinkClasses('/offers')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Offers</span>}
            </Link>
            <Link to="/dealers" className={getLinkClasses('/dealers')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Dealers</span>}
            </Link>
            <Link to="/blogs" className={getLinkClasses('/blogs')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Blogs</span>}
            </Link>
            <Link to="/scraped-dealers" className={getLinkClasses('/scraped-dealers')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Scraped Dealers</span>}
            </Link>
            <Link to="/login-urls" className={getLinkClasses('/login-urls')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Login URLs</span>}
            </Link>
            <Link to="/wishlist-options" className={getLinkClasses('/wishlist-options')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Wishlist Options</span>}
            </Link>
            <Link to="/wishlist-orders" className={getLinkClasses('/wishlist-orders')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Wishlist Orders</span>}
            </Link>
            <Link to="/scraping-analysis" className={getLinkClasses('/scraping-analysis')}>
              <FaChartLine className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Scraping Analysis</span>}
            </Link>
            {/* Dashboard with expandable status items */}
            <div>
              <div
                className={`${getLinkClasses('/')} cursor-pointer flex items-center justify-between`}
                onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
              >
                <div className="flex items-center">
                  <FaTachometerAlt className="text-2xl " />
                  {!isCollapsed && <span className="ml-2 font-semibold">Dashboard</span>}
                </div>
                {!isCollapsed && (
                  <div className="ml-2">
                    {isDashboardExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </div>
                )}
              </div>

              {/* Dashboard sub-items */}
              {isDashboardExpanded && !isCollapsed && (
                <div className="ml-4 mt-2 space-y-1">
                  {/* Kanban View */}
                  <Link
                    to="/"
                    className={`block px-4 py-2 text-sm transition-colors duration-200 rounded ${
                      location.pathname === '/'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>Kanban View</span>
                  </Link>

                  {/* Status sub-items */}
                  {statusesLoading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading statuses...</div>
                  ) : statuses.length > 0 ? (
                    statuses.map((status) => (
                      <Link
                        key={status.id}
                        to={`/status/${status.id}`}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 rounded ${
                          location.pathname === `/status/${status.id}`
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{status.name}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                              {status.count}
                            </span>
                            {status.notViewedCount > 0 && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {status.notViewedCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No statuses found</div>
                  )}
                </div>
              )}
            </div>

            <Link to="/email-contacts" className={getLinkClasses('/email-contacts')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Email Contacts</span>}
            </Link>
            <Link to="/activity" className={getLinkClasses('/activity')}>
              <FaTachometerAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Activity</span>}
            </Link>
          </div>
          <div className="flex items-center mb-4 px-2">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FaSignOutAlt className="text-2xl" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-6 px-4 bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
