import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carData from '../utils/car_makes_models.json';
import BrandPopup from './popups/BrandPopup';
import ModelPopup from './popups/ModelPopup';
import YearPopup from './popups/YearPopup';
import MileagePopup from './popups/MileagePopup';
import DetailedFiltersPopup from './popups/DetailedFiltersPopup';
import { useTranslation } from '../i18n';

const SearchFilters = ({ onFiltersChange }) => {
  const navigate = useNavigate();
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
    if (!onFiltersChange) return;
    
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
     
     // Create URL search parameters
     const searchParams = new URLSearchParams();
     
     // Add non-empty filter values to URL parameters
     Object.entries(filters).forEach(([key, value]) => {
       if (value && value !== '') {
         searchParams.set(key, value);
       }
     });
     
     // Navigate to index page with search parameters
     const queryString = searchParams.toString();
     navigate(queryString ? `/?${queryString}` : '/');
   };

  return (
    <div className="w-full flex justify-center">
      <div className="flex h-12 items-center bg-white border border-gray-200 rounded-full  z-10">
                 {/* Brand Filter */}
         <div onClick={() => setIsBrandPopupOpen(true)} className="flex-1 px-6 py-3 flex items-center justify-center cursor-pointer hover:bg-gray-100">
           <div className="text-sm font-medium text-gray-900">{t('common.brand')}</div>
         </div>

        {/* Vertical Divider */}
        <div className="h-12 w-px bg-gray-200"></div>

                 {/* Model Filter */}
         <div onClick={() => setIsModelPopupOpen(true)} className="flex-1 px-6 py-3 flex items-center justify-center cursor-pointer hover:bg-gray-100">
           <div className="text-sm font-medium text-gray-900">{t('common.model')}</div>
         </div>

        {/* Vertical Divider */}
        <div className="h-12 w-px bg-gray-200"></div>

                 {/* Year Filter */}
         <div onClick={() => setIsYearPopupOpen(true)} className="flex-1 px-6 py-3 flex items-center justify-center cursor-pointer hover:bg-gray-100">
           <div className="text-sm font-medium text-gray-900">{t('common.year')}</div>
         </div>

         {/* Vertical Divider */}
         <div className="h-12 w-px bg-gray-200"></div>

         {/* Mileage Filter */}
         <div onClick={() => setIsMileagePopupOpen(true)} className="flex-1 px-6 py-3 flex items-center justify-center cursor-pointer hover:bg-gray-100">
           <div className="text-sm font-medium text-gray-900">{t('common.mileage')}</div>
         </div>

        {/* Search Button */}
                 <div className="px-2 py-3">
           <button 
             onClick={handleSearch}
             className="bg-c-red text-white p-2 rounded-full hover:bg-red-600 h-8 w-8 flex items-center justify-center"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
             </svg>
           </button>
         </div>
      </div>

      <button 
        onClick={() => setIsDetailedFiltersPopupOpen(true)}
        className="w-48 h-12 bg-c-red rounded-full flex items-center justify-end  text-white text-md -ml-20 z-0 gap-2 pr-8 hover:bg-red-600 transition-colors"
      >
        {t('common.filters')}
        <img src="/filter-icon.svg" alt="filter" className="w-4 h-4" />
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