import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getListings,
  getStatusesWithCounts,
  updateListing,
  reserveListing,
  makeOffer,
  purchaseListing,
  setProformaInvoiceSent,
  setPaymentReceived,
  setPaymentSent,
  setBookTransport,
  setSendDocuments,
  setCarPickedUp,
  setCarDelivered,
  setCarDeregistered,
  setDealDone,
  setNoDeal,
  reactivateListing,
} from '../utils/api';
import ReservePopup from './ReservePopup';

// Status transition configuration from KanbanBoard
const STATUS_TRANSITIONS = {
  1: { allowedNextStatuses: [2, 3, 14] },
  2: { allowedNextStatuses: [4, 14] },
  3: { allowedNextStatuses: [4, 14] },
  4: { allowedNextStatuses: [5, 14] },
  5: { allowedNextStatuses: [6, 14] },
  6: { allowedNextStatuses: [7, 14] },
  7: { allowedNextStatuses: [8, 14] }, // Payment Sent → Transport Booked
  8: { allowedNextStatuses: [9, 14] }, // Transport Booked → Documents Sent
  9: { allowedNextStatuses: [10, 14] }, // Documents Sent → Car Picked Up
  10: { allowedNextStatuses: [11, 14] },
  11: { allowedNextStatuses: [12, 14] },
  12: { allowedNextStatuses: [13, 14] },
  13: { allowedNextStatuses: [] },
  14: { allowedNextStatuses: [] },
};

// Popup and API configuration for each status
const STATUS_CONFIG = {
  2: {
    needsPopup: true,
    popupMode: 'reserve',
    apiMethod: 'reserveListing',
    requiresDealer: true,
    requiresAmount: false,
    successMessage: (listing, statusName) =>
      `Successfully moved "${listing.title || `Listing ${listing.id}`}" to ${statusName}`,
  },
  3: {
    needsPopup: true,
    popupMode: 'offer',
    apiMethod: 'makeOffer',
    requiresDealer: true,
    requiresAmount: true,
    successMessage: (listing, statusName, amount) =>
      `Successfully made an offer of €${amount} for "${listing.title || `Listing ${listing.id}`}"`,
  },
  4: {
    needsPopup: true,
    popupMode: 'purchase',
    apiMethod: 'purchaseListing',
    requiresDealer: false,
    requiresAmount: true,
    successMessage: (listing, statusName, amount) =>
      `Successfully marked "${listing.title || `Listing ${listing.id}`}" as purchased for €${amount}`,
  },
  5: {
    needsPopup: true,
    popupMode: 'billingCompany',
    apiMethod: 'setProformaInvoiceSent',
    requiresDealer: false,
    requiresAmount: false,
    requiresBillingCompany: true,
    successMessage: (listing, statusName, billingCompany) =>
      `Successfully moved "${listing.title || `Listing ${listing.id}`}" to ${statusName} with ${billingCompany} billing company`,
  },
  6: { needsPopup: false, apiMethod: 'setPaymentReceived' },
  7: {
    needsPopup: true,
    popupMode: 'paymentSent',
    apiMethod: 'setPaymentSent',
    requiresDealer: false,
    requiresAmount: false,
    requiresSellerInfo: true,
    successMessage: (listing) =>
      `Successfully marked payment sent for "${listing.title || `Listing ${listing.id}`}"`,
  },
  8: {
    needsPopup: true,
    popupMode: 'bookTransport',
    apiMethod: 'setBookTransport',
    requiresDealer: false,
    requiresAmount: false,
    requiresDate: true,
    successMessage: (listing, statusName, amount, date) =>
      `Successfully booked transport for "${listing.title || `Listing ${listing.id}`}" with pickup date ${date}`,
  },
  9: {
    needsPopup: true,
    popupMode: 'sendDocuments',
    apiMethod: 'setSendDocuments',
    requiresDealer: false,
    requiresAmount: false,
    requiresTrackingCode: true,
    successMessage: (listing, statusName, amount, trackingCode) =>
      `Successfully sent documents for "${listing.title || `Listing ${listing.id}`}" with tracking code ${trackingCode}`,
  },
  10: { needsPopup: false, apiMethod: 'setCarPickedUp' },
  11: { needsPopup: false, apiMethod: 'setCarDelivered' },
  12: { needsPopup: false, apiMethod: 'setCarDeregistered' },
  13: { needsPopup: false, apiMethod: 'setDealDone' },
  14: { needsPopup: false, apiMethod: 'setNoDeal' },
};

