import React from 'react';
import { 
  X, 
  Car, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Building,
  Phone,
  Mail
} from 'lucide-react';

interface CarPhoto {
  url: string;
}

interface AssignedTo {
  id: number;
  name: string;
  email: string;
  company_name: string;
  phone_number: string;
}

interface CarData {
  id: number;
  brand_name: string;
  model: string;
  color: string;
  fuel_type: string;
  transmission_type: string;
  listing_price: string;
  currency: string;
  km_stand: number;
  deal_stage: string;
  created_at: string;
  updated_at: string;
  photos: CarPhoto[];
  features: string;
  horsepower: string;
  first_registration: string;
  seller_company?: string;
  registration_number: string;
  vin_number?: string;
  internal_url?: string;
  co2?: string;
  seat?: string;
  vat_or_margin?: string;
  reference_no?: string;
  seller_email?: string;
  contact_person?: string;
  telephone?: string;
  mobile?: string;
  email_address?: string;
  seller_address?: string;
  previous_accidents?: boolean;
  expiration?: number;
  tracking_code?: string;
  grade?: string;
  zoho_id?: string;
  assignedTo?: AssignedTo;
}

interface CarDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarData | null;
}

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  car 
}) => {
  if (!isOpen || !car) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    const symbol = currency === 'euro' ? '€' : '$';
    return `${symbol}${numPrice.toLocaleString()}`;
  };

  const formatMileage = (km: number) => {
    return `${km.toLocaleString()} km`;
  };

  const getCarYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  const getCarTitle = () => {
    return `${car.brand_name} ${car.model} - ${getCarYear(car.first_registration)}`;
  };

  const parseFeatures = (features: string) => {
    if (!features) return [];
    return features.split(',').map(feature => feature.trim()).filter(feature => feature.length > 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-950">Car Details</h2>
              <p className="text-sm text-gray-500">{getCarTitle()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Car Content */}
        <div className="p-6 space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg">
                <span className="text-sm font-medium">{car.deal_stage}</span>
              </div>
              {car.reference_no && (
                <div className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Ref: {car.reference_no}</span>
                </div>
              )}
            </div>
            
            
          </div>

          {/* Car Images and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                {car.photos && car.photos.length > 0 ? (
                  <img 
                    src={car.photos[0].url} 
                    alt={getCarTitle()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              {car.photos && car.photos.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {car.photos.slice(1).map((photo, index) => (
                    <img 
                      key={index}
                      src={photo.url} 
                      alt={`${getCarTitle()} - ${index + 2}`}
                      className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary-950 mb-2">{getCarTitle()}</h3>
                <div className="text-3xl font-bold text-primary-950 mb-4">
                  {formatPrice(car.listing_price, car.currency)}
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    {car.vat_or_margin ? `(${car.vat_or_margin})` : ''}
                  </span>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Mileage</p>
                    <p className="font-medium">{formatMileage(car.km_stand)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-medium">{car.fuel_type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-medium">{car.transmission_type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">First Registration</p>
                    <p className="font-medium">{formatDate(car.first_registration)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-950 mb-4">Detailed Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Brand</p>
                <p className="font-medium">{car.brand_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Model</p>
                <p className="font-medium">{car.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Color</p>
                <p className="font-medium">{car.color}</p>
              </div>
              {car.horsepower && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Horsepower</p>
                  <p className="font-medium">{car.horsepower}</p>
                </div>
              )}
              {car.co2 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">CO2 Emissions</p>
                  <p className="font-medium">{car.co2}</p>
                </div>
              )}
              {car.seat && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Seats</p>
                  <p className="font-medium">{car.seat}</p>
                </div>
              )}
              {car.vin_number && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">VIN Number</p>
                  <p className="font-medium font-mono">{car.vin_number}</p>
                </div>
              )}
              {car.previous_accidents !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Previous Accidents</p>
                  <p className={`font-medium ${car.previous_accidents ? 'text-red-600' : 'text-green-600'}`}>
                    {car.previous_accidents ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          {car.features && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary-950 mb-4">Features & Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {parseFeatures(car.features).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dealer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-950 mb-4">Dealer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {car.assignedTo && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dealer Name</p>
                    <p className="font-medium">{car.assignedTo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{car.assignedTo.company_name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{car.assignedTo.phone_number}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{car.assignedTo.email}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-950 mb-4">Reservation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Reserved Date</p>
                <p className="font-medium">{formatDate(car.created_at)}</p>
              </div>
              {car.expiration && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expiration (hours)</p>
                  <p className="font-medium">{car.expiration}</p>
                </div>
              )}
              {car.tracking_code && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tracking Code</p>
                  <p className="font-medium font-mono">{car.tracking_code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Car details retrieved from the AutoMarket system.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              For questions regarding this listing, please contact the seller directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal; 