import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ArrowRight, 
  Gauge, 
  Fuel, 
  Settings, 
  Clock,
  XCircle,
  Euro
} from 'lucide-react';
import apiService from '../utils/api';

// Define interfaces for the API data
interface ApiPhoto {
  url: string;
}

interface ApiListing {
  id: number;
  brand_name: string;
  model: string;
  horsepower: string;
  km_stand: number;
  fuel_type: string;
  transmission_type: string;
  listing_price: string;
  currency: string;
  color: string;
  features: string;
  photos: ApiPhoto[];
}

interface ApiOffer {
  id: number;
  dealer_id: number;
  listing_id: number;
  offer: string;
  is_approved: boolean;
  counter_offer: string | null;
  created_at: string;
  updated_at: string;
  listing: ApiListing;
}

interface ApiResponse {
  message: string;
  data: ApiOffer[];
}

// Define interface for transformed offer data
interface TransformedOffer {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  mileage: string;
  fuel: string;
  transmission: string;
  askingPrice: string;
  offerPrice: string;
  offerDate: string;
  expiryDate: string;
  location: string;
  dealer: string;
  dealerEmail: string;
  status: string;
  timeLeft: string;
  urgencyLevel: number;
  dealerResponse: {
    type: string;
    counterPrice?: string;
    message: string;
  } | null;
}

