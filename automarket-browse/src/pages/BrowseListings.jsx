import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import HeaderMobile from '../components/HeaderMobile';
import BrowseListingsMain from '../components/BrowseListingsMain';
import BrowseListingsMainMobile from '../components/BrowseListingsMainMobile';
import { Footer } from '../components/Footer';
import { FooterMobile } from '../components/FooterMobile';
import { fetchListings } from '../services/api';
import { trackNewsletterActivity } from '../utils/newsletterTracker';
import { useTranslation } from '../i18n';

const BrowseListings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('newest');
  const hasLoadedInitialFilters = useRef(false);
  const newsletterProcessedRef = useRef(false);

  // Utility function to sort listings
  const sortListings = useCallback((listingsToSort, sortOption) => {
    return [...listingsToSort].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      const priceA = parseFloat(a.listing_price);
      const priceB = parseFloat(b.listing_price);

      switch (sortOption) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        default:
          return 0;
      }
    });
  }, []);

  const handleFiltersChange = useCallback(async (filters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchListings({limit: 1000, ...filters});
      console.log('data', data);
      
      // Apply sorting to the fetched listings
      const sortedListings = sortListings(data.listings, selectedSort);
      
      setListings(sortedListings);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      setListings([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSort, sortListings]);

  // Check URL parameters for filters on component mount or URL change
  useEffect(() => {
    const initializePageParameters = async () => {
      if (hasLoadedInitialFilters.current) return;
      
      console.log('location.search', location.search);
      
      // Track newsletter activity if newsletter_id is present (without listing_id)
      await trackNewsletterActivity(searchParams, setSearchParams, null, newsletterProcessedRef);
      
      // Extract filter parameters from current search params (after newsletter tracking cleanup)
      const currentSearchParams = new URLSearchParams(location.search);
      const filters = {};
     
      // Extract filter parameters from URL
      const filterKeys = ['brand', 'model', 'year', 'mileage'];
      filterKeys.forEach(key => {
        const value = currentSearchParams.get(key);
        if (value) {
          filters[key] = value;
        }
      });
      
      // Also extract any additional filter parameters (excluding newsletter_id)
      for (const [key, value] of currentSearchParams.entries()) {
        if (!filterKeys.includes(key) && key !== 'newsletter_id') {
          filters[key] = value;
        }
      }
      
      // Apply filters if any were found in URL
      if (Object.keys(filters).length > 0) {
        console.log('Found URL filters:', filters);
        handleFiltersChange(filters);
      }
      
      hasLoadedInitialFilters.current = true;
    };
    
    initializePageParameters();
  }, [location.search, handleFiltersChange, searchParams, setSearchParams]); // React to URL search changes

  const handleSortChange = (value) => {
    setSelectedSort(value);
    setIsDropdownOpen(false);
    
    // Re-sort existing listings when sort option changes
    if (listings.length > 0) {
      const sortedListings = sortListings(listings, value);
      setListings(sortedListings);
    }
  };

  // Transform listing data for CarCard component
  const transformListingToCardData = (listing) => ({
    id: listing.id,
    image: listing.first_photo,
    name: `${listing.brand_name} ${listing.model}`,
    year: new Date(listing.first_registration).getFullYear(),
    description: listing.features ? (listing.features.length > 50 ? `${listing.features.substring(0, 50)}...` : listing.features) : '',
    status: listing.status_id === 1 ? t('similarListings.available') : t('similarListings.sold'),
    mileage: listing.km_stand ? `${listing.km_stand.toLocaleString()} km` : 'N/A',
    transmission: listing.transmission_type,
    fuelType: listing.fuel_type,
    price: parseFloat(listing.listing_price),
    registrationDate: new Date(listing.first_registration).toLocaleDateString(),
    remainingTime: listing.remaining_time
  });

  const mainProps = {
    onFiltersChange: handleFiltersChange,
    pagination,
    error,
    isLoading,
    listings,
    transformListingToCardData,
    isDropdownOpen,
    setIsDropdownOpen,
    selectedSort,
    handleSortChange
  };

  return (
    <div className="min-h-screen w-screen bg-c-grey text-black overflow-hidden">
      {/* Desktop Version */}
      <div className="hidden md:block">
        <Header />
        <BrowseListingsMain {...mainProps} />
        <Footer />
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        <HeaderMobile />
        <BrowseListingsMainMobile {...mainProps} />
        <FooterMobile />
      </div>
    </div>
  );
};

export default BrowseListings; 