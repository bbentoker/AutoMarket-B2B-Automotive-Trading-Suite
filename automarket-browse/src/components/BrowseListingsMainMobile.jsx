import React from 'react';
import SearchFiltersMobile from './SearchFiltersMobile';
import CarCardMobile from './CarCardMobile';
import { useTranslation } from '../i18n';

const BrowseListingsMainMobile = ({
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
      <SearchFiltersMobile onFiltersChange={onFiltersChange} />
      
      <div className="mt-8 bg-c-white p-5 px-10 shadow-md">
        <div className="flex justify-between items-center mb-4 items-center ">
          <div className="flex gap-1 items-center">
            <div className="font-bold text-sm text-black">{t('browseListings.usedCarsForSale')}</div>
            <div className="text-sm font-medium text-gray-400">
              {pagination && `(${pagination.totalListings} ${t('browseListings.cars')}) `}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 border-1 h-8 border-gray-300 rounded-lg p-1 px-3 bg-white hover:bg-gray-50 whitespace-nowrap"
            >
              <span className="text-gray-600 text-xs">{t('browseListings.sortByMobile')}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs"
                  >
                    {t('browseListings.newestFirst')}
                  </button>
                  <button
                    onClick={() => handleSortChange('oldest')}
                    className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs"
                  >
                    {t('browseListings.oldestFirst')}
                  </button>
                  <button
                    onClick={() => handleSortChange('price-low')}
                    className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs"
                  >
                    {t('browseListings.priceLowToHigh')}
                  </button>
                  <button
                    onClick={() => handleSortChange('price-high')}
                    className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs"
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
              <CarCardMobile key={listing.id} car={transformListingToCardData(listing)} originalListing={listing}/>
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

export default BrowseListingsMainMobile; 