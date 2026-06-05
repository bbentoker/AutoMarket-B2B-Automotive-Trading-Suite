import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getListings, getListingStatuses, deleteListing } from '../utils/api';

/**
Status Text will be shown as header of the table
*/

const ListingTable = ({ statusText, listings = [], statusId, showReserver = false }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [fetchedListings, setFetchedListings] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [deletingListings, setDeletingListings] = useState(new Set());
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [listingsLoading, setListingsLoading] = useState(false);

  // Fetch listing statuses when component mounts
  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusesLoading(true);
      try {
        const statusData = await getListingStatuses();
        setStatuses(statusData || []);
      } catch (err) {
        console.error('Error fetching listing statuses:', err);
        setError('Failed to load listing statuses');
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  // Fetch listings when statusId prop changes or when pagination changes
  useEffect(() => {
    if (statusId) {
      fetchListings();
    }
  }, [statusId, pagination.page]);

  const fetchListings = async () => {
    setListingsLoading(true);
    setError(null);
    try {
      const response = await getListings({
        statusId: statusId,
        page: pagination.page,
        limit: 1000,
      });

      setFetchedListings(response.listings || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
    } finally {
      setListingsLoading(false);
    }
  };

  // Use fetched listings if available, otherwise fall back to props or sample data
  const displayListings =
    fetchedListings.length > 0 ? fetchedListings : listings.length > 0 ? listings : [];

  // Filter listings based on search term
  const filteredListings = displayListings.filter((listing) =>
    Object.values(listing).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = async (listingId, newStatusId) => {
    try {
      // TODO: Add API call to update listing status
      console.log(`Updating listing ${listingId} to status ${newStatusId}`);

      // Update the local state optimistically
      setFetchedListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId ? { ...listing, status_id: parseInt(newStatusId) } : listing
        )
      );
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError('Failed to update listing status');
    }
  };

  const handleDelete = async (listingId) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this listing? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingListings((prev) => new Set([...prev, listingId]));
      setError(null); // Clear any previous errors

      await deleteListing(listingId);

      // Remove from local state
      setFetchedListings((prev) => prev.filter((listing) => listing.id !== listingId));

      // Update pagination if needed
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError(`Failed to delete listing: ${err.message}`);
    } finally {
      setDeletingListings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">{statusText} Car Listings</h2>

        {/* Loading and Error States */}
        {(statusesLoading || listingsLoading) && (
          <div className="text-blue-400 mb-4">
            {statusesLoading ? 'Loading statuses...' : 'Loading listings...'}
          </div>
        )}
        {error && <div className="text-red-400 mb-4">{error}</div>}

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-600">
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('registration_number')}
              >
                Registration {getSortIcon('registration_number')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('vin_number')}
              >
                VIN {getSortIcon('vin_number')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('reference_no')}
              >
                Reference No {getSortIcon('reference_no')}
              </th>
              {showReserver && (
                <th className="text-left p-3 cursor-pointer hover:bg-gray-700">Reserver</th>
              )}
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('brand_name')}
              >
                Brand {getSortIcon('brand_name')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('model')}
              >
                Model {getSortIcon('model')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('first_registration')}
              >
                Year {getSortIcon('first_registration')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('color')}
              >
                Color {getSortIcon('color')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('km_stand')}
              >
                KM {getSortIcon('km_stand')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('fuel_type')}
              >
                Fuel {getSortIcon('fuel_type')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('transmission_type')}
              >
                Transmission {getSortIcon('transmission_type')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('listing_price')}
              >
                Price {getSortIcon('listing_price')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedListings.map((listing) => (
              <tr key={listing.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-3 font-medium">{listing.registration_number || 'N/A'}</td>
                <td className="p-3 font-medium">{listing.vin_number || 'N/A'}</td>
                <td className="p-3 font-medium">{listing.reference_no || 'N/A'}</td>
                {showReserver && (
                  <td className="p-3 font-medium">{listing.reserver?.company_name || 'N/A'}</td>
                )}
                <td className="p-3 font-medium">{listing.brand_name}</td>
                <td className="p-3">{listing.model}</td>
                <td className="p-3">
                  {listing.first_registration
                    ? new Date(listing.first_registration).getFullYear()
                    : 'N/A'}
                </td>
                <td className="p-3">{listing.color}</td>
                <td className="p-3">{listing.km_stand?.toLocaleString()} km</td>
                <td className="p-3">{listing.fuel_type}</td>
                <td className="p-3">{listing.transmission_type}</td>
                <td className="p-3 font-medium">
                  €
                  {Number(listing.listing_price).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="p-3">
                  <select
                    value={listing.status_id || ''}
                    onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                    className="p-1 rounded border border-gray-600 bg-gray-700 text-white text-sm"
                    disabled={true}
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(listing.id)}
                      className={`px-3 py-1 text-white rounded text-sm ${
                        deletingListings.has(listing.id)
                          ? 'bg-red-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      disabled={deletingListings.has(listing.id)}
                    >
                      {deletingListings.has(listing.id) ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedListings.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No listings found matching your search.
        </div>
      )}

      {/* Pagination Controls */}
      {fetchedListings.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total
            listings)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className={`px-3 py-1 rounded text-sm ${
                pagination.hasPrev
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-gray-700 text-white rounded text-sm">
              {pagination.page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className={`px-3 py-1 rounded text-sm ${
                pagination.hasNext
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 text-gray-400 text-sm">
        Showing {sortedListings.length} of {displayListings.length} listings
      </div>
    </div>
  );
};

export default ListingTable;
