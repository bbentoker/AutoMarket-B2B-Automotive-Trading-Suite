import React, { useState, useEffect } from 'react';
import carData from '../utils/car_makes_models.json';
import BrandPopup from './popups/BrandPopup';
import ModelPopup from './popups/ModelPopup';
import YearPopup from './popups/YearPopup';
import MileagePopup from './popups/MileagePopup';
import DetailedFiltersPopup from './popups/DetailedFiltersPopup';
import { useTranslation } from '../i18n';

const SearchFilters = ({ onFiltersChange }) => {
  const { t } = useTranslation();
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMileage, setSelectedMileage] = useState('');
  const [models, setModels] = useState([]);
  const [detailedFilters, setDetailedFilters] = useState({});

  // Popup states
  const [isBrandPopupOpen, setIsBrandPopupOpen] = useState(false);
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const [isYearPopupOpen, setIsYearPopupOpen] = useState(false);
  const [isMileagePopupOpen, setIsMileagePopupOpen] = useState(false);
  const [isDetailedFiltersPopupOpen, setIsDetailedFiltersPopupOpen] = useState(false);

  const formatMileageDisplay = (mileageRange) => {
    if (!mileageRange) return `0 - 400,000 ${t('common.km')}`;
    const [start, end] = mileageRange.split('-');
    return `${new Intl.NumberFormat('en-US').format(start)} - ${new Intl.NumberFormat('en-US').format(end)} ${t('common.km')}`;
  };

  useEffect(() => {
    if (selectedBrand && carData[selectedBrand]) {
      setModels(carData[selectedBrand]);
      setSelectedModel(''); // Reset model when brand changes
    } else {
      setModels([]);
    }
  }, [selectedBrand]);

  // Effect to notify parent component of filter changes
  useEffect(() => {
    const filters = {
      brand: selectedBrand,
      model: selectedModel,
      year: selectedYear,
      mileage: selectedMileage,
      ...detailedFilters
    };

    // Use setTimeout to debounce the filter changes
    const timeoutId = setTimeout(() => {
      onFiltersChange(filters);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [selectedBrand, selectedModel, selectedYear, selectedMileage, detailedFilters, onFiltersChange]);

  const handleDetailedFiltersApply = (filters) => {
    setDetailedFilters(filters);
  };

  const handleSearch = () => {
    const filters = {
      brand: selectedBrand,
      model: selectedModel,
      year: selectedYear,
      mileage: selectedMileage,
      ...detailedFilters
    };
    onFiltersChange(filters);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="flex h-16 items-center bg-white border border-gray-200 rounded-full w-6/12 z-10">
        {/* Brand Filter */}
        <div className="flex-1 min-w-0 px-3 py-3 relative">
          <div className="text-xs font-bold text-c-red mb-1 text-left absolute top-5 left-9 bg-white px-1">{t('common.brand')}</div>
          <div className="relative mt-5">
            <button
              className="w-full appearance-none bg-transparent text-xs lg:text-sm focus:outline-none cursor-pointer text-left pl-3 pr-6 text-gray-500 hover:border-none truncate max-w-full"
              onClick={() => setIsBrandPopupOpen(true)}
            >
              {selectedBrand || t('common.searchBrand')}
            </button>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-12 w-px bg-gray-200"></div>

        {/* Model Filter */}
        <div className="flex-1 min-w-0 px-3 py-3 relative">
          <div className="text-xs font-bold text-c-red mb-1 text-left absolute top-5 left-9 bg-white px-1">{t('common.model')}</div>
          <div className="relative mt-5">
            <button
              className="w-full appearance-none bg-transparent text-xs lg:text-sm focus:outline-none cursor-pointer text-left pl-3 pr-6 text-gray-500 hover:border-none truncate max-w-full"
              onClick={() => setIsModelPopupOpen(true)}
            >
              {selectedModel || t('common.selectModel')}
            </button>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-12 w-px bg-gray-200"></div>

        {/* Year Filter */}
        <div className="flex-1 min-w-0 px-3 py-3 relative">
          <div className="text-xs font-bold text-c-red mb-1 text-left absolute top-5 left-9 bg-white px-1">{t('common.year')}</div>
          <div className="relative mt-5">
            <button
              className="w-full appearance-none bg-transparent text-xs lg:text-sm focus:outline-none cursor-pointer text-left pl-3 pr-6 text-gray-500 hover:border-none truncate max-w-full"
              onClick={() => setIsYearPopupOpen(true)}
            >
              {selectedYear || t('common.searchYear')}
            </button>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-12 w-px bg-gray-200"></div>

        {/* Mileage Filter */}
        <div className="flex-1 min-w-0 px-3 py-3 relative">
          <div className="text-xs font-bold text-c-red mb-1 text-left absolute top-5 left-9 bg-white px-1">{t('common.mileage')}</div>
          <div className="relative mt-5">
            <button
              className="w-full appearance-none bg-transparent text-xs lg:text-sm focus:outline-none cursor-pointer text-left pl-3 pr-6 text-gray-500 hover:border-none truncate max-w-full"
              onClick={() => setIsMileagePopupOpen(true)}
            >
              {formatMileageDisplay(selectedMileage)}
            </button>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="px-2 py-3 -ml-4">
          <button
            onClick={handleSearch}
            className="bg-c-red text-white p-3 rounded-full hover:bg-c-red-dark h-12 w-12 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsDetailedFiltersPopupOpen(true)}
        className="w-56 h-16 bg-c-red rounded-full flex items-center justify-end pr-10 text-white text-md -ml-14 z-0 gap-2 pl-10 hover:bg-c-red-dark transition-colors"
      >
        {t('common.filters')}
        <img src="/filter-icon.svg" alt="filter" className="w-6 h-6" />
      </button>

      {/* Popups */}
      <BrandPopup
        isOpen={isBrandPopupOpen}
        onClose={() => setIsBrandPopupOpen(false)}
        selectedBrand={selectedBrand}
        onBrandSelect={(brand) => {
          setSelectedBrand(brand);
          if (!brand) {
            setSelectedModel(''); // Clear model selection when brand is cleared
          }
        }}
      />

      <ModelPopup
        isOpen={isModelPopupOpen}
        onClose={() => setIsModelPopupOpen(false)}
        models={models}
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
      />

      <YearPopup
        isOpen={isYearPopupOpen}
        onClose={() => setIsYearPopupOpen(false)}
        selectedYear={selectedYear}
        onYearSelect={setSelectedYear}
      />

      <MileagePopup
        isOpen={isMileagePopupOpen}
        onClose={() => setIsMileagePopupOpen(false)}
        selectedMileage={selectedMileage}
        onMileageSelect={setSelectedMileage}
      />

      <DetailedFiltersPopup
        isOpen={isDetailedFiltersPopupOpen}
        onClose={() => setIsDetailedFiltersPopupOpen(false)}
        onFiltersApply={handleDetailedFiltersApply}
      />
    </div>
  );
};

export default SearchFilters; 