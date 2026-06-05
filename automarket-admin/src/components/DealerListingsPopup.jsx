import React, { useState, useEffect } from 'react';
import { getDealerSoldCars } from '../utils/api';

const DealerListingsPopup = ({ isOpen, onClose, dealer, onListingsSelected }) => {
  const [listings, setListings] = useState([]);
  const [selectedListings, setSelectedListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && dealer) {
      fetchDealerListings();
      setSelectedListings([]); // Reset selections when popup opens
    }
  }, [isOpen, dealer]);

  const fetchDealerListings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDealerSoldCars(dealer.dealerId);
      setListings(data.data || []);
    } catch (error) {
      console.error('Error fetching dealer listings:', error);
      setError('Failed to fetch dealer listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleListingToggle = (listingId) => {
    setSelectedListings((prev) => {
      if (prev.includes(listingId)) {
        return prev.filter((id) => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map((listing) => listing.id));
    }
  };

  const handleSubmit = () => {
    const selectedListingData = listings.filter((listing) => selectedListings.includes(listing.id));
    onListingsSelected(selectedListingData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Select Dealer Listings for {dealer?.dealerName}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading dealer listings...</div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedListings.length} of {listings.length} listings selected
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {selectedListings.length === listings.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedListings.includes(listing.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleListingToggle(listing.id)}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedListings.includes(listing.id)}
                      onChange={() => handleListingToggle(listing.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <img
                      src={listing.image_url}
                      alt={`${listing.make} ${listing.model}`}
                      className="w-24 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/96x64?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {listing.make} {listing.model}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          {listing.price_currency === 'CHF' ? 'CHF' : '€'}{' '}
                          {Number(listing.price).toLocaleString()} • {listing.mileage} •{' '}
                          {listing.fuel_type} • {listing.gearbox}
                        </p>
                        <p>Registration: {new Date(listing.first_registration).getFullYear()}</p>
                        {listing.sell_time && (
                          <p>
                            Sold in: {listing.sell_time} day{listing.sell_time !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedListings.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  selectedListings.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Add Selected Listings ({selectedListings.length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DealerListingsPopup;
