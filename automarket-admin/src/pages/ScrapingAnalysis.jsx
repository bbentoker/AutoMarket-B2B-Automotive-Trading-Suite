import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaChevronDown,
  FaChevronRight,
  FaCar,
  FaCalendarAlt,
  FaEye,
  FaExternalLinkAlt,
  FaGasPump,
  FaTachometerAlt,
  FaHistory,
  FaFilter,
} from 'react-icons/fa';
import WishlistSendingOptionsPopup from '../components/WishlistSendingOptionsPopup';
import { getDealersScrapedListings, addBatchToWishlist } from '../utils/api';

const ScrapingAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [expandedDealerHistory, setExpandedDealerHistory] = useState(new Set());
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detailed'
  const [isFilterSectionOpen, setIsFilterSectionOpen] = useState(false);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealerListings, setDealerListings] = useState([]);
  const [dealerListingsLoading, setDealerListingsLoading] = useState(false);
  const [dealerListingsError, setDealerListingsError] = useState(null);
  const [listingFilter, setListingFilter] = useState('');
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [storedWishlistEntries, setStoredWishlistEntries] = useState(new Map());
  const [batchWishlistLoading, setBatchWishlistLoading] = useState(false);
  const [showWishlistSendingOptionsPopup, setShowWishlistSendingOptionsPopup] = useState(false);
  const [selectedUserForOptions, setSelectedUserForOptions] = useState(null);
  const [showIndividualWishlistPopup, setShowIndividualWishlistPopup] = useState(false);
  const [selectedListingForWishlist, setSelectedListingForWishlist] = useState(null);
  const [wishlistForm, setWishlistForm] = useState({
    user_id: '',
    offered_price: '',
    offered_price_vat_type: 'Incl. VAT',
    currency: 'EUR',
  });

  // Filter states
  const [filters, setFilters] = useState({
    companyName: '',
    minSold12Days: '',
    maxSold12Days: '',
    minSold2Days: '',
    maxSold2Days: '',
    minScraped2Days: '',
    maxScraped2Days: '',
    minActiveAdverts: '',
    maxActiveAdverts: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    companyName: '',
    minSold12Days: '',
    maxSold12Days: '',
    minSold2Days: '',
    maxSold2Days: '',
    minScraped2Days: '',
    maxScraped2Days: '',
    minActiveAdverts: '',
    maxActiveAdverts: '',
  });

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const fetchScrapingAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseURL}/auth/scraping-analysis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Log the response as requested
      console.log('Scraping Analysis Response:', data);

      setAnalysisData(data);
    } catch (err) {
      console.error('Error fetching scraping analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  const fetchOverviewData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseURL}/auth/scraping-analysis-overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Overview Data Response:', data);
      setOverviewData(data);
    } catch (err) {
      console.error('Error fetching overview data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    if (viewMode === 'overview') {
      fetchOverviewData();
    } else {
      fetchScrapingAnalysis();
    }
  }, [viewMode, fetchScrapingAnalysis, fetchOverviewData]);

  const toggleCard = (userId) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(userId)) {
      newExpandedCards.delete(userId);
    } else {
      newExpandedCards.add(userId);
    }
    setExpandedCards(newExpandedCards);
  };

  const toggleDealerHistory = (userId) => {
    const newExpandedCards = new Set(expandedDealerHistory);
    if (newExpandedCards.has(userId)) {
      newExpandedCards.delete(userId);
    } else {
      newExpandedCards.add(userId);
    }
    setExpandedDealerHistory(newExpandedCards);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-EU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'CHF') => {
    const displayCurrency = currency || '€';
    return `${displayCurrency} ${Number(amount).toLocaleString()}`;
  };

  // Filter dealer listings
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

  const getDealerIcon = (companyName) => {
    const name = companyName.toLowerCase();
    if (name.includes('bmw')) return '🚗';
    if (name.includes('mercedes') || name.includes('benz')) return '⭐';
    if (name.includes('audi')) return '🔷';
    if (name.includes('volkswagen') || name.includes('vw')) return '🚙';
    if (name.includes('porsche')) return '🏎️';
    if (name.includes('garage')) return '🔧';
    if (name.includes('auto')) return '🚘';
    if (name.includes('amag')) return '🏢';
    return '🚗';
  };

  const getDealerHistoricalData = (userId) => {
    if (!analysisData?.data?.dailyData) return [];

    const dealerHistory = [];
    analysisData.data.dailyData.forEach((dayData) => {
      const dealerData = dayData.dealers?.find((dealer) => dealer.user_id === userId);
      if (dealerData) {
        dealerHistory.push({
          date: dayData.date,
          sold_count: dealerData.sold_count,
          adverts: dealerData.adverts || [],
        });
      }
    });

    return dealerHistory;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const emptyFilters = {
      companyName: '',
      minSold12Days: '',
      maxSold12Days: '',
      minSold2Days: '',
      maxSold2Days: '',
      minScraped2Days: '',
      maxScraped2Days: '',
      minActiveAdverts: '',
      maxActiveAdverts: '',
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  // Handle opening wishlist popup
  const openWishlistPopup = async (dealer) => {
    setSelectedDealer(dealer);
    setShowWishlistPopup(true);
    setDealerListingsLoading(true);
    setDealerListingsError(null);
    setDealerListings([]);
    setSelectedListings(new Set());
    setListingFilter('');

    try {
      const response = await getDealersScrapedListings(dealer.user_id);
      setDealerListings(response.listings || []);
    } catch (error) {
      console.error('Error fetching dealer listings:', error);
      setDealerListingsError('Failed to load listings. Please try again.');
    } finally {
      setDealerListingsLoading(false);
    }
  };

  // Handle closing wishlist popup
  const closeWishlistPopup = () => {
    setShowWishlistPopup(false);
    setSelectedDealer(null);
    setDealerListings([]);
    setDealerListingsError(null);
    setSelectedListings(new Set());
    setStoredWishlistEntries(new Map());
    setListingFilter('');
  };

  // Toggle listing selection
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
        user_id: parseInt(wishlistData.user_id || selectedDealer?.user_id),
        offered_price: parseFloat(wishlistData.offered_price || 0),
        offered_price_vat_type: wishlistData.offered_price_vat_type || 'Incl. VAT',
        currency: wishlistData.currency || 'EUR',
        listing: listing,
      });
      return newMap;
    });
  };

  // Remove wishlist entry
  const removeWishlistEntry = useCallback((listingId) => {
    setStoredWishlistEntries((prev) => {
      const newMap = new Map(prev);
      newMap.delete(listingId);
      return newMap;
    });
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

      // Debug logging
      console.log('Submitting wishlist entries:', wishlistEntries);
      console.log('Selected dealer:', selectedDealer);

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

  // Open wishlist sending options popup
  const openWishlistSendingOptionsPopup = useCallback(() => {
    // Create a user object with the correct structure for the popup
    const userForOptions = {
      id: selectedDealer?.user_id,
      name: selectedDealer?.company_name || 'Unknown Dealer',
      email: selectedDealer?.email || '',
      company_name: selectedDealer?.company_name || '',
    };
    setSelectedUserForOptions(userForOptions);
    setShowWishlistSendingOptionsPopup(true);
  }, [selectedDealer]);

  // Close wishlist sending options popup
  const closeWishlistSendingOptionsPopup = useCallback(() => {
    setShowWishlistSendingOptionsPopup(false);
    setSelectedUserForOptions(null);
  }, []);

  // Open individual wishlist popup
  const openIndividualWishlistPopup = useCallback(
    (listing) => {
      setSelectedListingForWishlist(listing);
      setWishlistForm({
        user_id: selectedDealer?.user_id || '',
        offered_price: '',
        offered_price_vat_type: 'Incl. VAT',
        currency: 'EUR',
      });
      setShowIndividualWishlistPopup(true);
    },
    [selectedDealer]
  );

  // Close individual wishlist popup
  const closeIndividualWishlistPopup = useCallback(() => {
    setShowIndividualWishlistPopup(false);
    setSelectedListingForWishlist(null);
    setWishlistForm({
      user_id: '',
      offered_price: '',
      offered_price_vat_type: 'Incl. VAT',
      currency: 'EUR',
    });
  }, []);

  // Handle form input changes
  const handleFormChange = useCallback((field, value) => {
    setWishlistForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Submit individual wishlist form
  const handleIndividualWishlistSubmit = async (e) => {
    e.preventDefault();
    if (!selectedListingForWishlist || !wishlistForm.offered_price) {
      alert('Please enter an offered price');
      return;
    }

    try {
      // Store the wishlist entry instead of posting immediately
      storeWishlistEntry(selectedListingForWishlist, wishlistForm);
      closeIndividualWishlistPopup();
    } catch (error) {
      console.error('Error storing wishlist entry:', error);
      alert('Failed to store wishlist entry: ' + error.message);
    }
  };

  const filterData = (data) => {
    return data.filter((dealer) => {
      // Company name filter
      if (
        appliedFilters.companyName &&
        !dealer.company_name.toLowerCase().includes(appliedFilters.companyName.toLowerCase())
      ) {
        return false;
      }

      // Sold last 12 days filters
      const sold12Days = parseInt(dealer.sold_last_12_days);
      if (appliedFilters.minSold12Days && sold12Days < parseInt(appliedFilters.minSold12Days)) {
        return false;
      }
      if (appliedFilters.maxSold12Days && sold12Days > parseInt(appliedFilters.maxSold12Days)) {
        return false;
      }

      // Sold last 2 days filters
      const sold2Days = parseInt(dealer.sold_last_2_days);
      if (appliedFilters.minSold2Days && sold2Days < parseInt(appliedFilters.minSold2Days)) {
        return false;
      }
      if (appliedFilters.maxSold2Days && sold2Days > parseInt(appliedFilters.maxSold2Days)) {
        return false;
      }

      // Scraped last 2 days filters
      const scraped2Days = parseInt(dealer.scraped_last_2_days);
      if (
        appliedFilters.minScraped2Days &&
        scraped2Days < parseInt(appliedFilters.minScraped2Days)
      ) {
        return false;
      }
      if (
        appliedFilters.maxScraped2Days &&
        scraped2Days > parseInt(appliedFilters.maxScraped2Days)
      ) {
        return false;
      }

      // Active adverts filters
      const activeAdverts = parseInt(dealer.active_adverts);
      if (
        appliedFilters.minActiveAdverts &&
        activeAdverts < parseInt(appliedFilters.minActiveAdverts)
      ) {
        return false;
      }
      if (
        appliedFilters.maxActiveAdverts &&
        activeAdverts > parseInt(appliedFilters.maxActiveAdverts)
      ) {
        return false;
      }

      return true;
    });
  };

  const renderOverviewTable = () => {
    if (!overviewData?.data || !Array.isArray(overviewData.data)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No overview data available</p>
        </div>
      );
    }

    const filteredData = filterData(overviewData.data);

    return (
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Filter Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <button
              onClick={() => setIsFilterSectionOpen(!isFilterSectionOpen)}
              className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-md"
            >
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {Object.values(appliedFilters).some((value) => value !== '') && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                )}
              </div>
              {isFilterSectionOpen ? (
                <FaChevronDown className="text-gray-400" />
              ) : (
                <FaChevronRight className="text-gray-400" />
              )}
            </button>
          </div>

          {/* Collapsible Filter Content */}
          {isFilterSectionOpen && (
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Company Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={filters.companyName}
                    onChange={(e) => handleFilterChange('companyName', e.target.value)}
                    placeholder="Search by company name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Sold Last 12 Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sold Last 12 Days
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.minSold12Days}
                      onChange={(e) => handleFilterChange('minSold12Days', e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={filters.maxSold12Days}
                      onChange={(e) => handleFilterChange('maxSold12Days', e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Sold Last 2 Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sold Last 2 Days
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.minSold2Days}
                      onChange={(e) => handleFilterChange('minSold2Days', e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={filters.maxSold2Days}
                      onChange={(e) => handleFilterChange('maxSold2Days', e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Scraped Last 2 Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scraped Last 2 Days
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.minScraped2Days}
                      onChange={(e) => handleFilterChange('minScraped2Days', e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={filters.maxScraped2Days}
                      onChange={(e) => handleFilterChange('maxScraped2Days', e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Active Adverts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Active Adverts
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.minActiveAdverts}
                      onChange={(e) => handleFilterChange('minActiveAdverts', e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={filters.maxActiveAdverts}
                      onChange={(e) => handleFilterChange('maxActiveAdverts', e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={applyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Clear Filters
                </button>
                <div className="text-sm text-gray-600">
                  Showing {filteredData.length} of {overviewData.data.length} dealers
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Dealers Overview</h2>
              <button
                onClick={fetchOverviewData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Refresh Data
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold Last 12 Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold Last 2 Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scraped Last 2 Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Adverts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((dealer, index) => (
                  <tr key={`${dealer.user_id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getDealerIcon(dealer.company_name)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {dealer.company_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dealer.sold_last_12_days}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {dealer.sold_last_2_days}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {dealer.scraped_last_2_days}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {dealer.active_adverts}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openWishlistPopup(dealer)}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
                      >
                        <span className="text-sm">View</span>
                        <FaEye className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scraping analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={viewMode === 'overview' ? fetchOverviewData : fetchScrapingAnalysis}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Scraping Analysis Dashboard</h1>
              <p className="text-gray-600">Car sales analysis and dealer performance insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'overview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'detailed'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Detailed View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Rendering Based on View Mode */}
        {viewMode === 'overview' ? (
          renderOverviewTable()
        ) : analysisData?.data ? (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Cars Sold Today</h3>
                    <p className="text-3xl font-bold">
                      {analysisData.data.soldToday?.reduce(
                        (sum, dealer) => sum + parseInt(dealer.sold_today_count),
                        0
                      ) || 0}
                    </p>
                  </div>
                  <FaCar className="text-4xl opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Dealers Who Sold Today</h3>
                    <p className="text-3xl font-bold">{analysisData.data.soldToday?.length || 0}</p>
                  </div>
                  <FaEye className="text-4xl opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Top Sale Count</h3>
                    <p className="text-3xl font-bold">
                      {Math.max(
                        ...(analysisData.data.soldToday?.map((d) =>
                          parseInt(d.sold_today_count)
                        ) || [0])
                      )}
                    </p>
                  </div>
                  <FaTachometerAlt className="text-4xl opacity-80" />
                </div>
              </div>
            </div>

            {/* Today's Sales */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Today's Sales</h2>
                <button
                  onClick={fetchScrapingAnalysis}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Refresh Data
                </button>
              </div>

              <div className="space-y-4">
                {analysisData.data.soldToday?.map((dealer) => {
                  const historicalData = getDealerHistoricalData(dealer.user_id);

                  return (
                    <div
                      key={dealer.user_id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Dealer Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl">{getDealerIcon(dealer.company_name)}</span>
                          <div>
                            <h3
                              className="font-bold text-lg text-gray-900"
                              title={dealer.company_name}
                            >
                              {dealer.company_name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>ID: {dealer.user_id}</span>
                              <a
                                href={dealer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <span>View Profile</span>
                                <FaExternalLinkAlt className="text-xs" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-lg">
                            {dealer.sold_today_count} sold today
                          </span>

                          {historicalData.length > 0 && (
                            <button
                              onClick={() => toggleDealerHistory(dealer.user_id)}
                              className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                              title="View historical data"
                            >
                              <FaHistory />
                              <span>History</span>
                              {expandedDealerHistory.has(dealer.user_id) ? (
                                <FaChevronDown />
                              ) : (
                                <FaChevronRight />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => toggleCard(dealer.user_id)}
                            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
                          >
                            <span>Today's Cars</span>
                            {expandedCards.has(dealer.user_id) ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Dealer Historical Data */}
                      {expandedDealerHistory.has(dealer.user_id) && historicalData.length > 0 && (
                        <div className="mb-6 bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                            <FaHistory />
                            <span>Historical Performance</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {historicalData.map((historyItem) => (
                              <div
                                key={historyItem.date}
                                className="bg-white rounded-lg p-3 border border-blue-200"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm text-gray-900">
                                    {formatDate(historyItem.date)}
                                  </span>
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    {historyItem.sold_count} sold
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {historyItem.adverts.slice(0, 2).map((advert) => (
                                    <div key={advert.advert_id} className="text-xs text-gray-600">
                                      <span className="font-medium">{advert.make}</span> -{' '}
                                      {formatPrice(advert.price)}
                                    </div>
                                  ))}
                                  {historyItem.adverts.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{historyItem.adverts.length - 2} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Today's Cars */}
                      {expandedCards.has(dealer.user_id) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dealer.adverts?.map((advert) => (
                            <div
                              key={advert.advert_id}
                              className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900">{advert.make}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{advert.model}</p>
                                  <div className="flex items-center space-x-3 mt-3 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <FaCalendarAlt />
                                      <span>{formatDate(advert.first_registration)}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <FaTachometerAlt />
                                      <span>{advert.mileage}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <FaGasPump />
                                      <span>{advert.fuel_type}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-3">
                                  <p className="font-bold text-green-600 text-lg">
                                    {formatPrice(advert.price)}
                                  </p>
                                  {advert.image_url && (
                                    <img
                                      src={advert.image_url}
                                      alt={advert.make}
                                      className="w-20 h-15 object-cover rounded mt-2"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No data available</p>
          </div>
        )}

        {/* Dealer Listings Popup */}
        {showWishlistPopup && selectedDealer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {selectedDealer.company_name || 'Unknown Dealer'} - Listings
                    </h3>
                    <div className="text-sm text-gray-300">
                      <span>ID: {selectedDealer.user_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Wishlist Sending Options Button */}
                    <button
                      onClick={openWishlistSendingOptionsPopup}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                      title="Wishlist Sending Options"
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={closeWishlistPopup}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
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
                  </div>
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
                                        openIndividualWishlistPopup(listing);
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
                          onClick={closeWishlistPopup}
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

        {/* Individual Wishlist Popup */}
        {showIndividualWishlistPopup && selectedListingForWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Add to Wishlist</h3>
                  <button
                    onClick={closeIndividualWishlistPopup}
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
                    {selectedListingForWishlist.make} {selectedListingForWishlist.model}
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Listing ID: {selectedListingForWishlist.listingsitea_id}</div>
                    <div>
                      Price:{' '}
                      {formatCurrency(
                        selectedListingForWishlist.price,
                        selectedListingForWishlist.price_currency
                      )}
                    </div>
                    <div>Location: {selectedListingForWishlist.location}</div>
                    <div>Seller ID: {selectedListingForWishlist.seller_id}</div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleIndividualWishlistSubmit} className="space-y-4">
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
                      onClick={closeIndividualWishlistPopup}
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

export default ScrapingAnalysis;
