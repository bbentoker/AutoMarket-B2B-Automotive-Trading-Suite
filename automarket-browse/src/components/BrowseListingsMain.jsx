import React from 'react';
import SearchFilters from './SearchFilters';
import CarCard from './CarCard';
import { useTranslation } from '../i18n';

const BrowseListingsMain = ({
  onFiltersChange,
  pagination,
  error,
  isLoading,
  listings,
  transformListingToCardData,
  isDropdownOpen,
  setIsDropdownOpen,
  selectedSort,
  handleSortChange
}) => {
  const { t } = useTranslation();
  return (
    <main className="w-screen  pt-8 overflow-hidden ">
      <SearchFilters onFiltersChange={onFiltersChange} />
      
      <div className="mt-8 bg-c-white p-5 px-10 shadow-md">
        <div className="flex justify-between items-center mb-4 items-center ">
          <div className="flex gap-2 items-center">
            <div className="font-bold text-xl text-black">{t('browseListings.usedCarsForSale')}</div>
            <div className="text-xl font-medium text-gray-400">
              {pagination && `(${pagination.totalListings} ${t('browseListings.cars')}) `}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 border-1 h-10 border-gray-300 rounded-xl p-2 px-6 bg-white hover:bg-gray-50"
            >
              <span className="text-gray-600">{t('browseListings.sortBy')}</span>
              <span className="font-medium">
                {selectedSort === 'newest' && t('browseListings.newestFirst')}
                {selectedSort === 'oldest' && t('browseListings.oldestFirst')}
                {selectedSort === 'price-low' && t('browseListings.priceLowToHigh')}
                {selectedSort === 'price-high' && t('browseListings.priceHighToLow')}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {t('browseListings.newestFirst')}
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {t('browseListings.oldestFirst')}
                  </button>
                  <button
                    onClick={() => handleSortChange('price-low')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {t('browseListings.priceLowToHigh')}
                  </button>
                  <button
                    onClick={() => handleSortChange('price-high')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {t('browseListings.priceHighToLow')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 ">
            {listings.map((listing) => (
              <CarCard key={listing.id} car={transformListingToCardData(listing)} originalListing={listing}/>
            ))}
            {!isLoading && listings.length === 0 && !error && (
              <div className="col-span-full text-center text-gray-500">
                {t('browseListings.noCarsFound')}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default BrowseListingsMain; 