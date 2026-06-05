import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import {
  getListingStatuses,
  getListings,
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
} from '../utils/api';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import ReservePopup from './ReservePopup';

// Status transition configuration
const STATUS_TRANSITIONS = {
  // From Cars for Sale (1) - can jump to Reserved (2) or Offers (3), or No Deal (14)
  1: {
    allowedNextStatuses: [2, 3, 14],
  },
  // From Reserved (2) - must go to Purchased (4), or No Deal (14)
  2: {
    allowedNextStatuses: [4, 14], // Purchased or No Deal
  },
  // From Offers (3) - must go to Purchased (4), or No Deal (14)
  3: {
    allowedNextStatuses: [4, 14], // Purchased or No Deal
  },
  // From Purchased (4) onwards - must go sequentially, no skipping, or No Deal (14)
  4: {
    allowedNextStatuses: [5, 14], // Proforma Invoice Sent or No Deal
  },
  5: {
    allowedNextStatuses: [6, 14], // Payment Received or No Deal
  },
  6: {
    allowedNextStatuses: [7, 14], // Payment Sent or No Deal
  },
  7: {
    allowedNextStatuses: [8, 14], // Payment Sent → Transport Booked or No Deal
  },
  8: {
    allowedNextStatuses: [9, 14], // Transport Booked → Documents Sent or No Deal
  },
  9: {
    allowedNextStatuses: [10, 14], // Documents Sent → Car Picked Up or No Deal
  },
  10: {
    allowedNextStatuses: [11, 14], // Car Delivered or No Deal
  },
  11: {
    allowedNextStatuses: [12, 14], // Car De-registered or No Deal
  },
  12: {
    allowedNextStatuses: [13, 14], // Deal Done or No Deal
  },
  13: {
    allowedNextStatuses: [], // No Deal (final state)
  },
  14: {
    allowedNextStatuses: [], // End state
  },
};

// Popup and API configuration for each status
const STATUS_CONFIG = {
  2: {
    // Reserved
    needsPopup: true,
    popupMode: 'reserve',
    apiMethod: 'reserveListing',
    requiresDealer: true,
    requiresAmount: false,
    successMessage: (listing, statusName) =>
      `Successfully moved "${listing.title || `Listing ${listing.id}`}" to ${statusName}`,
  },
  3: {
    // Offers
    needsPopup: true,
    popupMode: 'offer',
    apiMethod: 'makeOffer',
    requiresDealer: true,
    requiresAmount: true,
    successMessage: (listing, statusName, amount) =>
      `Successfully made an offer of €${amount} for "${listing.title || `Listing ${listing.id}`}"`,
  },
  4: {
    // Purchased
    needsPopup: true,
    popupMode: 'purchase',
    apiMethod: 'purchaseListing',
    requiresDealer: false,
    requiresAmount: true,
    successMessage: (listing, statusName, amount) =>
      `Successfully marked "${listing.title || `Listing ${listing.id}`}" as purchased for €${amount}`,
  },
  // Add more configurations as needed for other statuses
  5: { needsPopup: false, apiMethod: 'setProformaInvoiceSent' },
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
  purchaseListing: async (listing, dealerId, amount) => await purchaseListing(listing.id, amount),
  setProformaInvoiceSent: async (listing) => await setProformaInvoiceSent(listing.id),
  setPaymentReceived: async (listing) => await setPaymentReceived(listing.id),
  setPaymentSent: async (listing) => await setPaymentSent(listing.id),
  setSendDocuments: async (listing, dealerId, amount, trackingCode) =>
    await setSendDocuments(listing.id, trackingCode),
  setBookTransport: async (listing, dealerId, amount, date) =>
    await setBookTransport(listing.id, date),
  setCarPickedUp: async (listing) => await setCarPickedUp(listing.id),
  setCarDelivered: async (listing) => await setCarDelivered(listing.id),
  setCarDeregistered: async (listing) => await setCarDeregistered(listing.id),
  setDealDone: async (listing) => await setDealDone(listing.id),
  setNoDeal: async (listing) => await setNoDeal(listing.id),
  updateListing: async (listing) => await updateListing(listing.id, { ...listing }),
};

