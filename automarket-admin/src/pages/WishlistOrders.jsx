import React, { useEffect, useState } from 'react';
import {
  FaChevronDown,
  FaChevronRight,
  FaEye,
  FaCar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGasPump,
  FaTachometerAlt,
  FaSearch,
  FaArrowRight,
  FaBullseye,
} from 'react-icons/fa';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// DemandBadge component for displaying car demand level
const DemandBadge = ({ demand }) => {
  const getBadgeStyles = (demand) => {
    switch (demand?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeStyles(demand)}`}>
      {demand || 'Unknown'} Demand
    </span>
  );
};

// CarCard component for displaying car details
const CarCard = ({ car, wishlistOption }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Car Image */}
        <div className="lg:w-64 flex-shrink-0">
          {car.image_url ? (
            <img
              src={car.image_url}
              alt={`${car.make} ${car.model}`}
              className="w-full h-48 lg:h-40 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-48 lg:h-40 bg-gray-200 rounded-lg flex items-center justify-center">
              <FaCar className="text-gray-400 text-3xl" />
            </div>
          )}
        </div>

        {/* Car Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {car.make} {car.model}
              </h4>
              <p className="text-sm text-gray-600 mb-2">Seller: {car.seller_name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                €{' '}
                {Math.round(
                  parseFloat(
                    wishlistOption?.offered_price_vat_type === 'Excl. VAT' && car.adjusted_price
                      ? car.adjusted_price
                      : car.price
                  )
                ).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Car Specifications */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-600">
                {car.first_registration ? new Date(car.first_registration).getFullYear() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaTachometerAlt className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-600">{car.mileage}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaGasPump className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-600">{car.fuel_type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-600">
                {car.gearbox
                  ? car.gearbox.charAt(0).toUpperCase() + car.gearbox.slice(1).toLowerCase()
                  : 'Automatic'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-600">{car.location}</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Power: {car.power}</span>
              <span className="text-sm text-gray-600">Body: {car.body_type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CarOrderCard component - the main reusable component for each car order
const CarOrderCard = ({ car, index, wishlistOption }) => {
  return (
    <div className="border border-gray-200 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-0">
        {/* Customer's Car Section - Updated with blue theme */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 text-lg sm:text-xl truncate">
                  Sold in: {car.sell_time === 0 ? 1 : car.sell_time || 'N/A'} days
                </h3>
                <p className="text-blue-600 text-sm">High-demand car that sold quickly</p>
              </div>
            </div>
            {car.demand && (
              <div className="flex-shrink-0">
                <DemandBadge demand={car.demand} />
              </div>
            )}
          </div>

          <CarCard car={car} wishlistOption={wishlistOption} />
        </div>

        {/* Buying Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border-t border-blue-100">
          <div className="p-4 sm:p-6">
            {/* Price and Features Grid */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price Highlight */}
                <div className="sm:col-span-1">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-blue-600 text-xs mb-1">Our Target Price</p>
                    <p className="text-blue-800 font-semibold text-lg">
                      {wishlistOption?.currency || '€'}{' '}
                      {Math.round(
                        parseFloat(wishlistOption?.offered_price || car.price)
                      ).toLocaleString()}
                    </p>
                    {wishlistOption?.offered_price_vat_type && (
                      <p className="text-blue-600 text-xs mt-1">
                        {wishlistOption.offered_price_vat_type}
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="sm:col-span-2">
                  <div className="grid grid-cols-2 gap-3 h-full">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Verified Inspection Report</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Equipment Trim Matched</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Fast & Reliable Transport</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Best Purchase Price Guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get authentication token
const getAuthToken = () => {
  let token = localStorage.getItem('token');

  if (!token) {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsedAuthData = JSON.parse(authData);
        if (typeof parsedAuthData.token === 'string') {
          token = parsedAuthData.token;
        } else if (parsedAuthData.token && parsedAuthData.token.access_token) {
          token = parsedAuthData.token.access_token;
        } else if (parsedAuthData.token) {
          token = parsedAuthData.token.token || parsedAuthData.token;
        }
      } catch (error) {
        console.error('Error parsing authData:', error);
      }
    }
  }

  return token;
};

const WishlistOrders = () => {
  const [wishlistOrders, setWishlistOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [userFilter, setUserFilter] = useState('');

  const fetchWishlistOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${baseURL}/api/users/get-wishlist-orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Log the result as requested
      console.log('Wishlist Orders Data:', data);

      setWishlistOrders(data.data);
    } catch (error) {
      console.error('Error fetching wishlist orders:', error);
      setError(error.message || 'Failed to fetch wishlist orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter users based on search input
  const filteredUsers =
    wishlistOrders?.orders_by_user?.filter((userOrder) => {
      if (!userFilter.trim()) return true;

      const searchTerm = userFilter.toLowerCase();
      const user = userOrder.user;

      return (
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.company_name?.toLowerCase().includes(searchTerm)
      );
    }) || [];

  useEffect(() => {
    fetchWishlistOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading wishlist orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchWishlistOrders}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist Orders</h1>
          {wishlistOrders && (
            <p className="text-sm text-gray-600 mt-1">
              {filteredUsers.length} of {wishlistOrders.total_users} users •{' '}
              {wishlistOrders.total_clicks} total orders
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter users by name, email, or company..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {userFilter && (
              <button
                onClick={() => setUserFilter('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={fetchWishlistOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            Refresh
          </button>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="space-y-4">
          {filteredUsers.map((userOrder) => (
            <div key={userOrder.user.id} className="bg-white rounded-lg shadow-md border">
              {/* User Header - Collapsible */}
              <div
                className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleUserExpansion(userOrder.user.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {expandedUsers.has(userOrder.user.id) ? (
                      <FaChevronDown className="text-gray-400" />
                    ) : (
                      <FaChevronRight className="text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{userOrder.user.name}</h3>
                      <p className="text-sm text-gray-600">{userOrder.user.email}</p>
                      {userOrder.user.company_name && (
                        <p className="text-sm text-gray-500">{userOrder.user.company_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <FaEye className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {userOrder.total_clicks} orders
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Joined {formatDate(userOrder.user.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content - Listing Cards */}
              {expandedUsers.has(userOrder.user.id) && (
                <div className="p-4">
                  <div className="grid gap-4">
                    {userOrder.clicks.map((order, index) => (
                      <CarOrderCard
                        key={order.id}
                        car={{
                          ...order.advert,
                          demand:
                            order.advert.sell_time !== null && order.advert.sell_time < 8
                              ? 'High'
                              : ['medium', 'low'][Math.floor(Math.random() * 2)], // Auto-set high demand for sell_time < 8
                          image_url: order.advert.image_url,
                          make: order.advert.make,
                          model: order.advert.model,
                          seller_name: order.advert.seller_name,
                          price: order.advert.price,
                          first_registration: order.advert.first_registration,
                          mileage: order.advert.mileage,
                          fuel_type: order.advert.fuel_type,
                          location: order.advert.location,
                          power: order.advert.power,
                          body_type: order.advert.body_type,
                        }}
                        index={index}
                        wishlistOption={order.wishlist_option}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaEye className="mx-auto text-gray-300 text-5xl mb-4" />
          {userFilter ? (
            <div>
              <p className="text-gray-500 text-lg mb-2">No users match your search criteria.</p>
              <p className="text-gray-400 text-sm">
                Try adjusting your search terms or{' '}
                <button
                  onClick={() => setUserFilter('')}
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  clear the filter
                </button>
                .
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-lg">No wishlist orders found.</p>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {wishlistOrders && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-600">
                {userFilter
                  ? `Filtered Users: ${filteredUsers.length} of ${wishlistOrders.total_users}`
                  : `Total Users: ${wishlistOrders.total_users}`}
              </p>
              <p className="text-blue-600">Total Orders: {wishlistOrders.total_clicks}</p>
              {userFilter && (
                <p className="text-blue-500 text-xs mt-1">
                  Showing filtered results for "{userFilter}"
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-blue-500">
                Check browser console for full data structure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistOrders;
