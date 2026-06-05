import React, { useEffect, useState, useCallback } from 'react';
import { getOffers, getDeclinedOffers } from '../utils/api';
import ListingCard from '../components/ListingCard';

const Offers = () => {
  const [listings, setListings] = useState([]);
  const [declinedOffers, setDeclinedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchOffersData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOffers({ page: 1, limit: 20 });
      console.log('Fetched offers:', response);
      setListings(response.listings || []);
      setPagination(response.pagination);

      // Fetch and log declined offers
      const declinedOffersResponse = await getDeclinedOffers();
      console.log('Declined offers:', declinedOffersResponse);
      setDeclinedOffers(declinedOffersResponse.offers || []);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffersData();
  }, [fetchOffersData]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="p-4 max-w-8xl mx-auto bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offers Management</h1>
        {pagination && (
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}({pagination.totalListings}{' '}
            total listings)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Offers Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-400 border-b border-green-400 pb-2">
            Active Offers ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <div className="text-center p-4 text-gray-400 bg-gray-700 rounded-lg">
              No active offers
            </div>
          ) : (
            listings.map((listing) => (
              <ListingCard
                key={listing.listing_details.id}
                listing={listing}
                onOfferUpdate={fetchOffersData}
              />
            ))
          )}
        </div>

        {/* Declined Offers Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-400 border-b border-red-400 pb-2">
            Declined Offers ({declinedOffers.length})
          </h2>
          {declinedOffers.length === 0 ? (
            <div className="text-center p-4 text-gray-400 bg-gray-700 rounded-lg">
              No declined offers
            </div>
          ) : (
            declinedOffers.map((offer) => (
              <div key={offer.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">
                    {offer.listing.brand_name} {offer.listing.model}
                  </h3>
                  <span className="text-sm text-gray-400">Ref: {offer.listing.reference_no}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-300">
                      <span className="font-medium">Dealer:</span> {offer.dealer.name}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Company:</span> {offer.dealer.company_name}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Email:</span> {offer.dealer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300">
                      <span className="font-medium">Original Offer:</span> €
                      {parseFloat(offer.offer).toLocaleString()}
                    </p>
                    {offer.counter_offer && (
                      <p className="text-gray-300">
                        <span className="font-medium">Counter Offer:</span> €
                        {parseFloat(offer.counter_offer).toLocaleString()}
                      </p>
                    )}
                    <p className="text-gray-300">
                      <span className="font-medium">Listing Price:</span> €
                      {parseFloat(offer.listing.listing_price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between items-center text-xs text-gray-400">
                  <span>Declined on: {new Date(offer.updated_at).toLocaleDateString()}</span>
                  <span className="bg-red-600 text-white px-2 py-1 rounded">DECLINED</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Offers;
