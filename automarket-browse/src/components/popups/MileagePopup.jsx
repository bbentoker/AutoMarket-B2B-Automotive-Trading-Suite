import React, { useState, useRef, useEffect } from 'react';

const MileagePopup = ({ isOpen, onClose, selectedMileage, onMileageSelect }) => {
  const popupRef = useRef(null);
  const sliderRef = useRef(null);
  const minKm = 0;
  const maxKm = 400000;
  const [mileageRange, setMileageRange] = useState({
    start: selectedMileage ? parseInt(selectedMileage.split('-')[0]) : minKm,
    end: selectedMileage ? parseInt(selectedMileage.split('-')[1]) : maxKm
  });
  const [isDragging, setIsDragging] = useState(null); // 'start', 'end', or null

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

  // Handle slider click and drag
  const handleSliderInteraction = (e) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);
    const km = Math.round(minKm + (maxKm - minKm) * percentage);

    // Determine which handle to move based on proximity
    const distanceToStart = Math.abs(((mileageRange.start - minKm) / (maxKm - minKm)) * rect.width - x);
    const distanceToEnd = Math.abs(((mileageRange.end - minKm) / (maxKm - minKm)) * rect.width - x);

    if (e.type === 'mousedown') {
      if (distanceToStart < distanceToEnd) {
        setIsDragging('start');
        setMileageRange(prev => ({ ...prev, start: km }));
      } else {
        setIsDragging('end');
        setMileageRange(prev => ({ ...prev, end: km }));
      }
    } else if (e.type === 'mousemove' && isDragging) {
      if (isDragging === 'start' && km <= mileageRange.end) {
        setMileageRange(prev => ({ ...prev, start: km }));
      } else if (isDragging === 'end' && km >= mileageRange.start) {
        setMileageRange(prev => ({ ...prev, end: km }));
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleSliderInteraction(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleApply = () => {
    onMileageSelect(`${mileageRange.start}-${mileageRange.end}`);
    onClose();
  };

  const handleClear = () => {
    setMileageRange({ start: minKm, end: maxKm });
    onMileageSelect('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 pt-40">
      <div ref={popupRef} className="bg-white p-8 rounded-2xl relative w-[600px] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div className="text-lg font-bold">Set Mileage Range</div>
          <span className="text-lg text-gray-600">{formatNumber(mileageRange.start)} - {formatNumber(mileageRange.end)} km</span>
        </div>

        <div className="mb-12">
          {/* Range Slider */}
          <div 
            ref={sliderRef}
            className="relative pt-6 pb-6 cursor-pointer"
            onMouseDown={handleSliderInteraction}
          >
            {/* Track */}
            <div className="absolute h-2 w-full bg-gray-200 rounded-full" />
            
            {/* Selected Range */}
            <div 
              className="absolute h-2 bg-c-red rounded-full"
              style={{
                left: `${((mileageRange.start - minKm) / (maxKm - minKm)) * 100}%`,
                right: `${100 - ((mileageRange.end - minKm) / (maxKm - minKm)) * 100}%`
              }}
            />

            {/* Start Handle */}
            <div
              className="absolute w-6 h-6 bg-c-red rounded-full -mt-2 -ml-3 cursor-grab active:cursor-grabbing"
              style={{
                left: `${((mileageRange.start - minKm) / (maxKm - minKm)) * 100}%`,
              }}
            />

            {/* End Handle */}
            <div
              className="absolute w-6 h-6 bg-c-red rounded-full -mt-2 -ml-3 cursor-grab active:cursor-grabbing"
              style={{
                left: `${((mileageRange.end - minKm) / (maxKm - minKm)) * 100}%`,
              }}
            />

            {/* Mileage Labels */}
            <div className="absolute w-full flex justify-between mt-6 text-sm text-gray-500">
              <span>{formatNumber(minKm)} km</span>
              <span>{formatNumber(maxKm/2)} km</span>
              <span>{formatNumber(maxKm)} km</span>
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex justify-between mt-8">
            <div>
              <div className="text-sm text-gray-500">Min (Km)</div>
              <div className="relative">
                <input
                  type="number"
                  value={mileageRange.start}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= minKm && value <= mileageRange.end) {
                      setMileageRange(prev => ({ ...prev, start: value }));
                    }
                  }}
                  className="w-48 p-2 mt-1 border border-gray-200 rounded-xl text-center pr-12"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">km</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Max (Km)</div>
              <div className="relative">
                <input
                  type="number"
                  value={mileageRange.end}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value <= maxKm && value >= mileageRange.start) {
                      setMileageRange(prev => ({ ...prev, end: value }));
                    }
                  }}
                  className="w-48 p-2 mt-1 border border-gray-200 rounded-xl text-center pr-12"
                  placeholder="400000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleClear}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-c-red text-white rounded-xl hover:bg-red-600 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default MileagePopup; 