const MyOffers: React.FC = () => {
  const [offers, setOffers] = useState<TransformedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOfferId, setProcessingOfferId] = useState<number | null>(null);

  // Transform API data to component format
  const transformApiData = (apiOffers: ApiOffer[]): TransformedOffer[] => {
    return apiOffers.map((apiOffer) => {
      const listing = apiOffer.listing;
      
      // Determine status based on API fields
      let status = 'Pending';
      let dealerResponse = null;
      let timeLeft = '7 days left'; // Default value
      
      console.log('Processing offer:', {
        id: apiOffer.id,
        is_approved: apiOffer.is_approved,
        counter_offer: apiOffer.counter_offer,
        offer: apiOffer.offer
      });
      
      if (apiOffer.is_approved) {
        status = 'Accepted';
        console.log('Setting status to Accepted for offer', apiOffer.id);
      } else if (apiOffer.counter_offer && apiOffer.counter_offer !== null && apiOffer.counter_offer !== '') {
        status = 'Counter Offer';
        dealerResponse = {
          type: 'counter_offer',
          counterPrice: `€${parseFloat(apiOffer.counter_offer).toLocaleString('en-US')}`,
          message: 'The dealer has made a counter offer. Would you like to accept it?'
        };
        timeLeft = 'Counter offer received';
        console.log('Setting status to Counter Offer for offer', apiOffer.id, 'with counter offer:', apiOffer.counter_offer);
      }

      return {
        id: apiOffer.id,
        image: listing.photos && listing.photos.length > 0 
          ? listing.photos[0].url 
          : "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600",
        title: `${listing.brand_name} ${listing.model}`,
        subtitle: listing.horsepower || `${listing.fuel_type} • ${listing.transmission_type}`,
        mileage: `${listing.km_stand.toLocaleString('en-US')} km`,
        fuel: listing.fuel_type,
        transmission: listing.transmission_type,
        askingPrice: `€${parseFloat(listing.listing_price).toLocaleString('en-US')}`,
        offerPrice: `€${parseFloat(apiOffer.offer).toLocaleString('en-US')}`,
        offerDate: new Date(apiOffer.created_at).toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        location: "Location not specified",
        dealer: "Dealer",
        dealerEmail: "dealer@example.com",
        status,
        timeLeft,
        urgencyLevel: status === 'Counter Offer' ? 1 : status === 'Pending' ? 2 : status === 'Accepted' ? 3 : 4,
        dealerResponse
      };
    });
  };

  // Fetch offers data
  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch offers from dashboard endpoint
      const response = await apiService.getDashboardOffers() as ApiResponse;
      
      if (response.data && response.data) {
        const transformedOffers = transformApiData(response.data);
        // Sort by urgency level (1 = most urgent)
        const sortedOffers = transformedOffers.sort((a, b) => a.urgencyLevel - b.urgencyLevel);
        setOffers(sortedOffers);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      setError('Failed to load offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Counter Offer':
        return 'bg-blue-100 text-blue-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const processOffer = async (offerId: number, action: 'accept' | 'decline') => {
    try {
      setProcessingOfferId(offerId);
      const response = await apiService.processOffer(offerId, action);
      console.log('Offer processed successfully:', response);
      
      // Refresh the offers data after processing
      await fetchOffers();
      
      // Show success message
      const actionText = action === 'accept' ? 'accepted' : 'declined';
      alert(`Counter offer ${actionText} successfully!${action === 'accept' ? ' Car moved to Purchased Cars.' : ''}`);
    } catch (error) {
      console.error('Error processing offer:', error);
      alert('Failed to process offer. Please try again.');
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleAcceptCounterOffer = async (offerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Accepting counter offer for offer ID: ${offerId}`);
    await processOffer(offerId, 'accept');
  };

  const handleDeclineCounterOffer = async (offerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Declining counter offer for offer ID: ${offerId}`);
    await processOffer(offerId, 'decline');
  };

  const totalOffers = offers.length;
  const pendingOffers = offers.filter(offer => offer.status === 'Pending').length;
  const counterOffers = offers.filter(offer => offer.status === 'Counter Offer').length;
  const totalValue = offers.reduce((sum, offer) => sum + parseFloat(offer.offerPrice.replace('€', '').replace(/,/g, '')), 0);

  // Loading state
  if (loading) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-3 sm:p-4 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-950 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your offers...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-3 sm:p-4 lg:p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Offers</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchOffers}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-950">My Offers</h1>
              <p className="text-xs sm:text-sm text-gray-400">Track your offers and negotiate with dealers</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">{totalOffers}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Total Offers</p>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">{pendingOffers}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Pending</p>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">{counterOffers}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Counter Offers</p>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Euro className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">€{totalValue.toLocaleString('en-US')}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Total Offered</p>
          </div>
        </div>

        {/* Offers List */}
        <div className="space-y-4 sm:space-y-6">
          {offers.map((offer) => {
            return (
              <div key={offer.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Car Image */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <img 
                        src={offer.image} 
                        alt={offer.title}
                        className="w-full sm:w-80 h-48 sm:h-56 object-cover rounded-lg sm:rounded-xl"
                      />
                    </div>

                    {/* Car Details */}
                    <div className="flex-1 flex flex-col">
                      {/* Header with title and status */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{offer.title}</h3>
                          <p className="text-gray-600 text-base sm:text-lg mb-3 sm:mb-4">{offer.subtitle}</p>
                          
                          {/* Car Specs */}
                          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Gauge className="w-4 h-4" />
                              <span>{offer.mileage}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Fuel className="w-4 h-4" />
                              <span>{offer.fuel}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Settings className="w-4 h-4" />
                              <span>{offer.transmission}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center justify-start sm:justify-end">
                          {offer.status === 'Counter Offer' && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                              {offer.status}
                            </span>
                          )}
                          {offer.status === 'Pending' && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                              {offer.status}
                            </span>
                          )}
                          {offer.status === 'Accepted' && (
                            <button className="px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center space-x-2 text-sm sm:text-base">
                              <span>Purchased</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Spacer to push pricing to bottom - only on larger screens */}
                      <div className="hidden sm:flex sm:flex-1"></div>

                      {/* Price Information */}
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-8">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Your Offer</p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                              <p className="text-xl sm:text-2xl font-bold text-gray-900">{offer.offerPrice}</p>
                              {(() => {
                                const askingPriceNum = parseFloat(offer.askingPrice.replace('€', '').replace(/,/g, ''));
                                const offerPriceNum = parseFloat(offer.offerPrice.replace('€', '').replace(/,/g, ''));
                                const difference = askingPriceNum - offerPriceNum;
                                if (difference > 0) {
                                  return (
                                    <span className="text-green-600 text-sm font-medium">
                                      ↓ €{difference.toLocaleString('en-US')} off
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                          
                          <div className="sm:hidden">
                            <p className="text-xs text-gray-500 mb-1">Asking Price</p>
                            <p className="text-xl font-bold text-gray-900">{offer.askingPrice}</p>
                          </div>
                        </div>

                        <div className="hidden sm:block text-right">
                          <p className="text-xs text-gray-500 mb-1">Asking Price</p>
                          <p className="text-2xl font-bold text-gray-900">{offer.askingPrice}</p>
                        </div>
                      </div>

                      {/* Counter Offer Details */}
                      {offer.dealerResponse && offer.dealerResponse.type === 'counter_offer' && (
                        <div className="mt-4">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-4 h-4 text-blue-600"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                              <p className="text-sm text-blue-800 font-medium">Counter Offer Received</p>
                            </div>
                            <div className="mb-2">
                              <p className="text-xl sm:text-2xl font-bold text-blue-900">{offer.dealerResponse.counterPrice}</p>
                            </div>
                            <p className="text-sm text-blue-700">
                              We've spoken with the seller — the lowest price they're willing to accept is {offer.dealerResponse.counterPrice}.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-3">
                            <button 
                              onClick={(e) => handleDeclineCounterOffer(offer.id, e)}
                              disabled={processingOfferId === offer.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span>✗</span>
                              <span>{processingOfferId === offer.id ? 'Processing...' : 'Decline'}</span>
                            </button>
                            <button 
                              onClick={(e) => handleAcceptCounterOffer(offer.id, e)}
                              disabled={processingOfferId === offer.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span>✓</span>
                              <span>{processingOfferId === offer.id ? 'Processing...' : 'Accept'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State (if no offers) */}
        {offers.length === 0 && (
          <div className="bg-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-950" />
            </div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-2">No offers made yet</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
              Make offers on cars you're interested in and track their status here.
            </p>
            <button className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base">
              Browse Cars
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOffers;