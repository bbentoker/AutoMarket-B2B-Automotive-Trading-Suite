import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Search,
  Grid3X3,
  List,
  Clock,
  AlertCircle
} from 'lucide-react';
import CarCard from '../components/CarCard';
import apiService from '../utils/api';
import { getToken } from '../utils/auth';

// Helper function to build browse URL with token and listing ID
const browseAppUrl = import.meta.env.VITE_BROWSE_APP_URL || 'http://localhost:5175/';
const getBrowseUrlWithTokenAndListing = (listingId: number) => {
  const token = getToken();
  const baseUrl = browseAppUrl.endsWith('/') ? browseAppUrl : browseAppUrl + '/';
  const listingUrl = `${baseUrl}listings/${listingId}`;
  if (token) {
    const url = new URL(listingUrl);
    url.searchParams.set('token', token);
    return url.toString();
  }
  return listingUrl;
};

// Interface for API car data
interface ApiCarData {
  id: number;
  brand_name: string;
  model: string;
  first_registration: string;
  fuel_type: string;
  transmission_type: string;
  km_stand: number;
  listing_price: string;
  photos?: Array<{ url: string }>;
  color: string;
  created_at: string;
  expiration: number;
  features: string;
  reference_no: string;
}

// Interface for API response
interface ApiResponse {
  data: ApiCarData[];
  message?: string;
}

const SavedCars: React.FC = () => {
  const [savedCarsData, setSavedCarsData] = useState<ApiCarData[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch saved cars data
  useEffect(() => {
    const fetchSavedCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getDashboardSavedCars() as ApiResponse;
        
        if (response.data) {
          setSavedCarsData(response.data);
        } else {
          setSavedCarsData([]);
        }
      } catch (err) {
        console.error('Error fetching saved cars:', err);
        setError('Failed to load saved cars. Please try again.');
        setSavedCarsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedCars();
  }, []);

  const handleRemoveFromSaved = async (carId: number, carTitle: string) => {
    const isConfirmed = window.confirm(`Remove this car from your saved list?\n\n${carTitle}`);
    
    if (isConfirmed) {
      try {
        // Call API to unsave the car
        await apiService.unsaveCar(carId);
        
        // Remove from local state only after successful API call
        setSavedCarsData(prevCars => prevCars.filter(car => car.id !== carId));
      } catch (err) {
        console.error('Error removing car from saved:', err);
        alert('Failed to remove car from saved list. Please try again.');
      }
    }
  };

  const handleViewDetails = (carId: number) => {
    window.location.assign(getBrowseUrlWithTokenAndListing(carId));
  };

  // Filter cars based on search term
  const filteredCars = savedCarsData.filter(car => 
    car.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSaved = filteredCars.length;

  // Loading state
  if (loading) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">Loading saved cars...</h3>
            <p className="text-sm text-gray-400">Please wait while we fetch your data.</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 lg:w-12 lg:h-12 text-red-600" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">Error loading data</h3>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-950 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors"
            >
              Try Again
            </button>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 sm:space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-950">Saved Cars</h1>
                <p className="text-xs sm:text-sm text-gray-400">({totalSaved} items)</p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search saved cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto text-sm"
                />
              </div>
              {/* Hide view toggle on mobile, show only on lg and up */}
              <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-950 text-white' : 'text-gray-600'} rounded-l-lg transition-colors`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-950 text-white' : 'text-gray-600'} rounded-r-lg transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Show cars if available, otherwise show empty state */}
        {filteredCars.length > 0 ? (
          <>
            {/* Cars Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    showSaveButton={true}
                    isSaved={true}
                    onSaveToggle={handleRemoveFromSaved}
                    onViewDetails={handleViewDetails}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    showSaveButton={true}
                    isSaved={true}
                    onSaveToggle={handleRemoveFromSaved}
                    onViewDetails={handleViewDetails}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-950" />
            </div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-2">
              {searchTerm ? 'No cars found' : 'No saved cars yet'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Save cars you\'re interested in to keep track of them and get notified of price changes.'
              }
            </p>
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base"
              >
                Clear Search
              </button>
            ) : (
              <button className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base">
                Browse Cars
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default SavedCars;