const KanbanBoard = () => {
  const [statuses, setStatuses] = useState([]);
  const [listings, setListings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [reservePopupData, setReservePopupData] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Utility functions for status transitions
  const isValidStatusTransition = (fromStatusId, toStatusId) => {
    const fromId = parseInt(fromStatusId);
    const toId = parseInt(toStatusId);

    // Same status (reordering) is always allowed
    if (fromId === toId) return true;

    const transitions = STATUS_TRANSITIONS[fromId];
    if (!transitions) return false;

    return transitions.allowedNextStatuses.includes(toId);
  };

  const getStatusConfig = (statusId) => {
    return STATUS_CONFIG[parseInt(statusId)] || { needsPopup: false, apiMethod: 'updateListing' };
  };

  const buildUpdatedCard = (activeCard, overStatusId, dealerId, amount) => {
    const statusId = parseInt(overStatusId);
    const config = getStatusConfig(statusId);

    const updatedCard = {
      ...activeCard,
      status_id: statusId,
    };

    // Add dealer_id if required
    if (config.requiresDealer && dealerId) {
      updatedCard.dealer_id = parseInt(dealerId);
    }

    // Add amount fields based on status
    if (amount) {
      if (statusId === 3) {
        updatedCard.offer_amount = parseFloat(amount);
      } else if (statusId === 4) {
        updatedCard.amount_sold_for = parseFloat(amount);
      }
    }

    return updatedCard;
  };

  const generateSuccessMessage = (listing, statusId, amount = null) => {
    const config = getStatusConfig(statusId);
    const statusName = statuses.find((s) => s.id === parseInt(statusId))?.name;

    if (config.successMessage) {
      return config.successMessage(listing, statusName, amount, amount);
    }

    return `Successfully moved "${listing.title || `Listing ${listing.id}`}" to ${statusName}`;
  };

  const executeApiCall = async (listing, statusId, dealerId, amount) => {
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
        return await apiMethod(listing, dealerId, amount);
      case 'setProformaInvoiceSent':
        return await apiMethod(listing);
      case 'setPaymentReceived':
        return await apiMethod(listing);
      case 'setPaymentSent':
        return await apiMethod(listing);
      case 'setSendDocuments':
        return await apiMethod(listing, dealerId, amount, amount); // Using amount as tracking code
      case 'setBookTransport':
        return await apiMethod(listing, dealerId, amount, amount); // Using amount as date for now
      case 'setCarPickedUp':
        return await apiMethod(listing);
      case 'setCarDelivered':
        return await apiMethod(listing);
      case 'setCarDeregistered':
        return await apiMethod(listing);
      case 'setDealDone':
        return await apiMethod(listing);
      case 'setNoDeal':
        return await apiMethod(listing);
      case 'updateListing': {
        const updatedCard = buildUpdatedCard(listing, statusId, dealerId, amount);
        return await apiMethod(updatedCard);
      }
      default:
        throw new Error(`Unknown API method: ${config.apiMethod}`);
    }
  };

  // Fetch statuses
  const fetchStatuses = useCallback(async () => {
    try {
      const statusesData = await getListingStatuses();
      console.log('statusesData', statusesData);
      setStatuses(statusesData);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setError('Failed to fetch statuses');
    }
  }, []);

  // Fetch listings for all statuses
  const fetchListings = useCallback(
    async (input = '', isInitialLoad = false) => {
      console.log('fetchin listings ');
      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setSearchLoading(true);
        }

        // Fetch all listings at once
        const listingsData = await getListings({
          input: input,
          limit: 1000,
        });

        // Group listings by status_id
        const groupedListings = {};

        // Initialize all status groups as empty arrays
        statuses.forEach((status) => {
          groupedListings[status.id] = [];
        });

        // Group the fetched listings by their status_id
        if (listingsData.listings) {
          listingsData.listings.forEach((listing) => {
            if (listing.status_id && groupedListings[listing.status_id]) {
              groupedListings[listing.status_id].push(listing);
            }
          });
        }

        setListings(groupedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch listings');
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setSearchLoading(false);
        }
      }
    },
    [statuses]
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 500); // Increased to 500ms for better UX

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Initial load
  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Fetch listings when statuses are loaded (initial load)
  useEffect(() => {
    if (statuses.length > 0) {
      fetchListings('', true); // Initial load
    }
  }, [statuses, fetchListings]);

  // Fetch listings when search input changes (separate from initial load)
  useEffect(() => {
    if (statuses.length > 0 && debouncedSearchInput !== '') {
      fetchListings(debouncedSearchInput, false); // Search load
    }
  }, [debouncedSearchInput, statuses, fetchListings]);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDragStart = (event) => {
    const { active } = event;
    const [statusId, cardIndex] = active.id.split('-');
    const card = listings[statusId] && listings[statusId][cardIndex];
    setActiveCard(card);
    // Clear any existing messages when starting a new drag
    setError(null);
    setSuccessMessage(null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const [activeStatusId, activeIndex] = active.id.split('-');

    // Handle different drop targets
    let overStatusId, overIndex;

    if (over.id.startsWith('column-')) {
      // Dropped on an empty column
      overStatusId = over.id.replace('column-', '');
      overIndex = 0; // Add to the beginning of the column
    } else {
      // Dropped on a card
      [overStatusId, overIndex] = over.id.split('-');
    }

    // Validate status transition
    if (!isValidStatusTransition(activeStatusId, overStatusId)) {
      setError('Invalid status transition. Please follow the correct workflow.');
      return;
    }

    const activeColumn = listings[activeStatusId] || [];
    const activeCard = activeColumn[parseInt(activeIndex)];
    const statusConfig = getStatusConfig(overStatusId);

    // Check if this status needs a popup
    if (statusConfig.needsPopup) {
      // Store the pending move data and show the popup
      setPendingMove({ event, activeStatusId, activeIndex, overStatusId, overIndex });
      setReservePopupData({
        isOpen: true,
        listing: activeCard,
        mode: statusConfig.popupMode,
      });
      return;
    }

    // For statuses that don't need popup, proceed with the move
    await processMove({ activeStatusId, activeIndex, overStatusId, overIndex });
  };

  const handleReserveConfirm = async (dealerId, offerAmount = null) => {
    if (pendingMove) {
      const { activeStatusId, activeIndex, overStatusId, overIndex } = pendingMove;

      // Get the active card
      const activeColumn = listings[activeStatusId] || [];
      const activeCard = activeColumn[parseInt(activeIndex)];

      try {
        setUpdating(true);

        // Execute the appropriate API call based on status configuration
        await executeApiCall(activeCard, overStatusId, dealerId, offerAmount);

        // Update local state
        const newActiveColumn = activeColumn.filter((_, index) => index !== parseInt(activeIndex));
        const overColumn = listings[overStatusId] || [];
        const newOverColumn = [...overColumn];

        // Update the card's status_id and dealer_id in the local copy
        const updatedCard = buildUpdatedCard(activeCard, overStatusId, dealerId, offerAmount);
        newOverColumn.splice(parseInt(overIndex) || newOverColumn.length, 0, updatedCard);

        setListings((prev) => ({
          ...prev,
          [activeStatusId]: newActiveColumn,
          [overStatusId]: newOverColumn,
        }));

        // For statuses that don't need special API calls, the API call was already handled above

        // Show success message
        const message = generateSuccessMessage(activeCard, overStatusId, offerAmount);
        setSuccessMessage(message);
      } catch (error) {
        console.error('Error updating listing:', error);
        setError(`Failed to update listing: ${error.message}`);

        // Revert the local state on error
        await fetchListings(debouncedSearchInput, false);
      } finally {
        setUpdating(false);
      }
    }
    setReservePopupData(null);
    setPendingMove(null);
  };

  const handleReserveCancel = () => {
    setReservePopupData(null);
    setPendingMove(null);
  };

  const handleRefresh = () => {
    fetchListings(debouncedSearchInput, true);
  };

  const processMove = async ({
    activeStatusId,
    activeIndex,
    overStatusId,
    overIndex,
    updatedCard = null,
  }) => {
    if (activeStatusId === overStatusId) {
      // Same column reordering - just update local state
      const columnListings = listings[activeStatusId] || [];
      if (!Array.isArray(columnListings)) {
        console.error('Column listings is not an array:', columnListings);
        setError('Failed to reorder items: Invalid data structure');
        return;
      }

      const newOrder = arrayMove(columnListings, parseInt(activeIndex), parseInt(overIndex));

      setListings((prev) => ({
        ...prev,
        [activeStatusId]: newOrder,
      }));
    } else {
      // Moving between columns - update API and local state
      const activeColumn = listings[activeStatusId] || [];
      const overColumn = listings[overStatusId] || [];

      if (!Array.isArray(activeColumn)) {
        console.error('Active column is not an array:', activeColumn);
        setError('Failed to move item: Invalid source data structure');
        return;
      }

      if (!Array.isArray(overColumn)) {
        console.error('Over column is not an array:', overColumn);
        setError('Failed to move item: Invalid target data structure');
        return;
      }

      const activeCard = updatedCard || activeColumn[parseInt(activeIndex)];

      if (!activeCard) {
        console.error('Active card not found at index:', activeIndex, 'in column:', activeColumn);
        setError('Failed to find the listing to move');
        return;
      }

      try {
        setUpdating(true);

        // Update local state immediately for smooth animation
        const newActiveColumn = activeColumn.filter((_, index) => index !== parseInt(activeIndex));
        const newOverColumn = [...overColumn];

        // Update the card's status_id in the local copy
        const updatedCardWithStatus = buildUpdatedCard(activeCard, overStatusId, null, null);
        newOverColumn.splice(parseInt(overIndex) || newOverColumn.length, 0, updatedCardWithStatus);

        setListings((prev) => ({
          ...prev,
          [activeStatusId]: newActiveColumn,
          [overStatusId]: newOverColumn,
        }));

        // Update the listing status via API
        await executeApiCall(activeCard, overStatusId, null, null);

        console.log(`Successfully moved listing ${activeCard.id} to status ${overStatusId}`);

        // Show success message
        const message = generateSuccessMessage(activeCard, overStatusId);
        setSuccessMessage(message);
      } catch (error) {
        console.error('Error updating listing status:', error);
        setError(`Failed to update listing status: ${error.message}`);
      } finally {
        setUpdating(false);
      }
    }
  };

  if (error && loading) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={handleRefresh}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      {/* Search Input and Alerts */}
      <div className="mb-6 flex items-center gap-4">
        <div className="max-w-md relative flex-grow">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        {searchInput !== debouncedSearchInput && !searchLoading && (
          <p className="text-sm text-gray-500">Searching...</p>
        )}

        {/* Update Status Indicator */}
        {updating && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded text-sm">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Updating...
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message (non-blocking) */}
        {error && !loading && !updating && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm flex items-center">
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              listings={listings[status.id] || []}
              loading={loading} // Only show loading spinners on initial load
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? <KanbanCard listing={activeCard} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <ReservePopup
        isOpen={reservePopupData?.isOpen}
        listing={reservePopupData?.listing}
        mode={reservePopupData?.mode}
        onClose={handleReserveCancel}
        onConfirm={handleReserveConfirm}
      />
    </div>
  );
};

export default KanbanBoard;