// API methods mapping
const API_METHODS = {
  reserveListing: async (listing, dealerId) => await reserveListing(listing.id, dealerId),
  makeOffer: async (listing, dealerId, amount) => await makeOffer(listing.id, dealerId, amount),
  purchaseListing: async (listing, dealerId, amount, transportCost) =>
    await purchaseListing(listing.id, amount, transportCost),
  setProformaInvoiceSent: async (listing, dealerId, amount, billingCompany) =>
    await setProformaInvoiceSent(listing.id, billingCompany),
  setPaymentReceived: async (listing) => await setPaymentReceived(listing.id),
  setPaymentSent: async (listing, dealerId, amount, sellerInfo) =>
    await setPaymentSent(listing.id, sellerInfo),
  setSendDocuments: async (listing, dealerId, trackingCode) =>
    await setSendDocuments(listing.id, trackingCode),
  setBookTransport: async (listing, dealerId, dates) =>
    await setBookTransport(listing.id, dates.pickup, dates.delivery),
  setCarPickedUp: async (listing) => await setCarPickedUp(listing.id),
  setCarDelivered: async (listing) => await setCarDelivered(listing.id),
  setCarDeregistered: async (listing) => await setCarDeregistered(listing.id),
  setDealDone: async (listing) => await setDealDone(listing.id),
  setNoDeal: async (listing) => await setNoDeal(listing.id),
  reactivateListing: async (listing) => await reactivateListing(listing.id),
  updateListing: async (listing) => await updateListing(listing.id, { ...listing }),
};

