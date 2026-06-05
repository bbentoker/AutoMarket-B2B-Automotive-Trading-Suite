import React, { useState, useRef, useEffect } from 'react';

const ModelPopup = ({ isOpen, onClose, models, selectedModel, onModelSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const popupRef = useRef(null);

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

  // Filter models based on search query
  const filteredModels = models.filter(model =>
    model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 pt-40">
      <div ref={popupRef} className="bg-white p-8 rounded-2xl relative w-[600px] overflow-hidden shadow-xl">
        {/* Search Input */}
        <div className="relative mb-8 mt-2">
          <input
            type="text"
            placeholder="Search for model..."
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
              {selectedModel && (
                <button
                  onClick={() => {
                    onModelSelect('');
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

            {models.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-500 text-sm">Please select a brand first</h3>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      onModelSelect(model);
                      onClose();
                    }}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center hover:border-c-red transition-colors ${
                      selectedModel === model ? 'border-c-red' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <span className="text-sm text-center">{model}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPopup; 