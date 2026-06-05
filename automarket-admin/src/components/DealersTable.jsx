import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDealers, getUserStatuses, updateDealerStatus } from '../utils/api';
import toast from 'react-hot-toast';

const DealersTable = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch user statuses when component mounts
  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusesLoading(true);
      try {
        const statusData = await getUserStatuses();
        console.log('Status data received:', statusData); // Debug log

        // Handle different possible response structures
        let statusArray = [];
        if (Array.isArray(statusData)) {
          statusArray = statusData;
        } else if (statusData && Array.isArray(statusData.userStatuses)) {
          statusArray = statusData.userStatuses;
        } else if (statusData && Array.isArray(statusData.statuses)) {
          statusArray = statusData.statuses;
        } else if (statusData && Array.isArray(statusData.data)) {
          statusArray = statusData.data;
        } else {
          console.warn('Unexpected status data structure:', statusData);
        }

        setStatuses(statusArray);
      } catch (err) {
        console.error('Error fetching user statuses:', err);
        setError('Failed to load user statuses');
        setStatuses([]); // Ensure statuses is always an array
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  // Fetch dealers when component mounts or when pagination changes
  useEffect(() => {
    fetchDealers();
  }, [pagination.page]);

  const fetchDealers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDealers({
        page: pagination.page,
        limit: pagination.limit,
      });

      // Handle the actual API response structure
      setDealers(response.users || []);

      // Map the API pagination response to our expected format
      if (response.pagination) {
        setPagination({
          total: response.pagination.totalUsers,
          page: response.pagination.currentPage,
          limit: pagination.limit,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNextPage,
          hasPrev: response.pagination.hasPrevPage,
        });
      }
    } catch (err) {
      console.error('Error fetching dealers:', err);
      setError('Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  // Filter dealers based on search term
  const filteredDealers = dealers.filter((dealer) =>
    Object.values(dealer).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort dealers
  const sortedDealers = [...filteredDealers].sort((a, b) => {
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

  const handleStatusChange = async (dealerId, newStatusId) => {
    // Find dealer and new status names for the toast message
    const dealer = dealers.find((d) => d.id === dealerId);
    const newStatus = statuses.find((s) => s.id === parseInt(newStatusId));

    // Create loading toast
    const loadingToastId = toast.loading(`Updating ${dealer?.name}'s status...`);

    try {
      // Call the API to update the status
      await updateDealerStatus(dealerId, parseInt(newStatusId));

      // Update the local state after successful API call
      setDealers((prev) =>
        prev.map((dealer) =>
          dealer.id === dealerId ? { ...dealer, status_id: parseInt(newStatusId) } : dealer
        )
      );

      // Show success toast
      toast.success(`Successfully updated ${dealer?.name}'s status to ${newStatus?.name}`, {
        id: loadingToastId,
      });
    } catch (err) {
      console.error('Error updating dealer status:', err);
      setError('Failed to update dealer status');

      // Show error toast
      toast.error(`Failed to update ${dealer?.name}'s status`, { id: loadingToastId });

      // Revert the select box to the previous status if the API call fails
      setDealers((prev) => [...prev]); // Trigger re-render with original state
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Dealers Management</h2>

        {/* Loading and Error States */}
        {(loading || statusesLoading) && (
          <div className="text-blue-400 mb-4">
            {statusesLoading ? 'Loading statuses...' : 'Loading dealers...'}
          </div>
        )}
        {error && <div className="text-red-400 mb-4">{error}</div>}

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search dealers..."
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
              <th className="text-left p-3">#</th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('email')}
              >
                Email {getSortIcon('email')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                Registration Date {getSortIcon('created_at')}
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSort('status_id')}
              >
                Status {getSortIcon('status_id')}
              </th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDealers.map((dealer, index) => (
              <tr key={dealer.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-3 font-medium">
                  {(pagination.page - 1) * pagination.limit + index + 1}
                </td>
                <td className="p-3 font-medium">{dealer.company_name}</td>
                <td className="p-3">{dealer.email}</td>
                <td className="p-3">{formatDate(dealer.created_at)}</td>
                <td className="p-3">
                  <select
                    value={dealer.status_id || ''}
                    onChange={(e) => handleStatusChange(dealer.id, e.target.value)}
                    className="p-1 rounded border border-gray-600 bg-gray-700 text-white text-sm"
                    disabled={statusesLoading || statuses.length === 0}
                  >
                    <option value="">Select Status</option>
                    {Array.isArray(statuses) &&
                      statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/dealers/${dealer.id}`)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedDealers.length === 0 && !loading && (
        <div className="text-center text-gray-400 py-8">No dealers found matching your search.</div>
      )}

      {/* Pagination Controls */}
      {dealers.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total
            dealers)
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
        Showing {sortedDealers.length} of {dealers.length} dealers
      </div>
    </div>
  );
};

export default DealersTable;