const StatusListingView = ({ showReserver = false, fixedStatusId = null }) => {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [updating, setUpdating] = useState(new Set());
  const [reservePopupData, setReservePopupData] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter states
  const [filters, setFilters] = useState({
    regNo: '',
    vin: '',
    refNo: '',
    brand: '',
    model: '',
  });

  // Fetch statuses on component mount
  useEffect(() => {
    fetchStatuses();
  }, []);

  // Update selectedStatusId when fixedStatusId changes
  useEffect(() => {
    if (fixedStatusId) {
      setSelectedStatusId(fixedStatusId.toString());
    }
  }, [fixedStatusId]);

  // Fetch listings when selected status changes
  useEffect(() => {
    if (selectedStatusId) {
      fetchListings();
    }
  }, [selectedStatusId]);

  // Auto-clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchStatuses = async () => {
    setStatusesLoading(true);
    try {
      const statusesData = await getStatusesWithCounts();
      // Transform the data structure to include counts with the status info
      const transformedStatuses = (statusesData || []).map((item) => ({
        id: item.status.id,
        name: item.status.name,
        created_at: item.status.created_at,
        updated_at: item.status.updated_at,
        count: item.count,
        notViewedCount: item.notViewedCount,
      }));

      setStatuses(transformedStatuses);
      // If no fixed status is provided, select the first one
      if (!fixedStatusId && transformedStatuses.length > 0) {
        setSelectedStatusId(transformedStatuses[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setError('Failed to fetch statuses');
    } finally {
      setStatusesLoading(false);
    }
  };

  const fetchListings = async () => {
    if (!selectedStatusId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getListings({
        statusId: parseInt(selectedStatusId),
        limit: 1000,
      });
      setListings(response.listings || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const getNextStatuses = (currentStatusId) => {
    const transitions = STATUS_TRANSITIONS[parseInt(currentStatusId)];
    if (!transitions) return [];

    return transitions.allowedNextStatuses
      .map((statusId) => statuses.find((s) => s.id === statusId))
      .filter((status) => status);
  };

  const getStatusConfig = (statusId) => {
    return STATUS_CONFIG[parseInt(statusId)] || { needsPopup: false, apiMethod: 'updateListing' };
  };

  const executeApiCall = async (
    listing,
    statusId,
    dealerId,
    amount,
    sellerInfo,
    billingCompany,
    transportCost
  ) => {
    const config = getStatusConfig(statusId);
    const apiMethod = API_METHODS[config.apiMethod];

    if (!apiMethod) {
      throw new Error(`API method ${config.apiMethod} not found`);
    }

    switch (config.apiMethod) {
      case 'reserveListing':
        return await apiMethod(listing, dealerId);
      case 'makeOffer':
        return await apiMethod(listing, dealerId, amount);
      case 'purchaseListing':
        return await apiMethod(listing, dealerId, amount, transportCost);
      case 'setProformaInvoiceSent':
        return await apiMethod(listing, dealerId, amount, billingCompany);
      case 'setPaymentSent':
        return await apiMethod(listing, dealerId, amount, sellerInfo);
      case 'setSendDocuments':
        return await apiMethod(listing, dealerId, amount); // Using amount as tracking code
      case 'setBookTransport':
        return await apiMethod(listing, dealerId, amount); // amount contains the dates object with pickup and delivery
      default:
        return await apiMethod(listing);
    }
  };

  const generateSuccessMessage = (listing, statusId, amount = null, billingCompany = null) => {
    const config = getStatusConfig(statusId);
    const statusName = statuses.find((s) => s.id === parseInt(statusId))?.name;

    if (config.successMessage) {
      return config.successMessage(listing, statusName, amount || billingCompany, amount);
    }

    return `Successfully moved "${listing.title || `Listing ${listing.id}`}" to ${statusName}`;
  };

  const handleStatusChange = async (listing, newStatusId) => {
    const config = getStatusConfig(newStatusId);

    if (config.needsPopup) {
      setPendingStatusChange({ listing, newStatusId });
      setReservePopupData({
        isOpen: true,
        listing: listing,
        mode: config.popupMode,
      });
      return;
    }

    // For statuses that don't need popup, proceed directly
    await processStatusChange(listing, newStatusId);
  };

  const processStatusChange = async (
    listing,
    newStatusId,
    dealerId = null,
    amount = null,
    sellerInfo = null,
    billingCompany = null,
    transportCost = null
  ) => {
    setUpdating((prev) => new Set([...prev, listing.id]));
    setError(null);

    try {
      await executeApiCall(
        listing,
        newStatusId,
        dealerId,
        amount,
        sellerInfo,
        billingCompany,
        transportCost
      );

      // Update local state
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, status_id: parseInt(newStatusId) } : l))
      );

      const message = generateSuccessMessage(listing, newStatusId, amount, billingCompany);
      setSuccessMessage(message);

      // If the listing is no longer in this status, remove it from view
      if (parseInt(newStatusId) !== parseInt(selectedStatusId)) {
        setListings((prev) => prev.filter((l) => l.id !== listing.id));
      }
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError(`Failed to update listing: ${err.message}`);
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listing.id);
        return newSet;
      });
    }
  };

  const handlePopupConfirm = async (
    dealerId,
    amount = null,
    sellerInfo = null,
    billingCompany = null,
    transportCost = null
  ) => {
    if (pendingStatusChange) {
      const { listing, newStatusId } = pendingStatusChange;
      await processStatusChange(
        listing,
        newStatusId,
        dealerId,
        amount,
        sellerInfo,
        billingCompany,
        transportCost
      );
    }
    setReservePopupData(null);
    setPendingStatusChange(null);
  };

  const handlePopupCancel = () => {
    setReservePopupData(null);
    setPendingStatusChange(null);
  };

  const handleReactivate = async (listing) => {
    setUpdating((prev) => new Set([...prev, listing.id]));
    setError(null);

    try {
      await API_METHODS.reactivateListing(listing);

      // Remove the listing from the current view since it's no longer "No Deal"
      setListings((prev) => prev.filter((l) => l.id !== listing.id));

      setSuccessMessage(`Successfully reactivated "${listing.title || `Listing ${listing.id}`}"`);
    } catch (err) {
      console.error('Error reactivating listing:', err);
      setError(`Failed to reactivate listing: ${err.message}`);
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listing.id);
        return newSet;
      });
    }
  };

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

  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      regNo: '',
      vin: '',
      refNo: '',
      brand: '',
      model: '',
    });
  };

  // Filter listings based on filter criteria
  const filteredListings = listings.filter((listing) => {
    const regNoMatch =
      !filters.regNo ||
      (listing.registration_number &&
        listing.registration_number.toLowerCase().includes(filters.regNo.toLowerCase()));

    const vinMatch =
      !filters.vin ||
      (listing.vin_number && listing.vin_number.toLowerCase().includes(filters.vin.toLowerCase()));

    const refNoMatch =
      !filters.refNo ||
      (listing.reference_no &&
        listing.reference_no.toLowerCase().includes(filters.refNo.toLowerCase()));

    const brandMatch =
      !filters.brand ||
      (listing.brand_name &&
        listing.brand_name.toLowerCase().includes(filters.brand.toLowerCase()));

    const modelMatch =
      !filters.model ||
      (listing.model && listing.model.toLowerCase().includes(filters.model.toLowerCase()));

    return regNoMatch && vinMatch && refNoMatch && brandMatch && modelMatch;
  });

  // Sort filtered listings
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

  const selectedStatus = statuses.find((s) => s.id.toString() === selectedStatusId);

  // Determine if we should show the reserver column
  const shouldShowReserver =
    showReserver ||
    parseInt(selectedStatusId) === 2 || // Status 2 is "Reserved"
    parseInt(selectedStatusId) === 4 || // Status 4 is "Purchased"
    sortedListings.some((listing) => listing.reserver); // Or if any listing has reserver data

  // Determine the header text for the reserver column
  const getReserverHeaderText = () => {
    if (parseInt(selectedStatusId) === 4) {
      return 'Buyer';
    }
    return 'Reserver';
  };

  return (
    <div className="bg-gray-800 min-w-full rounded-t-xl shadow-lg pt-5">
      <div className="mb-6 px-4 ">
        {/* Status Selector - only show if no fixed status */}
        {!fixedStatusId && (
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-2">Select Status:</label>
            <select
              value={selectedStatusId}
              onChange={(e) => setSelectedStatusId(e.target.value)}
              className="w-64 p-3 rounded border border-gray-600 bg-gray-700 text-white"
              disabled={statusesLoading}
            >
              {statusesLoading ? (
                <option>Loading statuses...</option>
              ) : (
                statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name} ({status.count} total
                    {status.notViewedCount > 0 ? `, ${status.notViewedCount} new` : ''})
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Filter Controls */}
        {selectedStatusId && (
          <div className="mb-6 p-4 bg-gray-700 rounded-t-lg -mx-4 -mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white text-lg font-medium">Filters</h4>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Registration No</label>
                <input
                  type="text"
                  value={filters.regNo}
                  onChange={(e) => handleFilterChange('regNo', e.target.value)}
                  placeholder="Filter by reg no..."
                  className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">VIN Number</label>
                <input
                  type="text"
                  value={filters.vin}
                  onChange={(e) => handleFilterChange('vin', e.target.value)}
                  placeholder="Filter by VIN..."
                  className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Reference No</label>
                <input
                  type="text"
                  value={filters.refNo}
                  onChange={(e) => handleFilterChange('refNo', e.target.value)}
                  placeholder="Filter by ref no..."
                  className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Brand</label>
                <input
                  type="text"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  placeholder="Filter by brand..."
                  className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  placeholder="Filter by model..."
                  className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            {/* Active filters indicator */}
            {Object.values(filters).some((filter) => filter.trim() !== '') && (
              <div className="mt-3 text-sm text-blue-300">
                Active filters:{' '}
                {Object.entries(filters)
                  .filter(([, value]) => value.trim() !== '')
                  .map(([key, value]) => `${key}: "${value}"`)
                  .join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Loading and Error States */}
        {loading && <div className="text-blue-400 mb-4">Loading listings...</div>}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
      </div>

      {/* Table */}
      {selectedStatus && (
        <div className="overflow-x-auto">
          <div className="px-4 mb-4">
            <h3 className="text-xl font-semibold text-white">
              {selectedStatus.name} Listings
              <span className="text-gray-300">
                ({filteredListings.length} of {selectedStatus.count} shown
                {selectedStatus.notViewedCount > 0 && (
                  <span className="text-yellow-400"> • {selectedStatus.notViewedCount} new</span>
                )}
                )
              </span>
            </h3>
          </div>

          <table className="w-full text-white border-collapse">
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
                {shouldShowReserver && (
                  <th className="text-left p-3 cursor-pointer hover:bg-gray-700">
                    {getReserverHeaderText()}
                  </th>
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

                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.map((listing) => {
                const nextStatuses = getNextStatuses(listing.status_id);
                const isUpdating = updating.has(listing.id);

                return (
                  <tr key={listing.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-3 font-medium">{listing.registration_number || 'N/A'}</td>
                    <td className="p-3 font-medium">{listing.vin_number || 'N/A'}</td>
                    <td className="p-3 font-medium">{listing.reference_no || 'N/A'}</td>
                    {shouldShowReserver && (
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
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((status) => (
                          <button
                            key={status.id}
                            onClick={() => handleStatusChange(listing, status.id)}
                            disabled={isUpdating}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              status.id === 14
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isUpdating ? 'Updating...' : `Move to ${status.name}`}
                          </button>
                        ))}

                        {/* Show reactivate button only for "No Deal" status (status 14) */}
                        {listing.status_id === 14 && (
                          <button
                            onClick={() => handleReactivate(listing)}
                            disabled={isUpdating}
                            className={`px-3 py-1 rounded text-sm transition-colors bg-green-600 hover:bg-green-700 text-white ${
                              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isUpdating ? 'Reactivating...' : 'Reactivate'}
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/listing/${listing.id}`)}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {sortedListings.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-8">No listings found for this status.</div>
          )}
        </div>
      )}

      {/* Reserve/Offer Popup */}
      <ReservePopup
        isOpen={reservePopupData?.isOpen}
        listing={reservePopupData?.listing}
        mode={reservePopupData?.mode}
        onClose={handlePopupCancel}
        onConfirm={handlePopupConfirm}
      />
    </div>
  );
};

export default StatusListingView;
