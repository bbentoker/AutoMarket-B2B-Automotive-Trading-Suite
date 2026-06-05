import React, { useState, useRef, useEffect } from 'react';
import carData from '../../utils/car_makes_models.json';
import logoList from '../../utils/logoList';

const BrandPopup = ({ isOpen, onClose, selectedBrand, onBrandSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const popupRef = useRef(null);

  const getBrandLogo = (brandName) => {
    if (!brandName) return null;
    
    // Find matching logo in logoList
    const matchingLogo = logoList.find(item => {
      const logoBrandName = item.split(':')[0].toLowerCase();
      return logoBrandName === brandName.toLowerCase();
    });
    
    if (matchingLogo) {
      // Split again to get the logo filename
      const logoFileName = matchingLogo.split(':')[1];
      console.log(logoFileName);
      return `/brand-logos/${logoFileName}`;
    }
    
    return null;
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filter brands based on search query
  const filteredBrands = Object.keys(carData).filter(brand =>
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 pt-40">
      <div ref={popupRef} className="bg-white p-8 rounded-2xl relative w-[600px] overflow-hidden shadow-xl">
        

        {/* Search Input */}
        <div className="relative mb-8 mt-2">
          <input
            type="text"
            placeholder="Search for make..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:border-c-red"
          />
          <div className="absolute inset-y-0 left-3 flex items-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[400px] pr-2">
          {/* Quick Search Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-medium">Quick search</h3>
              {selectedBrand && (
                <button
                  onClick={() => {
                    onBrandSelect('');
                    onClose();
                  }}
                  className="text-sm text-c-red hover:text-red-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear selection
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {filteredBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    onBrandSelect(brand);
                    onClose();
                  }}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center hover:border-c-red transition-colors ${
                    selectedBrand === brand ? 'border-c-red' : 'border-gray-200'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-2">
                    {getBrandLogo(brand) ? (
                      <img
                        src={getBrandLogo(brand)}
                        alt={brand}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="text-xs text-gray-400 font-medium">
                        {brand.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-center">{brand}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPopup; 