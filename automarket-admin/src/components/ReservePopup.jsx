import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getDealers } from '../utils/api';

const ReservePopup = ({ isOpen, onClose, onConfirm, listing, mode = 'reserve' }) => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [selectedPickupDate, setSelectedPickupDate] = useState(null);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(null);
  const [selectedBillingCompany, setSelectedBillingCompany] = useState('');

  // Seller information fields for paymentSent mode
  const [sellerInfo, setSellerInfo] = useState({
    sellerEmail: '',
    sellerCompany: '',
    telephone: '',
    sellerAddress: '',
    amountPurchased: '',
  });
  const [transportCost, setTransportCost] = useState('');

  useEffect(() => {
    const fetchDealers = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const response = await getDealers();
          console.log('Dealers data:', response);
          setDealers(response.users || []);
          // If there's only one dealer, select it automatically
          if (response.users?.length === 1) {
            setSelectedDealerId(response.users[0].id.toString());
          }
        } catch (err) {
          console.error('Error fetching dealers:', err);
          setError('Failed to fetch dealers');
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchDealers();
      // Reset form when opening
      setOfferAmount('');
      setSelectedDealerId('');
      setSelectedPickupDate(null);
      setSelectedDeliveryDate(null);
      setSelectedBillingCompany('');
      setTransportCost('');
      setSellerInfo({
        sellerEmail: '',
        sellerCompany: '',
        telephone: '',
        sellerAddress: '',
        amountPurchased: '',
      });
    }
  }, [isOpen]);

  // Helper function to validate dates for bookTransport mode
  const validateDates = (pickupDate, deliveryDate) => {
    if (!pickupDate) return { isValid: false, error: 'Please select an expected pickup date' };
    if (!deliveryDate) return { isValid: false, error: 'Please select an expected delivery date' };

    const pickupDateTime = new Date(pickupDate);
    const deliveryDateTime = new Date(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison

    // Check if the dates are valid
    if (isNaN(pickupDateTime.getTime()) || isNaN(deliveryDateTime.getTime())) {
      return { isValid: false, error: 'Please enter valid dates' };
    }

    // Check if the dates are not in the past
    if (pickupDateTime < today) {
      return { isValid: false, error: 'Pickup date cannot be in the past' };
    }
    if (deliveryDateTime < today) {
      return { isValid: false, error: 'Delivery date cannot be in the past' };
    }

    // Check if delivery date is after pickup date
    if (deliveryDateTime < pickupDateTime) {
      return { isValid: false, error: 'Delivery date must be after pickup date' };
    }

    // Check if the dates are not too far in the future (e.g., within 5 years)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);
    if (pickupDateTime > maxDate || deliveryDateTime > maxDate) {
      return { isValid: false, error: 'Dates cannot be more than 5 years in the future' };
    }

    return { isValid: true, error: null };
  };

  const handleSellerInfoChange = (field, value) => {
    setSellerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateSellerInfo = () => {
    const { sellerEmail, sellerCompany, telephone, sellerAddress, amountPurchased } = sellerInfo;

    if (!sellerEmail || !sellerCompany || !telephone || !sellerAddress || !amountPurchased) {
      return { isValid: false, error: 'Please fill in all seller information fields' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellerEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Amount validation
    if (isNaN(parseFloat(amountPurchased)) || parseFloat(amountPurchased) <= 0) {
      return { isValid: false, error: 'Please enter a valid amount purchased' };
    }

    return { isValid: true, error: null };
  };

  const handleConfirm = () => {
    if (
      mode !== 'purchase' &&
      mode !== 'bookTransport' &&
      mode !== 'sendDocuments' &&
      mode !== 'paymentSent' &&
      mode !== 'billingCompany' &&
      !selectedDealerId
    ) {
      alert('Please select a dealer first');
      return;
    }

    // For billingCompany mode, validate billing company selection
    if (mode === 'billingCompany') {
      if (!selectedBillingCompany) {
        alert('Please select a billing company');
        return;
      }

      // Pass billing company to the confirm handler
      onConfirm(null, null, null, selectedBillingCompany);
      return;
    }

    // For paymentSent mode, validate seller information
    if (mode === 'paymentSent') {
      const validation = validateSellerInfo();
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      // Pass seller info to the confirm handler
      onConfirm(selectedDealerId, offerAmount, sellerInfo);
      return;
    }

    // For bookTransport mode, validate the dates
    let dateValues = { pickup: null, delivery: null };
    if (mode === 'bookTransport') {
      if (!selectedPickupDate || !selectedDeliveryDate) {
        alert('Please select both pickup and delivery dates');
        return;
      }

      const dateValidation = validateDates(selectedPickupDate, selectedDeliveryDate);
      if (!dateValidation.isValid) {
        alert(dateValidation.error);
        return;
      }

      // Format the dates for the API (YYYY-MM-DD)
      dateValues = {
        pickup: selectedPickupDate.toISOString().split('T')[0],
        delivery: selectedDeliveryDate.toISOString().split('T')[0],
      };
    }

    if ((mode === 'offer' || mode === 'purchase' || mode === 'sendDocuments') && !offerAmount) {
      if (mode === 'offer') {
        alert('Please enter an offer amount');
      } else if (mode === 'purchase') {
        alert('Please enter the amount sold for');
      } else if (mode === 'sendDocuments') {
        alert('Please enter a tracking code');
      }
      return;
    }

    // For purchase mode, also validate transport cost
    if (mode === 'purchase' && !transportCost) {
      alert('Please enter the transport cost');
      return;
    }

    if ((mode === 'offer' || mode === 'purchase') && isNaN(parseFloat(offerAmount))) {
      alert('Please enter a valid number for the amount');
      return;
    }

    // Validate transport cost for purchase mode
    if (mode === 'purchase' && isNaN(parseFloat(transportCost))) {
      alert('Please enter a valid number for the transport cost');
      return;
    }

    // Pass the formatted dates for bookTransport mode
    const finalValue = mode === 'bookTransport' ? dateValues : offerAmount;
    // For purchase mode, pass transport cost as additional parameter
    const finalTransportCost = mode === 'purchase' ? transportCost : null;
    onConfirm(selectedDealerId, finalValue, null, null, finalTransportCost);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'offer'
            ? 'Make an Offer'
            : mode === 'purchase'
              ? 'Mark as Purchased'
              : mode === 'bookTransport'
                ? 'Book Transport'
                : mode === 'sendDocuments'
                  ? 'Send Documents'
                  : mode === 'paymentSent'
                    ? 'Payment Sent - Seller Information'
                    : mode === 'billingCompany'
                      ? 'Select Billing Company'
                      : 'Reserve Vehicle'}
        </h2>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dealers...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="mb-4">
              {mode === 'offer'
                ? `Make an offer for ${listing?.title || `Listing #${listing?.id}`}`
                : mode === 'purchase'
                  ? `Enter the amount sold for ${listing?.title || `Listing #${listing?.id}`}`
                  : mode === 'bookTransport'
                    ? `Select expected pickup date for ${listing?.title || `Listing #${listing?.id}`}`
                    : mode === 'sendDocuments'
                      ? `Enter tracking code for documents sent for ${listing?.title || `Listing #${listing?.id}`}`
                      : mode === 'paymentSent'
                        ? `Enter seller information for payment sent for ${listing?.title || `Listing #${listing?.id}`}`
                        : mode === 'billingCompany'
                          ? `Select billing company for proforma invoice for ${listing?.title || `Listing #${listing?.id}`}`
                          : `Are you sure you want to mark ${listing?.title || `Listing #${listing?.id}`} as reserved?`}
            </p>

            {/* Seller Information Fields for paymentSent mode */}
            {mode === 'paymentSent' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller Email *
                  </label>
                  <input
                    type="email"
                    value={sellerInfo.sellerEmail}
                    onChange={(e) => handleSellerInfoChange('sellerEmail', e.target.value)}
                    placeholder="Enter seller email"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller Company *
                  </label>
                  <input
                    type="text"
                    value={sellerInfo.sellerCompany}
                    onChange={(e) => handleSellerInfoChange('sellerCompany', e.target.value)}
                    placeholder="Enter seller company name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telephone *
                  </label>
                  <input
                    type="tel"
                    value={sellerInfo.telephone}
                    onChange={(e) => handleSellerInfoChange('telephone', e.target.value)}
                    placeholder="Enter telephone number"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller Address *
                  </label>
                  <textarea
                    value={sellerInfo.sellerAddress}
                    onChange={(e) => handleSellerInfoChange('sellerAddress', e.target.value)}
                    placeholder="Enter seller address"
                    rows="3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Purchased *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">€</span>
                    <input
                      type="number"
                      value={sellerInfo.amountPurchased}
                      onChange={(e) => handleSellerInfoChange('amountPurchased', e.target.value)}
                      placeholder="Enter amount purchased"
                      className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Billing Company Selection for billingCompany mode */}
            {mode === 'billingCompany' && (
              <div className="mb-6">
                <label
                  htmlFor="billing-company-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Billing Company *
                </label>
                <select
                  id="billing-company-select"
                  value={selectedBillingCompany}
                  onChange={(e) => setSelectedBillingCompany(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a billing company</option>
                  <option value="swedish">Swedish</option>
                  <option value="belgian">Belgium</option>
                </select>
                {!selectedBillingCompany && (
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a billing company to proceed
                  </p>
                )}
              </div>
            )}

            {dealers.length > 0 &&
              mode !== 'purchase' &&
              mode !== 'bookTransport' &&
              mode !== 'sendDocuments' &&
              mode !== 'paymentSent' &&
              mode !== 'billingCompany' && (
                <div className="mb-6">
                  <label
                    htmlFor="dealer-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Dealer *
                  </label>
                  <select
                    id="dealer-select"
                    value={selectedDealerId}
                    onChange={(e) => setSelectedDealerId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a dealer</option>
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.id}>
                        {dealer.name} ({dealer.company_name})
                      </option>
                    ))}
                  </select>
                  {!selectedDealerId && (
                    <p className="mt-1 text-sm text-gray-500">Please select a dealer to proceed</p>
                  )}
                </div>
              )}

            {(mode === 'offer' || mode === 'purchase') && (
              <div className="mb-6">
                <label
                  htmlFor="offer-amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {mode === 'offer' ? 'Offer Amount *' : 'Amount Sold For *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">€</span>
                  <input
                    id="offer-amount"
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                {!offerAmount && (
                  <p className="mt-1 text-sm text-gray-500">
                    {mode === 'offer'
                      ? 'Please enter an offer amount'
                      : 'Please enter the amount sold for'}
                  </p>
                )}
              </div>
            )}

            {mode === 'purchase' && (
              <div className="mb-6">
                <label
                  htmlFor="transport-cost"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Transport Cost *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">€</span>
                  <input
                    id="transport-cost"
                    type="number"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    placeholder="Enter transport cost"
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                {!transportCost && (
                  <p className="mt-1 text-sm text-gray-500">Please enter the transport cost</p>
                )}
              </div>
            )}

            {mode === 'bookTransport' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="pickup-date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Expected Pickup Date *
                  </label>
                  <DatePicker
                    selected={selectedPickupDate}
                    onChange={(date) => setSelectedPickupDate(date)}
                    minDate={new Date()} // Minimum date is today
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))} // Maximum 5 years from now
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select pickup date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    showPopperArrow={false}
                    autoComplete="off"
                  />
                  {!selectedPickupDate && (
                    <p className="mt-1 text-sm text-gray-500">
                      Please select an expected pickup date
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="delivery-date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Expected Delivery Date *
                  </label>
                  <DatePicker
                    selected={selectedDeliveryDate}
                    onChange={(date) => setSelectedDeliveryDate(date)}
                    minDate={selectedPickupDate || new Date()} // Minimum date is pickup date or today
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))} // Maximum 5 years from now
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select delivery date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    showPopperArrow={false}
                    autoComplete="off"
                  />
                  {!selectedDeliveryDate && (
                    <p className="mt-1 text-sm text-gray-500">
                      Please select an expected delivery date
                    </p>
                  )}
                </div>

                {(selectedPickupDate || selectedDeliveryDate) &&
                  !validateDates(selectedPickupDate, selectedDeliveryDate).isValid && (
                    <p className="mt-1 text-sm text-red-500">
                      {validateDates(selectedPickupDate, selectedDeliveryDate).error}
                    </p>
                  )}
              </div>
            )}

            {mode === 'sendDocuments' && (
              <div className="mb-6">
                <label
                  htmlFor="tracking-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tracking Code *
                </label>
                <input
                  id="tracking-code"
                  type="text"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter tracking code"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {!offerAmount && (
                  <p className="mt-1 text-sm text-gray-500">Please enter a tracking code</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  (mode !== 'purchase' &&
                    mode !== 'bookTransport' &&
                    mode !== 'sendDocuments' &&
                    mode !== 'paymentSent' &&
                    mode !== 'billingCompany' &&
                    !selectedDealerId) ||
                  ((mode === 'offer' || mode === 'purchase' || mode === 'sendDocuments') &&
                    !offerAmount) ||
                  (mode === 'purchase' && !transportCost) ||
                  (mode === 'bookTransport' && (!selectedPickupDate || !selectedDeliveryDate)) ||
                  (mode === 'paymentSent' && !validateSellerInfo().isValid) ||
                  (mode === 'billingCompany' && !selectedBillingCompany)
                }
                className={`px-4 py-2 text-white rounded-md ${
                  (mode === 'purchase' ||
                    mode === 'bookTransport' ||
                    mode === 'sendDocuments' ||
                    mode === 'paymentSent' ||
                    mode === 'billingCompany' ||
                    selectedDealerId) &&
                  (mode === 'reserve' ||
                    offerAmount ||
                    (mode === 'bookTransport' && selectedPickupDate && selectedDeliveryDate) ||
                    (mode === 'paymentSent' && validateSellerInfo().isValid) ||
                    (mode === 'billingCompany' && selectedBillingCompany)) &&
                  (mode !== 'purchase' || transportCost)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-400 cursor-not-allowed'
                }`}
              >
                {mode === 'offer'
                  ? 'Submit Offer'
                  : mode === 'purchase'
                    ? 'Confirm Purchase'
                    : mode === 'bookTransport'
                      ? 'Book Transport'
                      : mode === 'sendDocuments'
                        ? 'Send Documents'
                        : mode === 'paymentSent'
                          ? 'Confirm Payment Sent'
                          : mode === 'billingCompany'
                            ? 'Send Proforma Invoice'
                            : 'Confirm Reserve'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReservePopup;
