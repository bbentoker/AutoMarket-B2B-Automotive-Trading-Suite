import React, { useState } from 'react';
import { generateScrapedDealersReport } from '../utils/api';
import DealerListingsPopup from './DealerListingsPopup';

const GenerateReportPopup = ({ isOpen, onClose, dealer }) => {
  const [referenceCodes, setReferenceCodes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listingsPopup, setListingsPopup] = useState({ isOpen: false, dealer: null });
  const [selectedListings, setSelectedListings] = useState([]);
  const [whenToSend, setWhenToSend] = useState({ day: '', hour: '' });
  const [isSending, setIsSending] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [currentDealerId, setCurrentDealerId] = useState(null);

  // Reset states when dealer changes
  React.useEffect(() => {
    if (dealer && dealer.dealerId !== currentDealerId) {
      setCurrentDealerId(dealer.dealerId);
      setResponseData(null);
      setShowResults(false);
      setReferenceCodes({});
      setSelectedListings([]);
      setWhenToSend({ day: '', hour: '' });
      setIsSending(false);
      setError('');
    }
  }, [dealer, currentDealerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Selected Listings:', selectedListings);
    // Check if listings are selected
    if (selectedListings.length === 0) {
      setError('Please select at least one listing');
      return;
    }

    // Check if all selected listings have reference codes
    const listingsWithoutRefCodes = selectedListings.filter(
      (listing) => !referenceCodes[listing.id] || referenceCodes[listing.id].trim() === ''
    );

    if (listingsWithoutRefCodes.length > 0) {
      setError(
        `Please enter reference codes for all selected listings: ${listingsWithoutRefCodes
          .map((listing) => `${listing.make} ${listing.model}`)
          .join(', ')}`
      );
      return;
    }

    // Log all the information
    console.log('=== Generate Report Information ===');
    console.log('Dealer:', dealer?.dealerName);
    console.log('When to Send:', whenToSend);
    console.log('Is Sending:', isSending);
    console.log(
      'Selected Listings:',
      selectedListings.map((listing) => ({
        id: listing.id,
        make: listing.make,
        model: listing.model,
        price: listing.price,
        referenceCode: referenceCodes[listing.id] || '',
      }))
    );
    console.log('Reference Codes:', referenceCodes);
    console.log('================================');

    // Log the exact request body that will be sent to the API
    const requestBody = {
      dealer_id: dealer.dealerId,
      suggestions: selectedListings.map((car) => ({
        listingsitea_listing_id: car.id,
        reference_code: referenceCodes[car.id] || '',
      })),
      when_to_send: whenToSend,
      is_sending: isSending,
    };
    console.log('=== API Request Body Example ===');
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('================================');

    setLoading(true);
    try {
      // Prepare suggestions data
      const suggestions = selectedListings.map((car) => ({
        listingId: car.id,
        referenceCode: referenceCodes[car.id] || '',
      }));

      const response = await generateScrapedDealersReport(
        dealer.dealerId,
        suggestions,
        whenToSend,
        isSending
      );

      console.log('Generate report response:', response);
      setResponseData(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceCodeChange = (listingId, value) => {
    setReferenceCodes((prev) => ({
      ...prev,
      [listingId]: value,
    }));
  };

  const handleListingsSelected = (selectedListingsData) => {
    setSelectedListings(selectedListingsData);
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setResponseData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {showResults ? 'Report Results' : `Generate Report for ${dealer?.dealerName}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {showResults && responseData ? (
          <div className="space-y-6">
            {/* Report Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Report Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                <div>
                  <span className="font-medium">Schedule:</span>{' '}
                  {responseData.reportOptions.when_to_send.day} at{' '}
                  {responseData.reportOptions.when_to_send.hour}:00
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  {responseData.reportOptions.is_sending ? 'Active' : 'Inactive'}
                </div>
                <div>
                  <span className="font-medium">User:</span> {responseData.user.name} (
                  {responseData.user.company_name})
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Suggestions ({responseData.emailData.suggestions.length})
              </h3>
              <div className="space-y-6">
                {responseData.emailData.suggestions.map((suggestion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Our Suggestion */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Our Suggestion</h4>
                        <div className="space-y-2 text-sm text-gray-800">
                          <div className="flex justify-between">
                            <span className="font-medium">Brand/Model:</span>
                            <span>
                              {suggestion.suggestioned_listing.brand_name}{' '}
                              {suggestion.suggestioned_listing.model}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Year:</span>
                            <span>
                              {new Date(
                                suggestion.suggestioned_listing.first_registration
                              ).getFullYear()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Transmission:</span>
                            <span>{suggestion.suggestioned_listing.transmission_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Fuel Type:</span>
                            <span>{suggestion.suggestioned_listing.fuel_type || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Horsepower:</span>
                            <span>{suggestion.suggestioned_listing.horsepower} hp</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Kilometers:</span>
                            <span>
                              {suggestion.suggestioned_listing.km_stand?.toLocaleString()} km
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Price:</span>
                            <span>
                              {suggestion.suggestioned_listing.currency === 'CHF' ? 'CHF' : '€'}{' '}
                              {Number(
                                suggestion.suggestioned_listing.listing_price
                              ).toLocaleString()}{' '}
                              ({suggestion.suggestioned_listing.vat_or_margin})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Reference Code:</span>
                            <span>{suggestion.suggestioned_listing.reference_no}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dealer Listing */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Dealer Listing</h4>
                        <div className="space-y-2 text-sm text-gray-800">
                          <div className="flex justify-between">
                            <span className="font-medium">Brand/Model:</span>
                            <span>
                              {suggestion.scraped_listing.make} {suggestion.scraped_listing.model}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Year:</span>
                            <span>
                              {new Date(
                                suggestion.scraped_listing.first_registration
                              ).getFullYear()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Transmission:</span>
                            <span>{suggestion.scraped_listing.gearbox}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Fuel Type:</span>
                            <span>{suggestion.scraped_listing.fuel_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Horsepower:</span>
                            <span>{suggestion.scraped_listing.power}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Price:</span>
                            <span>
                              {suggestion.scraped_listing.price_currency === 'CHF' ? 'CHF' : '€'}{' '}
                              {suggestion.suggestioned_listing.vat_or_margin === 'Excl. VAT'
                                ? suggestion.scraped_listing.adjusted_price.toLocaleString()
                                : Number(suggestion.scraped_listing.price).toLocaleString()}{' '}
                              (
                              {suggestion.suggestioned_listing.vat_or_margin === 'Excl. VAT'
                                ? 'Excl. VAT'
                                : suggestion.scraped_listing.vat_status}
                              )
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Mileage:</span>
                            <span>{suggestion.scraped_listing.mileage}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Comparison */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Price Comparison</h5>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-800">
                        <div>
                          <span className="font-medium">Price Difference:</span>
                          <span
                            className={`ml-2 ${suggestion.price_comparison.price_difference > 0 ? 'text-red-800' : 'text-green-800'}`}
                          >
                            {suggestion.scraped_listing.price_currency === 'CHF' ? 'CHF' : '€'}{' '}
                            {suggestion.price_comparison.price_difference.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Difference %:</span>
                          <span
                            className={`ml-2 ${suggestion.price_comparison.price_difference_percentage > 0 ? 'text-red-800' : 'text-green-800'}`}
                          >
                            {suggestion.price_comparison.price_difference_percentage.toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Our Adjusted Price:</span>
                          <span className="ml-2">
                            {suggestion.scraped_listing.price_currency === 'CHF' ? 'CHF' : '€'}{' '}
                            {suggestion.price_comparison.our_price_adjusted.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleBackToForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Back to Form
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When to Send (Day)
                </label>
                <select
                  value={whenToSend.day}
                  onChange={(e) => setWhenToSend((prev) => ({ ...prev, day: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select day</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When to Send (Hour) GMT
                </label>
                <select
                  value={whenToSend.hour}
                  onChange={(e) => setWhenToSend((prev) => ({ ...prev, hour: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select hour</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center px-3">
                <input
                  type="checkbox"
                  checked={isSending}
                  onChange={(e) => setIsSending(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Is Report Active</span>
              </label>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Dealer Listings</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setListingsPopup({ isOpen: true, dealer })}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Select Listings
                  </button>
                  {selectedListings.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedListings([])}
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              {selectedListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Dealer Listings</h3>
                  <p className="text-gray-500">
                    Click "Select Listings" above to choose which dealer listings to include in your
                    report.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Selected Listings */}
            {selectedListings.length > 0 && (
              <div className="mb-6">
                <div className="space-y-4">
                  {selectedListings.map((car) => (
                    <div key={car.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={car.image_url}
                          alt={`${car.make} ${car.model}`}
                          className="w-24 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/96x64?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {car.make} {car.model}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              {car.price_currency === 'CHF' ? 'CHF' : '€'}{' '}
                              {Number(car.price).toLocaleString()} • {car.mileage} • {car.fuel_type}{' '}
                              • {car.gearbox}
                            </p>
                            <p>Registration: {new Date(car.first_registration).getFullYear()}</p>
                            {car.sell_time && (
                              <p>
                                Sold in: {car.sell_time} day{car.sell_time !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="w-48">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reference Code
                          </label>
                          <input
                            type="text"
                            value={referenceCodes[car.id] || ''}
                            onChange={(e) => handleReferenceCodeChange(car.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter reference code"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {loading ? 'Saving...' : 'Save Report'}
              </button>
            </div>
          </form>
        )}
      </div>

      <DealerListingsPopup
        isOpen={listingsPopup.isOpen}
        onClose={() => setListingsPopup({ isOpen: false, dealer: null })}
        dealer={listingsPopup.dealer}
        onListingsSelected={handleListingsSelected}
      />
    </div>
  );
};

export default GenerateReportPopup;
