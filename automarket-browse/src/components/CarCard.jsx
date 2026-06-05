import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const CarCard = ({ car, originalListing }) => {
  if (!car.image)
    return <div>No car found</div>

  const formatTransmission = (transmission) => {
    return transmission.slice(0, 3);
  };

  return (
    <Link to={`/listings/${car.id}`} className="block">
      <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-sm h-full flex flex-col cursor-pointer" style={{ border: '1px solid rgba(236, 236, 236, 1)' }}>
        <div className="relative h-48">
          <img
            src={car.image.startsWith('data:') || car.image.startsWith('http') ? car.image : `/${car.image}`}
            alt={car.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/car-icon.svg';
            }}
          />
          {/* Remaining time - Hidden */}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex flex-col flex-grow">
            <div className="min-h-[4.5rem] flex flex-col justify-start">
              <div className="text-sm font-semibold text-gray-900">{originalListing?.brand_name}  {originalListing?.model?.split(' ').length > 1 ? originalListing?.model?.split(' ')[0] : originalListing?.model} - {car.year}</div>
              <p className="text-sm text-gray-400 line-clamp-3">{originalListing?.model}</p>
            </div>
            <div className="w-full h-px bg-gray-200 mb-3"></div>
            <div className="flex items-center justify-between min-w-0 px-4 mb-2 h-[4.5rem]">
              <div className="flex flex-col items-center text-center min-w-0 flex-1">
                <img src="/mileage-icon.svg" alt="Mileage" className="h-5 w-5 mb-1.5" />
                <span className="text-sm whitespace-nowrap" style={{ color: 'rgb(144, 149, 191)' }}>{car.mileage}</span>
              </div>
              <div className="flex flex-col items-center text-center min-w-0 flex-1">
                <img src="/fuel-icon.svg" alt="Fuel Type" className="h-5 w-5 mb-1.5" />
                <span className="text-sm w-full max-w-[5.5rem] truncate overflow-hidden text-center" style={{ color: 'rgba(144, 163, 191, 1)' }}>{car.fuelType}</span>
              </div>
              <div className="flex flex-col items-center text-center min-w-0 flex-1">
                <img src="/transmission-icon.svg" alt="Transmission" className="h-5 w-5 mb-1.5" />
                <span className="text-sm text-center w-full max-w-[5.5rem]" style={{ color: 'rgba(144, 163, 191, 1)' }}>
                  <span className="block text-ellipsis overflow-hidden" style={{ minWidth: 0 }}>
                    {car.transmission.length * 7 > 88 ? formatTransmission(car.transmission) : car.transmission}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <div className="w-full h-px bg-gray-200 my-1"></div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-500 text-center h-12 pt-2 flex items-center">
                  {originalListing?.vat_or_margin}
                </span>
                <span className="text-base font-bold text-gray-900 h-7 pt-2 flex items-center">€{car.price.toLocaleString()}</span>
              </div>
              <img
                src="/details-icon.svg"
                alt="Details"
                className="h-10 w-20 pt-1 pl-1 hover:opacity-80 transition-opacity duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

CarCard.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string,
    mileage: PropTypes.string.isRequired,
    fuelType: PropTypes.string.isRequired,
    transmission: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    remainingTime: PropTypes.string,
    vat_or_margin: PropTypes.string.isRequired,
  }).isRequired,
  originalListing: PropTypes.object,
};

export default CarCard; 