import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, ArrowRight, Gauge, Fuel, Settings, ShoppingCart, Car, Heart, FileText, Calendar, HandHeart, Check } from 'lucide-react';
import apiService from '../utils/api';
import { getToken } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

interface Photo {
  url: string;
}

interface Car {
  id: number;
  brand_name: string;
  model: string;
  first_registration: string;
  fuel_type: string;
  transmission_type: string;
  km_stand: number;
  listing_price: string;
  currency: string;
  features: string;
  deal_stage: string;
  color: string;
  seat: string;
  horsepower: string;
  created_at: string;
  photos?: Photo[];
  status_id?: number;
  amount_sold_for?: string;
  vat_or_margin?: string;
}

interface DashboardData {
  purchasedCarsCount: number;
  reservedCarsCount: number;
  offersCount: number;
  unpaidInvoicesCount: number;
  filteredListings: {
    listings: Array<{
      id: number;
      brand_name: string;
      model: string;
      first_registration: string;
      fuel_type: string;
      transmission_type: string;
      km_stand: number;
      listing_price: string;
      currency: string;
      features: string;
      status_id: number;
      created_at: string;
      remaining_time: string;
      first_photo: string;
      vat_or_margin?: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalListings: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  reservedCars: Array<Car>;
  offers: Array<{
    id: number;
    dealer_id: number;
    listing_id: number;
    offer: string;
    is_approved: boolean;
    counter_offer: string | null;
    created_at: string;
    updated_at: string;
    listing?: Car;
  }>;
  purchasedCars: Array<Car>;
}

interface ApiResponse {
  message: string;
  data: DashboardData;
}

const MainContent: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [carsToShow, setCarsToShow] = useState(3);
  const browseAppUrl = import.meta.env.VITE_BROWSE_APP_URL || 'http://localhost:5175/';
  console.log("browseAppUrl", browseAppUrl);
  console.log("MainContent - isAuthenticated:", isAuthenticated);
  // Helper function to build browse URL with token
  const getBrowseUrlWithToken = () => {
    const token = getToken();
    if (token) {
      const url = new URL(browseAppUrl);
      url.searchParams.set('token', token);

      return url.toString();
    }

    return browseAppUrl;
  };

  // Helper function to build browse URL with token and listing ID
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
  // Handle responsive car count
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // xl breakpoint is 1280px in Tailwind
      if (width >= 1280) {
        setCarsToShow(5);
      } else {
        setCarsToShow(3);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch dashboard overview on component mount
  useEffect(() => {
    console.log('📊 MainContent useEffect - isAuthenticated:', isAuthenticated);
    
    // Only fetch data if user is authenticated
    if (!isAuthenticated) {
      console.log('⏳ User not authenticated yet, skipping API call');
      setLoading(false);
      return;
    }

    const fetchDashboardOverview = async () => {
      try {
        console.log('🚀 Fetching dashboard overview...');
        const response = await apiService.getDashboardOverview() as ApiResponse;
        setDashboardData(response.data);
        console.log('✅ Dashboard overview fetched successfully');
      } catch (error) {
        console.error('Failed to fetch dashboard overview:', error);
        
        // Check if it's a 401 error and trigger logout
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          console.log('🚨 Dashboard API returned 401, triggering logout');
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardOverview();
  }, [logout, isAuthenticated]);

  const statsCards = [
    {
      icon: <ShoppingCart className="w-4 h-4 lg:w-6 lg:h-6 text-primary-950" />,
      title: "Purchased Cars",
      value: dashboardData?.purchasedCarsCount?.toString() || "0",
      subtitle: "this month",
      progress: 71,
      color: "bg-gray-100",
      path: "/purchased"
    },
    {
      icon: <Car className="w-4 h-4 lg:w-6 lg:h-6 text-primary-950" />,
      title: "Reserved Cars",
      value: dashboardData?.reservedCarsCount?.toString() || "0",
      subtitle: "this month",
      progress: 71,
      color: "bg-gray-100",
      path: "/reserved-cars"
    },
    {
      icon: <Heart className="w-4 h-4 lg:w-6 lg:h-6 text-primary-950" />,
      title: "My Offers",
      value: dashboardData?.offersCount?.toString() || "0",
      subtitle: "this month",
      progress: 71,
      color: "bg-gray-100",
      path: "/offers"
    },
    {
      icon: <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-primary-950" />,
      title: "Unpaid Invoices",
      value: dashboardData?.unpaidInvoicesCount?.toString() || "0",
      subtitle: "this month",
      progress: 71,
      color: "bg-gray-100",
      path: "/invoices"
    }
  ];



  // Helper function to format mileage
  const formatMileage = (km: number) => {
    return `${km.toLocaleString()} km`;
  };

  // Helper function to get car year from registration date
  const getCarYear = (registrationDate: string) => {
    return new Date(registrationDate).getFullYear();
  };

  // Helper function to get progress steps for a specific car
  const getProgressSteps = (carStatusId: number) => [
    { id: 4, label: "Purchased", completed: carStatusId >= 4 },
    { id: 5, label: "Proforma Invoice Sent", completed: carStatusId >= 5 },
    { id: 6, label: "Payment Received", completed: carStatusId >= 6 },
    { id: 7, label: "Payment Sent", completed: carStatusId >= 7 },
    { id: 8, label: "Documents Sent", completed: carStatusId >= 8 },
    { id: 9, label: "Transport Booked", completed: carStatusId >= 9 },
    { id: 10, label: "Car Picked Up", completed: carStatusId >= 10 },
    { id: 11, label: "Car Delivered", completed: carStatusId >= 11 },
    { id: 12, label: "Car De-registered", completed: carStatusId >= 12 },
    { id: 13, label: "Deal Done", completed: carStatusId >= 13 }
  ];

  // Helper function to calculate completion percentage
  const getCompletionPercentage = (progressSteps: Array<{id: number, label: string, completed: boolean}>) => {
    const completedSteps = progressSteps.filter(step => step.completed).length;
    const totalSteps = progressSteps.length;
    return ((completedSteps - 1) / (totalSteps - 1)) * 100; // -1 because we want the line to go between circles
  };

  const handleStatsCardClick = (path: string) => {
    navigate(path);
  };

  // Show loading state while checking authentication or fetching data
  if (loading || !isAuthenticated) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-3 sm:p-4 lg:p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-950"></div>
            <p className="mt-4 text-primary-950">
              {!isAuthenticated ? 'Authenticating...' : 'Loading dashboard...'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
      <div className="p-3 sm:p-4 lg:p-8">
        {/* Hero Section */}
        <div className="bg-primary-950 rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden z-0">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-200" fill="currentColor" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Welcome back Jetnor</h1>
            </div>
            <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-2xl">
            Smarter sourcing. Better margins. Made for dealers.
            </p>
            <button 
              onClick={() => window.location.assign(getBrowseUrlWithToken())}
              className="bg-white text-primary-950 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Explore Cars
            </button>
          </div>
          
          {/* Background Logo */}
          <div className="absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 opacity-90 pt-32">
            <img src="./AutoMarket-banner.svg" alt="" className="w-60  pr-5 pb-5 sm:pr-0 sm:w-32 lg:w-auto" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {statsCards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => handleStatsCardClick(card.path)}
              className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {card.icon}
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-950" />
              </div>
              
              <h3 className="text-primary-950 font-medium mb-1 text-xs sm:text-sm lg:text-base">{card.title}</h3>
              <div className="flex items-baseline space-x-1 sm:space-x-2 mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950">{card.value}</span>
                <span className="text-primary-950/50 text-xs lg:text-sm">{card.subtitle}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-1 sm:h-1.5">
                <div 
                  className="bg-primary-950 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${card.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Headers and Content */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
          {/* Available Cars Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-primary-950">New Available Cars for Sale</h2>
                  <p className="text-xs sm:text-sm text-gray-400">({dashboardData?.filteredListings?.pagination?.totalListings || 0} items)</p>
                </div>
              </div>
              
              {/* View All Button - Desktop only, positioned to the right */}
              <div className="hidden sm:block">
                <button 
                  onClick={() => window.location.assign(getBrowseUrlWithToken())}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
                >
                  <span>View All Cars</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {dashboardData?.filteredListings?.listings?.slice(0, carsToShow).map((car) => (
                <div 
                  key={car.id} 
                  onClick={() => window.location.assign(getBrowseUrlWithTokenAndListing(car.id))}
                  className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative">
                    <img 
                      src={car.first_photo} 
                      alt={`${car.brand_name} ${car.model}`}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <div className="text-sm font-semibold text-gray-900 min-h-6">
                      {car.brand_name} {car.model?.split(' ').length > 1 ? car.model?.split(' ')[0] : car.model} - {getCarYear(car.first_registration)}
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
                            {car.vat_or_margin}
                          </span>
                          <span className="text-base font-bold text-gray-900 h-7 pt-2 flex items-center">
                            €{parseFloat(car.listing_price).toLocaleString()}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button - Mobile only, full width */}
            <div className="flex justify-center px-4 sm:hidden">
              <button 
                onClick={() => window.location.assign(getBrowseUrlWithToken())}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
              >
                <span>View All Cars</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reserved Cars and My Offers Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Reserved Cars */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-primary-950">Reserved Cars</h2>
                    <p className="text-xs sm:text-sm text-gray-400">({dashboardData?.reservedCarsCount || 0} items)</p>
                  </div>
                </div>
                
                {/* View All Button - Desktop only */}
                <div className="hidden sm:block">
                  <button 
                    onClick={() => navigate('/reserved-cars')}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
                  >
                    <span>View All Reserved</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {dashboardData?.reservedCars && dashboardData.reservedCars.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {dashboardData.reservedCars.slice(0, 2).map((car) => (
                    <div 
                      key={car.id} 
                      onClick={() => navigate('/reserved-cars')}
                      className="bg-white rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 min-h-[120px] cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {car.photos && car.photos.length > 0 ? (
                            <img 
                              src={car.photos[0].url} 
                              alt={`${car.brand_name} ${car.model}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                                                     <div className="text-sm font-semibold text-gray-900">
                             {car.brand_name} {car.model?.split(' ').length > 1 ? car.model?.split(' ')[0] : car.model} - {getCarYear(car.first_registration)}
                           </div>
                           <p className="text-sm text-gray-400">{car.model}</p>
                          <p className="text-xs text-primary-950/50 mb-2">
                            {car.color} • {car.horsepower} • {car.seat} seats
                          </p>
                                                     <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <span className="text-sm text-gray-500">{car.vat_or_margin}</span>
                               <span className="text-sm font-bold text-gray-900">
                                 €{parseFloat(car.listing_price).toLocaleString()}
                               </span>
                             </div>
                             <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                               {car.deal_stage}
                             </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-sm border border-gray-100 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-950" />
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-2">No reserved cars yet</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
                    Cars you reserve will appear here. Start browsing our marketplace!
                  </p>
                  <button 
                    onClick={() => window.location.assign(getBrowseUrlWithToken())}
                    className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base"
                  >
                    Browse Cars
                  </button>
                </div>
              )}

              {/* View All Button - Mobile only */}
              <div className="flex justify-center px-4 sm:hidden">
                <button 
                  onClick={() => navigate('/reserved-cars')}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
                >
                  <span>View All Reserved</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* My Offers */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-primary-950">My Offers</h2>
                    <p className="text-xs sm:text-sm text-gray-400">({dashboardData?.offersCount || 0} items)</p>
                  </div>
                </div>
                
                {/* View All Button - Desktop only */}
                <div className="hidden sm:block">
                  <button 
                    onClick={() => navigate('/offers')}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
                  >
                    <span>View All Offers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {dashboardData?.offers && dashboardData.offers.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {dashboardData.offers.slice(0, 3).map((offer) => (
                    <div 
                      key={offer.id} 
                      onClick={() => navigate('/offers')}
                      className="bg-white rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 min-h-[120px] cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {offer.listing?.photos && offer.listing.photos.length > 0 ? (
                            <img 
                              src={offer.listing.photos[0].url} 
                              alt={`${offer.listing.brand_name} ${offer.listing.model}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900">
                            {offer.listing ? `${offer.listing.brand_name} ${offer.listing.model?.split(' ').length > 1 ? offer.listing.model?.split(' ')[0] : offer.listing.model} - ${getCarYear(offer.listing.first_registration)}` : `Offer #${offer.id}`}
                          </div>
                          {offer.listing && (
                            <p className="text-sm text-gray-400">{offer.listing.model}</p>
                          )}
                          <p className="text-xs text-primary-950/50 mb-2">
                            {offer.listing ? `${offer.listing.color} • ${formatMileage(offer.listing.km_stand)}` : 'Offer details'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Your Offer</span>
                              <span className="text-sm font-bold text-gray-900">
                                €{parseFloat(offer.offer).toLocaleString()}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              offer.is_approved 
                                ? 'text-green-600 bg-green-100' 
                                : offer.counter_offer 
                                ? 'text-orange-600 bg-orange-100' 
                                : 'text-blue-600 bg-blue-100'
                            }`}>
                              {offer.is_approved 
                                ? 'Approved' 
                                : offer.counter_offer 
                                ? 'Counter Offer' 
                                : 'Pending'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-sm border border-gray-100 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <HandHeart className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-950" />
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-2">No offers made yet</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
                    Make offers on cars you're interested in and track their status here.
                  </p>
                  <button 
                    onClick={() => window.location.assign(getBrowseUrlWithToken())}
                    className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base"
                  >
                    Browse Cars
                  </button>
                </div>
              )}

              {/* View All Button - Mobile only */}
              <div className="flex justify-center px-4 sm:hidden">
                <button 
                  onClick={() => navigate('/offers')}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
                >
                  <span>View All Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Deal Progress Tracking Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
                <div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-primary-950">Purchased Cars</h2>
                  <p className="text-xs sm:text-sm text-gray-400">({dashboardData?.purchasedCarsCount || 0} items)</p>
                </div>
              </div>
              
              {/* View All Button - Desktop only */}
              <div className="hidden sm:block">
                <button 
                  onClick={() => navigate('/tracker')}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
                >
                  <span>View All Purchased</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {dashboardData?.purchasedCars && dashboardData.purchasedCars.length > 0 ? (
              <div className="space-y-4 mb-4">
                {dashboardData.purchasedCars.slice(0, 2).map((car, index) => {
                  const progressSteps = getProgressSteps(car.status_id || 4);
                  const completionPercentage = getCompletionPercentage(progressSteps);
                  const completedSteps = progressSteps.filter(step => step.completed).length;
                  const totalSteps = progressSteps.length;
                  
                  return (
                  <div key={index} className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
                    <div className="flex flex-col xl:flex-row xl:items-start space-y-4 sm:space-y-6 xl:space-y-0 xl:space-x-8">
                      {/* Car Image */}
                      <div className="flex-shrink-0">
                        {car.photos && car.photos.length > 0 ? (
                          <img 
                            src={car.photos[0].url} 
                            alt={`${car.brand_name} ${car.model}`}
                            className="w-full sm:w-80 xl:w-80 h-40 sm:h-48 xl:h-60 object-cover rounded-xl lg:rounded-2xl"
                          />
                        ) : (
                          <div className="w-full sm:w-80 xl:w-80 h-40 sm:h-48 xl:h-60 bg-gray-200 rounded-xl lg:rounded-2xl flex items-center justify-center">
                            <Car className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Car Details and Progress */}
                      <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 sm:space-y-4 lg:space-y-0">
                          <div>
                            <div className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                              {car.brand_name} {car.model?.split(' ').length > 1 ? car.model?.split(' ')[0] : car.model} - {getCarYear(car.first_registration)}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{car.model}</p>
                            
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
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <span className="text-gray-400">{car.horsepower}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-left lg:text-right">
                            <p className="text-gray-400 text-xs sm:text-sm mb-1">Original Price:</p>
                            <div className="flex items-center gap-2 lg:justify-end mb-2">
                              <span className="text-base text-gray-500">{car.vat_or_margin}</span>
                              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                €{parseFloat(car.listing_price).toLocaleString()}
                              </span>
                            </div>
                            {car.amount_sold_for && (
                              <>
                                <p className="text-gray-400 text-xs sm:text-sm mb-1">Sold For:</p>
                                <div className="flex items-center gap-2 lg:justify-end">
                                  <span className="text-base text-gray-500">{car.vat_or_margin}</span>
                                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                                    €{parseFloat(car.amount_sold_for).toLocaleString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h4 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950">Status</h4>
                            <span className="text-xs sm:text-sm text-gray-400">{completedSteps}/{totalSteps} Complete</span>
                          </div>
                          
                          {/* Progress Steps - Mobile Optimized */}
                          <div className="block lg:hidden">
                            {/* Mobile: Vertical List */}
                            <div className="space-y-3">
                              {progressSteps.map((step, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    step.completed 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'bg-white border-gray-300'
                                  }`}>
                                    {step.completed && (
                                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className={`text-sm transition-colors duration-300 ${
                                    step.completed ? 'text-green-600 font-medium' : 'text-gray-400'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Desktop: Horizontal Progress */}
                          <div className="hidden lg:block relative">
                            {/* Background Progress Line */}
                            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 h-0.5 sm:h-1 bg-gray-200 rounded-full z-0">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${Math.max(0, completionPercentage)}%` }}
                              ></div>
                            </div>
                            
                            {/* Steps */}
                            <div className="flex justify-between relative z-10">
                              {progressSteps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  <div className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center mb-2 sm:mb-3 border-2 transition-all duration-300 ${
                                    step.completed 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'bg-white border-gray-300'
                                  }`}>
                                    {step.completed && (
                                      <Check className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className={`text-xs text-center max-w-8 sm:max-w-12 lg:max-w-16 leading-tight transition-colors duration-300 ${
                                    step.completed ? 'text-green-600 font-medium' : 'text-gray-400'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-sm border border-gray-100 mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-950" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-2">No purchased cars yet</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
                  Cars you purchase will appear here with their tracking status.
                </p>
                <button 
                  onClick={() => window.location.assign(getBrowseUrlWithToken())}
                  className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base"
                >
                  Browse Cars
                </button>
              </div>
            )}

            {/* View All Button - Mobile only */}
            <div className="flex justify-center px-4 sm:hidden">
              <button 
                onClick={() => navigate('/tracker')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-950 text-white rounded-xl hover:bg-primary-900 transition-colors font-medium"
              >
                <span>View All Purchased</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;