import React, { useState, useEffect } from 'react';
import CarCard from './CarCard';
import { getSimilarListings } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/hideScrollbar.css';
import { useTranslation } from '../i18n';

const SimilarListings = ({ currentCar }) => {
  const { t } = useTranslation();
  const [similarListings, setSimilarListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarListings = async () => {
      if (!currentCar?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await getSimilarListings(currentCar.id);
        // Ensure we're working with an array of listings
        const listings = response.listings || [];
        setSimilarListings(listings);
      } catch (err) {
        setError(t('similarListings.failedToLoad'));
        setSimilarListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarListings();
  }, [currentCar?.id]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl mt-4">
        <div className="text-2xl font-bold mb-6">{t('similarListings.relatedListings')}</div>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl mt-4">
        <div className="text-2xl font-bold mb-6">{t('similarListings.relatedListings')}</div>
        <div className="text-center text-gray-500">{error}</div>
      </div>
    );
  }

  if (!Array.isArray(similarListings) || similarListings.length === 0) {
    return (
      <div className="p-6 rounded-xl mt-4">
        <div className="text-2xl font-bold mb-6">{t('similarListings.relatedListings')}</div>
        <div className="text-center text-gray-500">{t('similarListings.noSimilarListingsFound')}</div>
      </div>
    );
  }

  return (
    <div className="p-2 rounded-xl mt-4 w-full max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="text-2xl font-bold">{t('similarListings.relatedListings')}</div>
        <Link to="/" className="text-sm text-black flex items-center gap-1 hover:text-gray-700">
          {t('similarListings.viewAll')}
          <img src="/right-up-black.svg" alt={t('similarListings.viewAll')} className="w-3 h-3 fontb-bold" />
        </Link>
      </div>
      <div className="relative overflow-x-hidden">
        <div className="flex gap-5 pb-4 overflow-x-auto md:overflow-x-visible">
          {similarListings.slice(0, 5).map((listing) => (
            <div key={listing.id} className="w-[298px] md:w-[298px] flex-shrink-0">
              <CarCard 
                car={{
                  id: listing.id,
                  image: listing.first_photo,
                  name: `${listing.brand_name} ${listing.model}`,
                  year: new Date(listing.first_registration).getFullYear(),
                  description: listing.features?.length > 50 ? `${listing.features.substring(0, 50)}...` : listing.features,
                  status: listing.status_id === 1 ? t('similarListings.available') : t('similarListings.sold'),
                  mileage: `${listing.km_stand ? listing.km_stand.toLocaleString() : '0'} km`,
                  transmission: listing.transmission_type,
                  fuelType: listing.fuel_type,
                  price: parseFloat(listing.listing_price),
                  registrationDate: new Date(listing.first_registration).toLocaleDateString(),
                }} 
                originalListing={listing}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarListings; 