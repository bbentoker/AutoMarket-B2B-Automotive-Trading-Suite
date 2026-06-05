import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ModernDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const ModernDropdown: React.FC<ModernDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200 hover:border-gray-400
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedOption?.icon && (
              <div className="flex-shrink-0">
                {selectedOption.icon}
              </div>
            )}
            <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150
                  flex items-center justify-between group
                  ${value === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}
                `}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && (
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                  )}
                  <span className="block truncate">{option.label}</span>
                </div>
                {value === option.value && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDropdown;