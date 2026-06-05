import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Eye
} from 'lucide-react';
import apiService from '../utils/api';
import CarDetailsModal from '../components/CarDetailsModal';

// TypeScript interfaces for the API data
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

interface ReservedCarData {
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
  assignedTo?: AssignedTo;
}

interface ApiResponse {
  message: string;
  data: ReservedCarData[];
}

const ReservedCars: React.FC = () => {
  const [reservedCars, setReservedCars] = useState<ReservedCarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<ReservedCarData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch reserved cars from API on component mount
  useEffect(() => {
    const fetchReservedCars = async () => {
      try {
        console.log('Fetching from /dashboard/reserved-cars endpoint...');
        const response = await apiService.get<ApiResponse>('/dashboard/reserved-cars');
        console.log('API Response from /dashboard/reserved-cars:', response);
        
        if (response.data && response.data && Array.isArray(response.data)) {
          setReservedCars(response.data);
        }
      } catch (error) {
        console.error('Error fetching reserved cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservedCars();
  }, []);

  const handleAutoMarket = (carId: number) => {
    const car = reservedCars.find(c => c.id === carId);
    if (car) {
      setSelectedCar(car);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };



  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to format price
  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    const symbol = currency === 'euro' ? '€' : '$';
    return `${symbol}${numPrice.toLocaleString()}`;
  };

  // Helper function to format mileage
  const formatMileage = (km: number) => {
    return `${km.toLocaleString()} km`;
  };

  // Helper function to get car year
  const getCarYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  // Helper function to get car title
  const getCarTitle = (car: ReservedCarData) => {
    return `${car.brand_name} ${car.model?.split(' ').length > 1 ? car.model?.split(' ')[0] : car.model} - ${getCarYear(car.first_registration)}`;
  };

  // Helper function to get car subtitle
  const getCarSubtitle = (car: ReservedCarData) => {
    return car.model;
  };

  const totalReserved = reservedCars.length;

  if (loading) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-3 sm:p-4 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reserved cars...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
      <div className="p-3 sm:p-4 lg:p-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-950">Reserved Cars</h1>
              <p className="text-xs sm:text-sm text-gray-400">({totalReserved} items)</p>
            </div>
          </div>
        </div>

        {/* Show cars if available, otherwise show empty state */}
        {reservedCars.length > 0 ? (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {reservedCars.map((car) => (
              <div 
                key={car.id} 
                className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => handleAutoMarket(car.id)}
              >
                <div className="flex flex-col xl:flex-row xl:items-start space-y-4 sm:space-y-6 xl:space-y-0 xl:space-x-8">
                  {/* Car Image */}
                  <div className="flex-shrink-0 relative">
                    <img 
                      src={car.photos && car.photos.length > 0 ? car.photos[0].url : '/api/placeholder/400/300'} 
                      alt={getCarTitle(car)}
                      className="w-full sm:w-80 xl:w-80 h-40 sm:h-48 xl:h-60 object-cover rounded-xl lg:rounded-2xl"
                    />
                    <div 
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 rounded-full p-1.5 sm:p-2 hover:bg-white transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutoMarket(car.id);
                      }}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary-950" />
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 sm:space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                          <h3 className="text-base sm:text-lg lg:text-xl font-medium text-primary-950 hover:text-accent-500 transition-colors">{getCarTitle(car)}</h3>
                          <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium border border-orange-200 mt-2 sm:mt-0 self-start">
                            {car.deal_stage}
                          </span>
                        </div>
                        <p className="text-primary-950/50 mb-3 sm:mb-4 text-sm sm:text-base">{getCarSubtitle(car)}</p>
                        
                        {/* Car Specs */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-8 text-xs sm:text-sm text-gray-400">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Gauge className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{formatMileage(car.km_stand)}</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Fuel className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{car.fuel_type}</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{car.transmission_type}</span>
                          </div>
                          {car.horsepower && (
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <span className="font-semibold">HP:</span>
                              <span>{car.horsepower}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-left lg:text-right">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">{car.vat_or_margin}</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950">{formatPrice(car.listing_price, car.currency)}</p>
                      </div>
                    </div>

                    {/* Reserved Details */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Reserved Date</p>
                          <p className="font-medium text-primary-950">{formatDate(car.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Dealer</p>
                          <p className="font-medium text-primary-950">{car.assignedTo?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Registration Number</p>
                          <p className="font-medium text-primary-950">{car.registration_number}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end pt-3 sm:pt-4 border-t border-gray-100 space-y-2 sm:space-y-0 sm:space-x-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAutoMarket(car.id);
                        }}
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-950" />
            </div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-2">No reserved cars yet</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
              Cars you reserve will appear here. Start browsing our marketplace!
            </p>
            {/* make this go to env VITE_BROWSE_APP_URL */}
            <button onClick={() => window.location.href = import.meta.env.VITE_BROWSE_APP_URL || 'https://browse.automarket.example.com'} className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base">
              Browse Cars
            </button>
          </div>
        )}
      </div>
      
      {/* Car Details Modal */}
      <CarDetailsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        car={selectedCar}
      />
    </main>
  );
};

export default ReservedCars;