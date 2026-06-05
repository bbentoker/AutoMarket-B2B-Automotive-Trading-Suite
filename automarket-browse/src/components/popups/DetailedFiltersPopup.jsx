import React, { useState, useRef, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// Move CollapsibleSection outside to prevent re-creation
const CollapsibleSection = React.memo(({ title, isExpanded, onToggle, children }) => (
  <div className="border-b border-gray-200">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left focus:outline-none hover:border-b-1 hover:border-white"
    >
      <span className="text-gray-900">{title}</span>
      <svg
        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isExpanded && (
      <div className="pb-4">
        {children}
      </div>
    )}
  </div>
));

CollapsibleSection.displayName = 'CollapsibleSection';

// Range Slider Component using rc-slider - Moved outside to prevent recreation
const RangeSlider = React.memo(({ min, max, value, onChange, formatValue, unit }) => {
  const handleChange = React.useCallback((values) => {
    onChange({ min: values[0], max: values[1] });
  }, [onChange]);

  return (
  <div className="px-6">
    <div className="space-y-6">
      {/* RC Slider Range */}
      <div className="py-4" style={{ userSelect: 'none', position: 'relative', width: '100%' }}>
        <div style={{ width: '100%', padding: '0 4px' }}>
          <Slider
          range
          min={min}
          max={max}
          value={[value.min, value.max]}
          onChange={handleChange}
          allowCross={false}
          trackStyle={[{ backgroundColor: 'rgba(32, 191, 182, 1)', height: 8 }]}
          railStyle={{ backgroundColor: '#e5e7eb', height: 8 }}
          handleStyle={[
            {
              backgroundColor: 'rgba(32, 191, 182, 1)',
              borderColor: 'rgba(32, 191, 182, 1)',
              width: 20,
              height: 20,
              marginTop: -6,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              cursor: 'grab',
            },
            {
              backgroundColor: 'rgba(32, 191, 182, 1)',
              borderColor: 'rgba(32, 191, 182, 1)',
              width: 20,
              height: 20,
              marginTop: -6,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              cursor: 'grab',
            }
          ]}
          activeDotStyle={{ borderColor: 'rgba(32, 191, 182, 1)' }}
        />
        </div>
      </div>

      {/* Value Display */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatValue(value.min)} {unit}</span>
        <span>{formatValue(value.max)} {unit}</span>
      </div>

      {/* Input Fields */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-sm text-gray-500">Min {unit}</div>
          <div className="relative">
            <input
              type="number"
              value={value.min}
              onChange={(e) => {
                const newMin = parseInt(e.target.value) || min;
                if (newMin <= value.max && newMin >= min) {
                  onChange({ ...value, min: newMin });
                }
              }}
              className="w-full p-2 mt-1 border border-gray-200 rounded-xl text-center pr-12"
              placeholder={min.toString()}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">{unit}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">Max {unit}</div>
          <div className="relative">
            <input
              type="number"
              value={value.max}
              onChange={(e) => {
                const newMax = parseInt(e.target.value) || max;
                if (newMax >= value.min && newMax <= max) {
                  onChange({ ...value, max: newMax });
                }
              }}
              className="w-full p-2 mt-1 border border-gray-200 rounded-xl text-center pr-12"
              placeholder={max.toString()}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
});

RangeSlider.displayName = 'RangeSlider';

const DetailedFiltersPopup = ({ isOpen, onClose, onFiltersApply }) => {
  const popupRef = useRef(null);
  const minPrice = 0;
  const maxPrice = 400000;
  const minPower = 0;
  const maxPower = 1000;
  const [priceRange, setPriceRange] = useState({
    min: minPrice,
    max: maxPrice
  });
  const [powerRange, setPowerRange] = useState({
    min: minPower,
    max: maxPower
  });
  const [plateNumber, setPlateNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedDriveType, setSelectedDriveType] = useState('');
  const [selectedSeats, setSelectedSeats] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Add state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    reference: false,
    price: false,
    bodyType: false,
    fuel: false,
    transmission: false,
    power: false,
    driveType: false,
    seats: false,
    color: false
  });

  const bodyTypes = ['Compact', 'Convertible', 'Coupe', 'SUV', 'StationWagon', 'Sedan', 'VAN', 'Transporter'];
  const fuelTypes = ['Petrol', 'Diesel', 'LPG + Petrol', 'Hybrid', 'CNG + Petrol', 'PHEV', 'Electric'];
  const transmissionTypes = ['Automatic', 'Manual'];
  const driveTypes = ['4WD', 'FWD', 'RWD'];
  const seatOptions = [
    { label: 'Up to 3', value: '1-3' },
    { label: '4-5', value: '4-5' },
    { label: '6-7', value: '6-7' },
    { label: '8-9', value: '8-9' },
    { label: 'Over 9', value: '9-12' }
  ];
  const colorOptions = [
    { name: 'White', class: 'bg-gray-100' },
    { name: 'Black', class: 'bg-black' },
    { name: 'Purple', class: 'bg-purple-600' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Gray', class: 'bg-gray-500' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Brown', class: 'bg-amber-800' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Pink', class: 'bg-pink-200' },
    { name: 'Beige', class: 'bg-[#E8DCC4]' },
    { name: 'Gold', class: 'bg-yellow-600' },
    { name: 'Burgundy', class: 'bg-red-900' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Silver', class: 'bg-gray-200' },
    { name: 'Yellow', class: 'bg-yellow-400' }
  ];

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

  // Update the card button class generator
  const getCardButtonClass = (isSelected) => `
    p-2 border rounded-xl text-sm transition-colors
    ${isSelected 
      ? 'border-c-red text-c-red' 
      : 'border-gray-200 text-gray-600 hover:bg-c-red hover:text-white hover:border-c-red'}
  `;



  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleApply = () => {
    onFiltersApply({
      price: {
        min: priceRange.min,
        max: priceRange.max
      },
      power: {
        min: powerRange.min,
        max: powerRange.max
      },
      plateNumber,
      referenceNumber,
      bodyType: selectedBodyType,
      fuelType: selectedFuelType,
      transmission: selectedTransmission,
      driveType: selectedDriveType,
      seats: selectedSeats,
      color: selectedColor
    });
    onClose();
  };

  const handleClear = () => {
    setPriceRange({ min: minPrice, max: maxPrice });
    setPowerRange({ min: minPower, max: maxPower });
    setPlateNumber('');
    setReferenceNumber('');
    setSelectedBodyType('');
    setSelectedFuelType('');
    setSelectedTransmission('');
    setSelectedDriveType('');
    setSelectedSeats('');
    setSelectedColor('');
  };

  const toggleSection = React.useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleReferenceNumberChange = React.useCallback((e) => {
    setReferenceNumber(e.target.value);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 pt-20">
      <div ref={popupRef} className="bg-white rounded-2xl relative w-[600px] max-h-[90vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="relative border-b border-gray-200">
          <div className="text-center py-6">
            <span className="text-xl font-bold">Detailed filters</span>
          </div>
          <button 
            onClick={onClose} 
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {/* Reference Number */}
          <CollapsibleSection
            title="Reference Number"
            isExpanded={expandedSections.reference}
            onToggle={() => toggleSection('reference')}
          >
            <div className="px-6">
              <input
                type="text"
                value={referenceNumber}
                onChange={handleReferenceNumberChange}
                placeholder="Enter reference number"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-c-red"
              />
            </div>
          </CollapsibleSection>

          {/* Price Range */}
          <CollapsibleSection
            title="Price"
            isExpanded={expandedSections.price}
            onToggle={() => toggleSection('price')}
          >
            <div key={`price-${expandedSections.price}`}>
              <RangeSlider
                min={minPrice}
                max={maxPrice}
                value={priceRange}
                onChange={setPriceRange}
                formatValue={formatNumber}
                unit="€"
              />
            </div>
          </CollapsibleSection>

          {/* Body Type */}
          <CollapsibleSection
            title="Body type"
            isExpanded={expandedSections.bodyType}
            onToggle={() => toggleSection('bodyType')}
          >
            <div className="px-6">
              <div className="grid grid-cols-3 gap-3">
                {bodyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedBodyType(type === selectedBodyType ? '' : type)}
                    className={getCardButtonClass(selectedBodyType === type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Fuel Type */}
          <CollapsibleSection
            title="Fuel"
            isExpanded={expandedSections.fuel}
            onToggle={() => toggleSection('fuel')}
          >
            <div className="px-6">
              <div className="grid grid-cols-3 gap-3">
                {fuelTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFuelType(type === selectedFuelType ? '' : type)}
                    className={getCardButtonClass(selectedFuelType === type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Transmission */}
          <CollapsibleSection
            title="Transmission"
            isExpanded={expandedSections.transmission}
            onToggle={() => toggleSection('transmission')}
          >
            <div className="px-6">
              <div className="grid grid-cols-2 gap-3">
                {transmissionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTransmission(type === selectedTransmission ? '' : type)}
                    className={`${getCardButtonClass(selectedTransmission === type)} py-3`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Power */}
          <CollapsibleSection
            title="Power"
            isExpanded={expandedSections.power}
            onToggle={() => toggleSection('power')}
          >
            <div key={`power-${expandedSections.power}`}>
              <RangeSlider
                min={minPower}
                max={maxPower}
                value={powerRange}
                onChange={setPowerRange}
                formatValue={formatNumber}
                unit="HP"
              />
            </div>
          </CollapsibleSection>

          {/* Drive Type */}
          <CollapsibleSection
            title="Drive type"
            isExpanded={expandedSections.driveType}
            onToggle={() => toggleSection('driveType')}
          >
            <div className="px-6">
              <div className="grid grid-cols-2 gap-3">
                {driveTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedDriveType(type === selectedDriveType ? '' : type)}
                    className={`${getCardButtonClass(selectedDriveType === type)} py-3`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Number of seats */}
          <CollapsibleSection
            title="Number of seats"
            isExpanded={expandedSections.seats}
            onToggle={() => toggleSection('seats')}
          >
            <div className="px-6">
              <div className="grid grid-cols-3 gap-3">
                {seatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSeats(option.value === selectedSeats ? '' : option.value)}
                    className={getCardButtonClass(selectedSeats === option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Color */}
          <CollapsibleSection
            title="Color"
            isExpanded={expandedSections.color}
            onToggle={() => toggleSection('color')}
          >
            <div className="px-6">
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name === selectedColor ? '' : color.name)}
                    className={`w-full h-8 rounded-md ${color.class} ${
                      selectedColor === color.name ? 'ring-2 ring-c-red ring-offset-2' : ''
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleClear}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            All Clear
          </button>
          <button
            onClick={handleApply}
            className="px-12 py-3 bg-c-red text-white rounded-full hover:bg-red-600 transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedFiltersPopup; 