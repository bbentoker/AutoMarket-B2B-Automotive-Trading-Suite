import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfferCard from './OfferCard';

const ListingCard = ({ listing, onOfferUpdate }) => {
  const navigate = useNavigate();

  const handleGoToListing = () => {
    navigate(`/listing/${listing.listing_details.id}`);
  };

  return (
    <div className="bg-stone-200 rounded-lg shadow-md p-4 mb-4 text-black ">
      <div className="border-b pb-3 mb-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {listing.listing_details.brand_name} {listing.listing_details.model}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-gray-700">
              €{Number(listing.listing_details.listing_price).toLocaleString()}
            </span>
            <button
              onClick={handleGoToListing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              Go to listing
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          <span>ID: {listing.listing_details.id}</span>
          <span className="mx-2">•</span>
          <span>{new Date(listing.listing_details.created_at).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>{listing.listing_details.total_offers} offers</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Highest Offer: €{Number(listing.listing_details.highest_offer).toLocaleString()}
        </div>
        {listing.offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onOfferUpdate={onOfferUpdate} />
        ))}
      </div>
    </div>
  );
};

export default ListingCard;
