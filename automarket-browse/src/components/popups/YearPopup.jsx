import React, { useState, useRef, useEffect } from 'react';

const YearPopup = ({ isOpen, onClose, selectedYear, onYearSelect }) => {
  const popupRef = useRef(null);
  const sliderRef = useRef(null);
  const minYear = 1990;
  const maxYear = 2026;
  const [yearRange, setYearRange] = useState({
    start: selectedYear || minYear,
    end: selectedYear || maxYear
  });
  const [inputValues, setInputValues] = useState({
    start: (selectedYear || minYear).toString(),
    end: (selectedYear || maxYear).toString()
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
    const year = Math.round(minYear + (maxYear - minYear) * percentage);

    // Determine which handle to move based on proximity
    const distanceToStart = Math.abs(((yearRange.start - minYear) / (maxYear - minYear)) * rect.width - x);
    const distanceToEnd = Math.abs(((yearRange.end - minYear) / (maxYear - minYear)) * rect.width - x);

    if (e.type === 'mousedown') {
      if (distanceToStart < distanceToEnd) {
        setIsDragging('start');
        setYearRange(prev => ({ ...prev, start: year }));
        setInputValues(prev => ({ ...prev, start: year.toString() }));
      } else {
        setIsDragging('end');
        setYearRange(prev => ({ ...prev, end: year }));
        setInputValues(prev => ({ ...prev, end: year.toString() }));
      }
    } else if (e.type === 'mousemove' && isDragging) {
      if (isDragging === 'start' && year <= yearRange.end) {
        setYearRange(prev => ({ ...prev, start: year }));
        setInputValues(prev => ({ ...prev, start: year.toString() }));
      } else if (isDragging === 'end' && year >= yearRange.start) {
        setYearRange(prev => ({ ...prev, end: year }));
        setInputValues(prev => ({ ...prev, end: year.toString() }));
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

  // Handle min year input change
  const handleMinYearChange = (e) => {
    const value = e.target.value;
    
    // Only allow numeric characters
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    // Update input value immediately for free typing
    setInputValues(prev => ({ ...prev, start: value }));
  };

  // Handle max year input change
  const handleMaxYearChange = (e) => {
    const value = e.target.value;
    
    // Only allow numeric characters
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    // Update input value immediately for free typing
    setInputValues(prev => ({ ...prev, end: value }));
  };

  // Validate and update year range when input loses focus
  const handleMinYearBlur = () => {
    const value = inputValues.start;
    if (value === '') {
      const newValue = minYear;
      setYearRange(prev => ({ ...prev, start: newValue }));
      setInputValues(prev => ({ ...prev, start: newValue.toString() }));
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(minYear, Math.min(numValue, Math.min(maxYear, yearRange.end)));
      setYearRange(prev => ({ ...prev, start: clampedValue }));
      setInputValues(prev => ({ ...prev, start: clampedValue.toString() }));
    }
  };

  // Validate and update year range when input loses focus
  const handleMaxYearBlur = () => {
    const value = inputValues.end;
    if (value === '') {
      const newValue = maxYear;
      setYearRange(prev => ({ ...prev, end: newValue }));
      setInputValues(prev => ({ ...prev, end: newValue.toString() }));
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(maxYear, Math.max(numValue, Math.max(minYear, yearRange.start)));
      setYearRange(prev => ({ ...prev, end: clampedValue }));
      setInputValues(prev => ({ ...prev, end: clampedValue.toString() }));
    }
  };

  // Handle key press to prevent non-numeric input
  const handleKeyPress = (e) => {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if ([8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode)) {
      return;
    }
    // Prevent if not a number
    if (e.key < '0' || e.key > '9') {
      e.preventDefault();
    }
  };

  // Handle Enter key to validate input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // This will trigger the onBlur validation
    }
  };

  const handleApply = () => {
    onYearSelect(`${yearRange.start} - ${yearRange.end}`);
    onClose();
  };

  const handleClear = () => {
    setYearRange({ start: minYear, end: maxYear });
    setInputValues({ start: minYear.toString(), end: maxYear.toString() });
    onYearSelect('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 pt-40">
      <div ref={popupRef} className="bg-white p-8 rounded-2xl relative w-[600px] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div className="text-lg font-bold">Select Year Range</div>
          <span className="text-lg text-gray-600">{yearRange.start} - {yearRange.end}</span>
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
                left: `${((yearRange.start - minYear) / (maxYear - minYear)) * 100}%`,
                right: `${100 - ((yearRange.end - minYear) / (maxYear - minYear)) * 100}%`
              }}
            />
            {/* Start Handle */}
            <div
              className="absolute w-6 h-6 bg-c-red rounded-full -mt-2 -ml-3 cursor-grab active:cursor-grabbing"
              style={{
                left: `${((yearRange.start - minYear) / (maxYear - minYear)) * 100}%`,
              }}
            />

            {/* End Handle */}
            <div
              className="absolute w-6 h-6 bg-c-red rounded-full -mt-2 -ml-3 cursor-grab active:cursor-grabbing"
              style={{
                left: `${((yearRange.end - minYear) / (maxYear - minYear)) * 100}%`,
              }}
            />

            {/* Year Labels */}
            <div className="absolute w-full flex justify-between mt-6 text-sm text-gray-500">
              <span>{minYear}</span>
              <span>{Math.round((minYear + maxYear) / 2)}</span>
              <span>{maxYear}</span>
            </div>
          </div>

          {/* Year Labels */}
          <div className="flex justify-between mt-8">
            <div>
              <div className="text-sm text-gray-500">Min (Year)</div>
              <input
                type="text"
                value={inputValues.start}
                onChange={handleMinYearChange}
                onBlur={handleMinYearBlur}
                onKeyPress={handleKeyPress}
                onKeyDown={handleKeyDown}
                className="w-48 p-2 mt-1 border border-gray-200 rounded-xl text-center"
                placeholder="year"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500">Max (Year)</div>
              <input
                type="text"
                value={inputValues.end}
                onChange={handleMaxYearChange}
                onBlur={handleMaxYearBlur}
                onKeyPress={handleKeyPress}
                onKeyDown={handleKeyDown}
                className="w-48 p-2 mt-1 border border-gray-200 rounded-xl text-center"
                placeholder="year"
              />
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

export default YearPopup; 