import React, { useState, useEffect, useRef } from 'react';
import carData from '../utils/car_makes_models.json';
import BrandPopup from './popups/BrandPopup';
import ModelPopup from './popups/ModelPopup';
import YearPopup from './popups/YearPopup';
import MileagePopup from './popups/MileagePopup';
import DetailedFiltersPopup from './popups/DetailedFiltersPopup';

const SearchFiltersMobile = ({ onFiltersChange }) => {
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
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const filterMenuRef = useRef(null);

  const formatMileageDisplay = (mileageRange) => {
    if (!mileageRange) return null;
    const [start, end] = mileageRange.split('-');
    return `${new Intl.NumberFormat('en-US').format(start)} - ${new Intl.NumberFormat('en-US').format(end)} km`;
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

  // Handle click outside filter menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    };

    if (isFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  const handleDetailedFiltersApply = (filters) => {
    setDetailedFilters(filters);
  };

  // Get active filters for display as chips
  const getActiveFilters = () => {
    const filters = [];
    if (selectedBrand) filters.push({ type: 'brand', value: selectedBrand, label: selectedBrand });
    if (selectedModel) filters.push({ type: 'model', value: selectedModel, label: selectedModel });
    if (selectedYear) filters.push({ type: 'year', value: selectedYear, label: selectedYear });
    if (selectedMileage) filters.push({ type: 'mileage', value: selectedMileage, label: formatMileageDisplay(selectedMileage) });

    // Add detailed filters with proper formatting
    Object.entries(detailedFilters).forEach(([key, value]) => {
      if (value) {
        let displayValue = value;

        // Handle different types of filter values
        if (typeof value === 'object' && value !== null) {
          if (value.min !== undefined && value.max !== undefined) {
            // Handle range objects (price, power, etc.)
            displayValue = `${value.min} - ${value.max}`;
          } else if (value.from !== undefined && value.to !== undefined) {
            // Handle from-to range objects
            displayValue = `${value.from} - ${value.to}`;
          } else if (Array.isArray(value)) {
            // Handle array values
            displayValue = value.join(', ');
          } else {
            // Handle other object types
            displayValue = JSON.stringify(value);
          }
        }

        // Format the label based on the key
        let label = `${key}: ${displayValue}`;

        // Special formatting for specific filter types
        switch (key) {
          case 'price':
            label = `Price: $${displayValue}`;
            break;
          case 'power':
            label = `Power: ${displayValue} HP`;
            break;
          case 'bodyType':
            label = `Body: ${displayValue}`;
            break;
          case 'transmission':
            label = `Transmission: ${displayValue}`;
            break;
          case 'fuelType':
            label = `Fuel: ${displayValue}`;
            break;
          case 'drivetrain':
            label = `Drivetrain: ${displayValue}`;
            break;
          case 'condition':
            label = `Condition: ${displayValue}`;
            break;
          default:
            label = `${key}: ${displayValue}`;
        }

        filters.push({ type: key, value: value, label: label });
      }
    });

    return filters;
  };

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'brand':
        setSelectedBrand('');
        setSelectedModel(''); // Clear model when brand is cleared
        break;
      case 'model':
        setSelectedModel('');
        break;
      case 'year':
        setSelectedYear('');
        break;
      case 'mileage':
        setSelectedMileage('');
        break;
      default:
        // Handle detailed filters
        setDetailedFilters(prev => ({
          ...prev,
          [filterType]: ''
        }));
        break;
    }
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Search Input Container */}
      <div className="flex justify-center relative w-full">
        <div className="flex h-16 items-center bg-white border border-gray-200 rounded-full w-9/12 z-10">
          {/* Search Input */}
          <div className="flex-1 px-6 py-3 relative">
            <div className="flex items-center relative">
              <svg className="h-10 w-10 text-black " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                className="w-full appearance-none bg-transparent text-sm focus:outline-none cursor-pointer text-left text-gray-500 hover:border-none"
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              >
                <div className="text-lg font-normal text-black">
                  Search
                  <div className="text-xs font-normal whitespace-nowrap text-gray-500">
                    Brand • Model • Year • Mileage
                  </div>
                </div>
              </button>

              {/* Filter Selection Menu */}
              {isFilterMenuOpen && (
                <div ref={filterMenuRef} className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-t-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setIsBrandPopupOpen(true);
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1" />
                      </svg>
                      Brand
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setIsModelPopupOpen(true);
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Model
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setIsYearPopupOpen(true);
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Year
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setIsMileagePopupOpen(true);
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Mileage
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700  flex items-center"
                      onClick={() => {
                        setIsDetailedFiltersPopupOpen(true);
                        setIsFilterMenuOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Button - Separate Container */}
        <div className="h-16 w-32 bg-c-red rounded-full relative -ml-16 z-0">
          <button
            onClick={() => setIsDetailedFiltersPopupOpen(true)}
            className="text-white hover:text-gray-200 bg-c-red flex items-center justify-center absolute right-1 top-1/2 transform -translate-y-1/2 w-[60px] h-[60px] rounded-full hover:bg-c-red-dark transition-colors"
            aria-label="Open detailed filters"
          >
            <img src="/filter-icon.svg" alt="" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 w-9/12">
          {activeFilters.map((filter, index) => (
            <div
              key={`${filter.type}-${index}`}
              className="flex items-center bg-c-white font-semibold border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700"
            >
              <span className="ml-4">{filter.label}</span>
              <button
                onClick={() => removeFilter(filter.type)}
                className="ml-2 text-gray-500 hover:text-gray-700 w-2  "
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

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

export default SearchFiltersMobile; 