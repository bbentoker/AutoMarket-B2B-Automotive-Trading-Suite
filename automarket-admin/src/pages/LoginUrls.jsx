import React, { useState, useEffect, useCallback } from 'react';
import { getDealersWithLoginCodes } from '../utils/api';
import toast from 'react-hot-toast';

const LoginUrls = () => {
  const [allDealers, setAllDealers] = useState([]); // Store all dealers data
  const [filteredDealers, setFilteredDealers] = useState([]); // Filtered dealers based on search
  const [displayedDealers, setDisplayedDealers] = useState([]); // Current page dealers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [urlMode, setUrlMode] = useState('wishlist'); // 'wishlist' or 'fastest'
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20, // Default to 20 items per page as requested
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch all dealers from API (only once)
  const fetchAllDealers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all dealers with login codes from the new endpoint
      const response = await getDealersWithLoginCodes();

      // Handle the actual API response structure
      const dealers = response.users || [];
      setAllDealers(dealers);
      setFilteredDealers(dealers); // Initially show all dealers
    } catch (err) {
      console.error('Error fetching dealers:', err);
      setError('Failed to load dealers');
      toast.error('Failed to load dealers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search term for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Client-side search functionality
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      // If no search term, show all dealers
      setFilteredDealers(allDealers);
    } else {
      // Filter dealers based on search term
      const filtered = allDealers.filter((dealer) => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
          (dealer.name && dealer.name.toLowerCase().includes(searchLower)) ||
          (dealer.company_name && dealer.company_name.toLowerCase().includes(searchLower)) ||
          (dealer.email && dealer.email.toLowerCase().includes(searchLower))
        );
      });
      setFilteredDealers(filtered);
    }

    // Reset to first page when search changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, allDealers]);

  // Client-side pagination logic
  useEffect(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedDealers = filteredDealers.slice(startIndex, endIndex);

    setDisplayedDealers(paginatedDealers);

    // Update pagination metadata
    const totalPages = Math.ceil(filteredDealers.length / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total: filteredDealers.length,
      totalPages: totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    }));
  }, [filteredDealers, pagination.page, pagination.limit]);

  // Fetch all dealers when component mounts
  useEffect(() => {
    fetchAllDealers();
  }, [fetchAllDealers]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  // Generate login URL for dealer using the login token
  const generateLoginUrl = (dealer) => {
    if (!dealer.loginCode || !dealer.loginCode.token) {
      return 'No login code available';
    }

    const baseUrl = 'https://dashboard.automarket.example.com';
    const token = dealer.loginCode.token;

    if (urlMode === 'fastest') {
      return `${baseUrl}/fastest?login_token=${token}`;
    } else {
      return `${baseUrl}/wishlist?login_token=${token}`;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Login URLs</h1>
        <p className="text-gray-400 mt-2">View and manage dealer login URLs</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Dealer Login URLs</h2>

          {/* URL Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Select URL Type:</label>
            <div className="flex gap-4">
              <button
                onClick={() => setUrlMode('wishlist')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${urlMode === 'wishlist'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                🛒 Wishlist URLs
              </button>
              <button
                onClick={() => setUrlMode('fastest')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${urlMode === 'fastest'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                ⚡ Fastest URLs
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {urlMode === 'wishlist'
                ? 'Generate URLs for the wishlist page with all listings'
                : 'Generate URLs for the fastest page with listings ≤ 8 days sell time'}
            </p>
          </div>

          {/* Loading and Error States */}
          {loading && <div className="text-blue-400 mb-4">Loading dealers...</div>}
          {error && <div className="text-red-400 mb-4">{error}</div>}

          {/* Search Bar and Page Size Selector */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search dealers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-400"
              />
              {searchTerm && debouncedSearchTerm !== searchTerm && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm whitespace-nowrap">Items per page:</label>
              <select
                value={pagination.limit}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="p-3 rounded border border-gray-600 bg-gray-700 text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-4 text-gray-400 text-sm">
              {searchTerm ? (
                <>
                  {debouncedSearchTerm === searchTerm
                    ? `Found ${pagination.total} dealers matching "${searchTerm}"`
                    : `Searching for "${searchTerm}"...`}
                </>
              ) : (
                `Showing ${allDealers.length} total dealers`
              )}
            </div>
          )}
        </div>

        {/* Dealers List */}
        <div className="space-y-4">
          {displayedDealers.map((dealer) => (
            <div key={dealer.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {dealer.company_name || dealer.name || 'N/A'}
                      </h3>
                      <p className="text-gray-300">{dealer.email}</p>
                      <p className="text-gray-400 text-sm">
                        Registered: {formatDate(dealer.created_at)}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-600 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-gray-300 text-sm">Login URL:</p>
                          {dealer.loginCode && (
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-gray-400">
                                Created: {formatDate(dealer.loginCode.created_at)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <code
                            className={`text-sm px-2 py-1 rounded flex-1 break-all ${dealer.loginCode && dealer.loginCode.token
                                ? 'text-blue-300 bg-gray-800'
                                : 'text-red-300 bg-red-900'
                              }`}
                          >
                            {generateLoginUrl(dealer)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(generateLoginUrl(dealer))}
                            disabled={!dealer.loginCode || !dealer.loginCode.token}
                            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${dealer.loginCode && dealer.loginCode.token
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDealers.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-8">
            {searchTerm ? `No dealers found matching "${searchTerm}"` : 'No dealers found'}
          </div>
        )}

        {/* Pagination Controls */}
        {displayedDealers.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              dealers
            </div>
            <div className="flex items-center space-x-1">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded text-sm ${pagination.page === 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                First
              </button>

              {/* Previous */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-1 rounded text-sm ${pagination.hasPrev
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded text-sm ${pageNum === pagination.page
                          ? 'bg-blue-700 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-1 rounded text-sm ${pagination.hasNext
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Next
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className={`px-3 py-1 rounded text-sm ${pagination.page === pagination.totalPages
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginUrls;
