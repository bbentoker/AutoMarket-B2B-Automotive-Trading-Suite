import React, { useState } from 'react';
import { acceptOffer, counterOffer, rejectOffer } from '../utils/api';

const CounterOfferModal = ({ isOpen, onClose, onSubmit, currentOffer }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) {
      setError('Please enter an amount');
      return;
    }
    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    onSubmit(amount);
    setAmount('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Make Counter Offer</h3>
        <div className="mb-4 text-sm text-gray-600">
          Current offer: €{Number(currentOffer).toLocaleString()}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Counter Offer Amount (€)
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Submit Counter Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OfferCard = ({ offer, onOfferUpdate }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCountering, setIsCountering] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);

  const handleAcceptOffer = async () => {
    try {
      setIsAccepting(true);
      setError(null);
      await acceptOffer(offer.id);
      if (onOfferUpdate) {
        onOfferUpdate();
      }
    } catch (err) {
      setError('Failed to accept offer. Please try again.');
      console.error('Error accepting offer:', err);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCounterOffer = async (amount) => {
    try {
      setIsCountering(true);
      setError(null);
      await counterOffer(amount, offer.id);
      setShowCounterModal(false);
      if (onOfferUpdate) {
        onOfferUpdate();
      }
    } catch (err) {
      setError('Failed to make counter offer. Please try again.');
      console.error('Error making counter offer:', err);
    } finally {
      setIsCountering(false);
    }
  };

  const handleRejectOffer = async () => {
    try {
      setIsRejecting(true);
      setError(null);
      await rejectOffer(offer.id);
      if (onOfferUpdate) {
        onOfferUpdate();
      }
    } catch (err) {
      setError('Failed to reject offer. Please try again.');
      console.error('Error rejecting offer:', err);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 p-3 rounded-md mb-2 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">Amount: </span>
            <span className="text-green-600">€{Number(offer.offer_amount).toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            {new Date(offer.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          <span>Dealer: {offer.dealer.company_name}</span>
          {offer.is_approved && <span className="ml-2 text-green-500">(Approved)</span>}
          {offer.counter_offer && (
            <span className="ml-2 text-blue-500">
              (Counter: €{Number(offer.counter_offer).toLocaleString()})
            </span>
          )}
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAcceptOffer}
            disabled={isAccepting || offer.is_approved}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              offer.is_approved
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isAccepting
                  ? 'bg-green-200 text-green-700 cursor-wait'
                  : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
            }`}
          >
            {offer.is_approved ? 'Accepted' : isAccepting ? 'Accepting...' : 'Accept Offer'}
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              isCountering || offer.is_approved || offer.counter_offer
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }`}
            onClick={() => setShowCounterModal(true)}
            disabled={isCountering || offer.is_approved || offer.counter_offer}
          >
            {isCountering
              ? 'Processing...'
              : offer.counter_offer
                ? 'Counter Offered'
                : 'Counter Offer'}
          </button>
          <button
            onClick={handleRejectOffer}
            disabled={isRejecting || offer.is_approved}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              offer.is_approved
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isRejecting
                  ? 'bg-red-200 text-red-700 cursor-wait'
                  : 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
            }`}
          >
            {offer.is_approved ? 'Accepted' : isRejecting ? 'Rejecting...' : 'Reject Offer'}
          </button>
        </div>
      </div>

      <CounterOfferModal
        isOpen={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        onSubmit={handleCounterOffer}
        currentOffer={offer.offer_amount}
        offerId={offer.id}
      />
    </>
  );
};

export default OfferCard;
