import React from 'react';
import { 
  ArrowRight, 
  Gauge, 
  Fuel, 
  Settings,
  Heart,
  Clock
} from 'lucide-react';

// Interface for car data
interface CarData {
  id: number;
  brand_name: string;
  model: string;
  first_registration: string;
  fuel_type: string;
  transmission_type: string;
  km_stand: number;
  listing_price: string;
  photos?: Array<{ url: string }>;
  remaining_time?: string;
  color?: string;
  created_at?: string;
  expiration?: number;
}

interface CarCardProps {
  car: CarData;
  showSaveButton?: boolean;
  isSaved?: boolean;
  onSaveToggle?: (carId: number, carTitle: string) => void;
  onViewDetails?: (carId: number) => void;
  viewMode?: 'grid' | 'list';
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  showSaveButton = false,
  isSaved = false,
  onSaveToggle,
  onViewDetails,
  viewMode = 'grid'
}) => {
  // Helper functions
  const formatMileage = (km: number) => {
    return `${km?.toLocaleString() || 0} km`;
  };

  const getCarYear = (registrationDate: string) => {
    return new Date(registrationDate).getFullYear();
  };

  const calculateTimeRemaining = (createdAt: string, expirationHours: number = 48) => {
    const createdDate = new Date(createdAt);
    const expirationDate = new Date(createdDate.getTime() + expirationHours * 60 * 60 * 1000);
    const now = new Date();
    const timeDiff = expirationDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Expired';
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  const getTimeRemainingColor = (timeRemaining: string) => {
    if (timeRemaining.includes('hour')) return 'text-orange-600';
    if (timeRemaining.includes('1 day')) return 'text-yellow-600';
    if (timeRemaining.includes('Expired')) return 'text-red-600';
    return 'text-green-600';
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveToggle) {
      onSaveToggle(car.id, `${car.brand_name} ${car.model}`);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(car.id);
    }
  };

  const timeRemaining = car.remaining_time || 
    (car.created_at && car.expiration ? calculateTimeRemaining(car.created_at, car.expiration) : '48 hours left');

  const carImage = car.photos?.[0]?.url || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600';
  const carTitle = `${car.brand_name} ${car.model?.split(' ').length > 1 ? car.model?.split(' ')[0] : car.model} - ${getCarYear(car.first_registration)}`;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
          <div className="flex-shrink-0">
            <img 
              src={carImage} 
              alt={carTitle}
              className="w-full sm:w-24 lg:w-32 h-20 sm:h-24 object-cover rounded-lg"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-primary-950">{carTitle}</h3>
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium mt-1 sm:mt-0 self-start">
                    Available
                  </span>
                </div>
                <p className="text-gray-500 mb-2 sm:mb-3 text-sm sm:text-base">{car.model}</p>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Gauge className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{formatMileage(car.km_stand)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Fuel className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{car.fuel_type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{car.transmission_type}</span>
                  </div>
                  <div className={`flex items-center space-x-1 font-medium ${getTimeRemainingColor(timeRemaining)}`}>
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{timeRemaining}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-left lg:text-right">
                <div className="flex items-center gap-2 lg:justify-end mb-3">
                  <span className="text-base text-gray-500">Incl. VAT</span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950">
                    €{parseFloat(car.listing_price).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  {showSaveButton && (
                    <button 
                      onClick={handleSaveToggle}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                  )}
                  <button 
                    onClick={handleViewDetails}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-950 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <div className="relative">
        <img 
          src={carImage} 
          alt={carTitle}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-accent-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-medium">
          {timeRemaining}
        </div>
        {showSaveButton && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <button 
              onClick={handleSaveToggle}
              className="w-6 h-6 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="text-sm font-semibold text-gray-900 min-h-6">
          {carTitle}
        </div>
        <p className="text-sm text-gray-400 h-8 line-clamp-2">{car.model}</p>
        
        <div className="border-t border-gray-100 pt-2 sm:pt-3 mb-2 sm:mb-3">
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
            <div className="text-center">
              <Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-1" />
              <span className="text-gray-400">{formatMileage(car.km_stand)}</span>
            </div>
            <div className="text-center">
              <Fuel className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-1" />
              <span className="text-gray-400">{car.fuel_type}</span>
            </div>
            <div className="text-center">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-1" />
              <span className="text-gray-400">{car.transmission_type}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-2 sm:pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-500 text-center h-12 pt-2 flex items-center">
                Incl. VAT
              </span>
              <span className="text-base font-bold text-gray-900 h-7 pt-2 flex items-center">
                €{parseFloat(car.listing_price).toLocaleString()}
              </span>
            </div>
            <button className="flex items-center space-x-1 text-xs sm:text-sm text-primary-950 hover:text-accent-500 transition-colors">
              <span>Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard; 