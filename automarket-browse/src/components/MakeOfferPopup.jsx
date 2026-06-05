import React, { useState } from 'react';
import { useTranslation } from '../i18n';

const MakeOfferPopup = ({ onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [offer, setOffer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!offer) {
      setError(t('makeOffer.pleaseEnterOffer'));
      return;
    }
    onSubmit(Number(offer));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setOffer(value);
      setError('');
    }
  };

  const handleOverlayClick = (e) => {
    // Close popup when clicking on the overlay (background)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    // Prevent closing when clicking inside the popup content
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center md:items-center z-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-sm p-6"
        onClick={handleContentClick}
      >

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-md text-gray-700 mb-4 font-semibold">
              {t('makeOffer.yourOffer')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="text"
                value={offer}
                onChange={handleChange}
                placeholder={t('makeOffer.enterYourOffer')}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-c-red focus:border-transparent"
              />
            </div>
            {error && <p className="text-c-red text-sm mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
           
            <button
              type="submit"
              className="flex-1 bg-c-red-dark text-white py-2.5 rounded-full font-medium hover:bg-c-red-dark transition-colors"
            >
              {t('makeOffer.makeOffer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakeOfferPopup; 