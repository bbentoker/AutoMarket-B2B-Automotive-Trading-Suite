import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getAllUsersWithScrapedListings,
  getDealersScrapedListings,
  addBatchToWishlist,
} from '../utils/api';
import WishlistSendingOptionsPopup from '../components/WishlistSendingOptionsPopup';

const WishlistOptions = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userFilter, setUserFilter] = useState('');
  const [showDealerPopup, setShowDealerPopup] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealerListings, setDealerListings] = useState([]);
  const [dealerListingsLoading, setDealerListingsLoading] = useState(false);
  const [dealerListingsError, setDealerListingsError] = useState(null);
  const [listingFilter, setListingFilter] = useState('');
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [storedWishlistEntries, setStoredWishlistEntries] = useState(new Map());
  const [batchWishlistLoading, setBatchWishlistLoading] = useState(false);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [wishlistForm, setWishlistForm] = useState({
    user_id: '',
    offered_price: '',
    offered_price_vat_type: 'Incl. VAT',
    currency: 'EUR',
  });
  const [showWishlistSendingOptionsPopup, setShowWishlistSendingOptionsPopup] = useState(false);
  const [selectedUserForOptions, setSelectedUserForOptions] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllUsersWithScrapedListings();
        console.log('Users with scraped listings:', response);
        const users = response.users || [];
        setUsersData(users);
      } catch (error) {
        console.error('Error fetching users with scraped listings:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRetry = () => {
    setUsersData([]);
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllUsersWithScrapedListings();
        console.log('Users with scraped listings (retry):', response);
        const users = response.users || [];
        setUsersData(users);
      } catch (error) {
        console.error('Error fetching users with scraped listings:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  };

  // Open dealer popup and fetch listings
  const openDealerPopup = async (dealer) => {
    setSelectedDealer(dealer);
    setShowDealerPopup(true);
    setDealerListingsLoading(true);
    setDealerListingsError(null);
    setDealerListings([]);
    setSelectedListings(new Set());
    setListingFilter('');

    try {
      const response = await getDealersScrapedListings(dealer.id);
      setDealerListings(response.listings || []);
    } catch (error) {
      console.error('Error fetching dealer listings:', error);
      setDealerListingsError('Failed to load listings. Please try again.');
    } finally {
      setDealerListingsLoading(false);
    }
  };

  // Close dealer popup
  const closeDealerPopup = () => {
    setShowDealerPopup(false);
    setSelectedDealer(null);
    setDealerListings([]);
    setDealerListingsError(null);
    setSelectedListings(new Set());
    setStoredWishlistEntries(new Map());
    setListingFilter('');
  };

  // Toggle listing selection (optimized with useCallback)
  const toggleListingSelection = useCallback((listingId) => {
    setSelectedListings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  }, []);

  // Store wishlist entry for a listing
  const storeWishlistEntry = (listing, wishlistData) => {
    setStoredWishlistEntries((prev) => {
      const newMap = new Map(prev);
      newMap.set(listing.id, {
        listing_id: listing.id,
        user_id: parseInt(wishlistData.user_id || selectedDealer.id),
        offered_price: parseFloat(wishlistData.offered_price),
        offered_price_vat_type: wishlistData.offered_price_vat_type,
        currency: wishlistData.currency,
        listing: listing, // Store listing info for display
      });
      return newMap;
    });
  };

  // Remove wishlist entry (optimized with useCallback)
  const removeWishlistEntry = useCallback((listingId) => {
    setStoredWishlistEntries((prev) => {
      const newMap = new Map(prev);
      newMap.delete(listingId);
      return newMap;
    });
  }, []);

  // Open image popup
  const openImagePopup = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  }, []);

  // Close image popup
  const closeImagePopup = useCallback(() => {
    setShowImagePopup(false);
    setSelectedImage(null);
  }, []);

  // Submit batch wishlist
  const submitBatchWishlist = async () => {
    if (storedWishlistEntries.size === 0) {
      alert('No wishlist entries to submit');
      return;
    }

    setBatchWishlistLoading(true);
    try {
      const wishlistEntries = Array.from(storedWishlistEntries.values()).map((entry) => ({
        listing_id: entry.listing_id,
        user_id: entry.user_id,
        offered_price: entry.offered_price,
        offered_price_vat_type: entry.offered_price_vat_type,
        currency: entry.currency,
      }));

      await addBatchToWishlist(wishlistEntries);
      alert(`Successfully added ${wishlistEntries.length} listings to wishlist!`);
      setStoredWishlistEntries(new Map());
    } catch (error) {
      console.error('Error submitting batch wishlist:', error);
      alert('Failed to add listings to wishlist: ' + error.message);
    } finally {
      setBatchWishlistLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = usersData.filter((user) => {
    const searchTerm = userFilter.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchTerm) ||
      user.company_name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
    );
  });

  // Filter dealer listings (optimized with useMemo)
  const filteredDealerListings = useMemo(() => {
    // First filter by sell_time <= 8 days
    let filtered = dealerListings.filter((listing) => {
      return (
        listing.sell_time !== undefined && listing.sell_time !== null && listing.sell_time <= 8
      );
    });

    // Then apply search filter if provided
    if (listingFilter) {
      const searchTerm = listingFilter.toLowerCase();
      filtered = filtered.filter((listing) => {
        return (
          listing.make?.toLowerCase().includes(searchTerm) ||
          listing.model?.toLowerCase().includes(searchTerm) ||
          listing.model_version?.toLowerCase().includes(searchTerm) ||
          listing.location?.toLowerCase().includes(searchTerm) ||
          listing.listingsitea_id?.toString().includes(searchTerm)
        );
      });
    }

    // Sort by sell_time in ascending order (lowest first)
    return filtered.sort((a, b) => {
      const sellTimeA = a.sell_time || 0;
      const sellTimeB = b.sell_time || 0;
      return sellTimeA - sellTimeB;
    });
  }, [dealerListings, listingFilter]);

  // Format currency
  const formatCurrency = (amount, currency = 'CHF') => {
    const displayCurrency = currency || '€';
    return `${displayCurrency} ${Number(amount).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Open wishlist popup for individual listing
  const openWishlistPopup = (listing) => {
    setSelectedListing(listing);
    setWishlistForm({
      user_id: selectedDealer?.id || listing.seller_id, // Use dealer ID from popup context
      offered_price: '',
      offered_price_vat_type: 'Incl. VAT',
      currency: 'EUR',
    });
    setShowWishlistPopup(true);
  };

  // Close wishlist popup
  const closeWishlistPopup = () => {
    setShowWishlistPopup(false);
    setSelectedListing(null);
    setWishlistForm({
      user_id: '',
      offered_price: '',
      offered_price_vat_type: 'Incl. VAT',
      currency: 'EUR',
    });
  };

  // Handle form input changes (optimized with useCallback)
  const handleFormChange = useCallback((field, value) => {
    setWishlistForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Open wishlist sending options popup
  const openWishlistSendingOptionsPopup = useCallback((user) => {
    setSelectedUserForOptions(user);
    setShowWishlistSendingOptionsPopup(true);
  }, []);

  // Close wishlist sending options popup
  const closeWishlistSendingOptionsPopup = useCallback(() => {
    setShowWishlistSendingOptionsPopup(false);
    setSelectedUserForOptions(null);
  }, []);

  // Submit wishlist form (store instead of post)
  const handleWishlistSubmit = async (e) => {
    e.preventDefault();
    if (!selectedListing || !wishlistForm.offered_price) {
      alert('Please enter an offered price');
      return;
    }

    try {
      // Store the wishlist entry instead of posting immediately
      storeWishlistEntry(selectedListing, wishlistForm);
      closeWishlistPopup();
    } catch (error) {
      console.error('Error storing wishlist entry:', error);
      alert('Failed to store wishlist entry: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 rounded-lg shadow-lg">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white ml-3">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 rounded-lg shadow-lg">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={handleRetry}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 rounded-lg shadow-lg">
      <div className="max-w-6xl mx-auto p-6 ">
        <h1 className="text-4xl font-bold mb-8 text-white">Wishlist Options</h1>

        {/* Summary */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <h2 className="text-xl font-semibold text-white">Users with Scraped Listings</h2>
                <p className="text-gray-400">Manage wishlist options and user preferences</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Showing {filteredUsers.length} of {usersData.length} users
            </div>
          </div>
        </div>

        {/* User Filter */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Filter Users</label>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Search by name, company, or email..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              return (
                <div
                  key={user.id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => openDealerPopup(user)}
                >
                  {/* User Header */}
                  <div className="bg-gray-700 px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏢</span>
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            {user.name || 'Unknown User'}
                          </h2>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-300">{user.email}</span>
                            {user.company_name && (
                              <span className="text-sm text-gray-400">{user.company_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm bg-blue-600 px-3 py-1 rounded-full text-white">
                          ID: {user.id}
                        </span>
                        {user.listingsitea_url && (
                          <a
                            href={user.listingsitea_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View ListingSiteA profile"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                        {/* Gear Icon Button for Wishlist Sending Options */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openWishlistSendingOptionsPopup(user);
                          }}
                          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-600"
                          title="Wishlist Sending Options"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>
                        <div className="text-blue-400 hover:text-blue-300">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* User details */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-400">
                      <div>Created: {formatDate(user.created_at)}</div>
                      <div>Updated: {formatDate(user.updated_at)}</div>
                      {user.listingsitea_url_add_date && (
                        <div>ListingSiteA added: {formatDate(user.listingsitea_url_add_date)}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <div className="text-4xl mb-4">⭐</div>
              <p className="text-gray-400 text-lg mb-2">No users found</p>
              <p className="text-gray-500 text-sm">
                {userFilter
                  ? 'Try adjusting your filter to see more results.'
                  : 'No users with scraped listings have been found in the system.'}
              </p>
            </div>
          )}
        </div>

        {/* Debug Information */}
        {usersData.length > 0 && (
          <div className="mt-8 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Debug Information</h3>
            <p className="text-sm text-gray-400 mb-2">
              Check the browser console for the complete API response data.
            </p>
            <div className="bg-gray-900 p-3 rounded text-xs text-gray-300 font-mono overflow-x-auto">
              Data structure preview: {JSON.stringify(usersData[0], null, 2).substring(0, 300)}...
            </div>
          </div>
        )}

        {/* Dealer Listings Popup */}
        {showDealerPopup && selectedDealer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {selectedDealer.name || 'Unknown Dealer'} - Listings
                    </h3>
                    <div className="text-sm text-gray-300">
                      {selectedDealer.company_name && (
                        <span className="mr-4">{selectedDealer.company_name}</span>
                      )}
                      <span>{selectedDealer.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={closeDealerPopup}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Loading State */}
                {dealerListingsLoading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="text-white ml-3">Loading listings...</span>
                  </div>
                )}

                {/* Error State */}
                {dealerListingsError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {dealerListingsError}
                  </div>
                )}

                {/* Listings Content */}
                {!dealerListingsLoading && !dealerListingsError && (
                  <>
                    {/* Filter and Stats */}
                    <div className="mb-6">
                      <input
                        type="text"
                        value={listingFilter}
                        onChange={(e) => setListingFilter(e.target.value)}
                        placeholder="Filter listings by make, model, location, or ID..."
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
                        <span>
                          Showing {filteredDealerListings.length} of {dealerListings.length}{' '}
                          listings
                        </span>
                        <div className="flex items-center gap-4">
                          <span>{selectedListings.size} selected</span>
                          <span className="text-blue-400">
                            {storedWishlistEntries.size} in wishlist queue
                          </span>
                        </div>
                      </div>

                      {/* Post Wishlist Button */}
                      {storedWishlistEntries.size > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => setStoredWishlistEntries(new Map())}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Clear Wishlist Queue ({storedWishlistEntries.size})
                          </button>
                          <button
                            onClick={submitBatchWishlist}
                            disabled={batchWishlistLoading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
                          >
                            {batchWishlistLoading
                              ? 'Posting...'
                              : `Post Wishlist (${storedWishlistEntries.size})`}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Listings Grid */}
                    {filteredDealerListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {filteredDealerListings.map((listing) => {
                          const isInWishlist = storedWishlistEntries.has(listing.id);
                          return (
                            <div
                              key={listing.id}
                              className={`bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer border-2 ${
                                selectedListings.has(listing.id)
                                  ? 'border-blue-500'
                                  : isInWishlist
                                    ? 'border-green-500'
                                    : 'border-transparent'
                              } ${isInWishlist ? 'bg-green-900/20' : ''}`}
                              onClick={() => toggleListingSelection(listing.id)}
                            >
                              {/* Car Image */}
                              {listing.image_url && (
                                <div className="mb-3">
                                  <img
                                    src={listing.image_url}
                                    alt={`${listing.make} ${listing.model}`}
                                    className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openImagePopup(listing.image_url);
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}

                              {/* Selection Checkbox and Price */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedListings.has(listing.id)}
                                    onChange={() => toggleListingSelection(listing.id)}
                                    className="rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">
                                    {listing.sell_time !== undefined && listing.sell_time !== null
                                      ? `${listing.sell_time === 0 ? 1 : listing.sell_time} d`
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-400">
                                    {formatCurrency(listing.price, listing.price_currency)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {listing.mileage?.toLocaleString()} km
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-semibold text-white text-sm">
                                  {listing.make} {listing.model}
                                </h4>
                                {listing.model_version !== listing.model && (
                                  <p className="text-xs text-gray-300">{listing.model_version}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <span>{listing.location}</span>
                                  <span>{formatDate(listing.first_registration)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <span>Last seen: {formatDate(listing.last_seen)}</span>
                                  {listing.sell_time !== undefined &&
                                    listing.sell_time !== null && (
                                      <span>Sell time: {listing.sell_time} days</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-end text-xs">
                                  <span
                                    className={`px-2 py-1 rounded ${
                                      listing.is_active
                                        ? 'bg-green-600 text-white'
                                        : 'bg-red-600 text-white'
                                    }`}
                                  >
                                    {listing.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>

                                {/* Wishlist Status and Button */}
                                <div className="mt-2 pt-2 border-t border-gray-600">
                                  {isInWishlist ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-green-400 text-xs">
                                        <span>✓</span>
                                        <span>
                                          In queue (€
                                          {storedWishlistEntries.get(listing.id)?.offered_price})
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeWishlistEntry(listing.id);
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openWishlistPopup(listing);
                                      }}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                                    >
                                      Add to Wishlist
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-700 rounded-lg">
                        <div className="text-2xl mb-2">🔍</div>
                        <p className="text-gray-400">
                          {listingFilter
                            ? 'No listings match your filter'
                            : 'No listings found for this dealer'}
                        </p>
                      </div>
                    )}

                    {/* Stored Wishlist Entries Display */}
                    {storedWishlistEntries.size > 0 && (
                      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-3">
                          Wishlist Queue ({storedWishlistEntries.size} entries)
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {Array.from(storedWishlistEntries.values()).map((entry) => (
                            <div
                              key={entry.listing_id}
                              className="flex items-center justify-between bg-gray-800 p-2 rounded text-sm"
                            >
                              <div className="text-white">
                                {entry.listing.make} {entry.listing.model} - €{entry.offered_price}
                              </div>
                              <button
                                onClick={() => removeWishlistEntry(entry.listing_id)}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                      <div className="flex items-center gap-4">
                        {filteredDealerListings.length > 0 && (
                          <>
                            <button
                              onClick={() => {
                                const allListingIds = new Set(
                                  filteredDealerListings.map((l) => l.id)
                                );
                                setSelectedListings(allListingIds);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => setSelectedListings(new Set())}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Clear All
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={closeDealerPopup}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image Popup */}
        {showImagePopup && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <button
                onClick={closeImagePopup}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="Car"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={closeImagePopup}
              />
            </div>
          </div>
        )}

        {/* Wishlist Popup */}
        {showWishlistPopup && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Add to Wishlist</h3>
                  <button
                    onClick={closeWishlistPopup}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Listing Info */}
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-white mb-2">
                    {selectedListing.make} {selectedListing.model}
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Listing ID: {selectedListing.listingsitea_id}</div>
                    <div>
                      Price: {formatCurrency(selectedListing.price, selectedListing.price_currency)}
                    </div>
                    <div>Location: {selectedListing.location}</div>
                    <div>Seller ID: {selectedListing.seller_id}</div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleWishlistSubmit} className="space-y-4">
                  {/* Offered Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Offered Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={wishlistForm.offered_price}
                      onChange={(e) => handleFormChange('offered_price', e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter offered price"
                      autoComplete="off"
                    />
                  </div>

                  {/* Offered Price VAT Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Offered Price VAT Type
                    </label>
                    <select
                      value={wishlistForm.offered_price_vat_type}
                      onChange={(e) => handleFormChange('offered_price_vat_type', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Incl. VAT">Incl. VAT</option>
                      <option value="Excl. VAT">Excl. VAT</option>
                    </select>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                    <select
                      value={wishlistForm.currency}
                      onChange={(e) => handleFormChange('currency', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EUR">EUR</option>
                      <option value="CHF">CHF</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeWishlistPopup}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Add to Queue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Sending Options Popup */}
        <WishlistSendingOptionsPopup
          user={selectedUserForOptions}
          isOpen={showWishlistSendingOptionsPopup}
          onClose={closeWishlistSendingOptionsPopup}
        />
      </div>
    </div>
  );
};

export default WishlistOptions;
