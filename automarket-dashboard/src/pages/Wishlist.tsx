import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { TrendingUp, Gauge, Settings, Star, Calendar, CheckCircle2, Sparkles, BarChart3, Zap, Target, Search, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { useEffect, useState } from "react";
import apiService from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { getWishlistTranslations, formatString, translateVatText, WishlistTranslations } from "../utils/translations";

interface WishlistItem {
  wishlist_option: {
    id: number;
    user_id: number;
    listing_id: number;
    listing_vat_type: string;
    offered_price: string;
    offered_price_vat_type: string;
    currency: string;
    created_at: string;
    updated_at: string;
    has_been_clicked?: boolean;
    price_adjustment: {
      original_offered_price: number;
      adjusted_offered_price: number;
      adjustment_applied: boolean;
      vat_rate_used: string;
    };
  };
  listing: unknown;
  advert: {
    id: number;
    listingsitea_id: string;
    seller_id: number;
    seller_name: string;
    sell_time: number;
    make: string;
    model: string;
    model_version: string | null;
    first_registration: string;
    location: string;
    price: string;
    price_currency: string | null;
    body_type: string;
    type: string;
    drivetrain: string;
    seats: number;
    doors: number;
    mileage: string;
    previous_owner: string | null;
    power: string;
    gearbox: string;
    engine_size: string;
    fuel_type: string;
    fuel_consumption: string;
    co_2_emissions: string;
    color: string | null;
    paint: string;
    upholstery_color: string | null;
    upholstery: string;
    description: string | null;
    link: string | null;
    image_url: string;
    is_active: boolean;
    last_seen: string;
    created_at: string;
    original_price: number;
    adjusted_price: number;
    price_adjustment_applied: boolean;
    adjustment_reason: string;
    vat_rate_used: string;
    user_location: string;
  } | null;
}

interface WishlistData {
  user: {
    id: number;
    zoho_id: string;
    name: string;
    email: string;
    company_name: string;
    phone_number: string;
    vat_number: string;
    website: string;
    billing_street: string;
    billing_city: string;
    billing_state: string;
    billing_country: string;
    billing_code: string;
    role_id: number;
    status_id: number;
    language: string;
    country: string | null;
    listingsitea_url: string;
    listingsitea_url_add_date: string | null;
    created_at: string;
    updated_at: string;
  };
  user_location: string;
  total_items: number;
  wishlist: WishlistItem[];
}

interface CarRecommendation {
  model: string;
  year: number;
  trim: string;
  km: string;
  price: string;
  advertisedPrice: string;
  soldInDays: number;
  demand: "high" | "very-high";
  imageUrl: string;
  specs: {
    mileage: string;
    fuel: string;
    transmission: string;
    horsepower: string;
  };
  estimatedPrice: string;
}

// Convert wishlist item to CarRecommendation format
function convertWishlistItemToCarRecommendation(item: WishlistItem): CarRecommendation {
  // Add comprehensive null safety checks
  if (!item.advert) {
    throw new Error('Advert data is missing');
  }
  
  if (!item.wishlist_option) {
    throw new Error('Wishlist option data is missing');
  }
  
  // Safe date parsing with fallback
  let year = new Date().getFullYear(); // Default to current year
  try {
    if (item.advert.first_registration) {
      year = new Date(item.advert.first_registration).getFullYear();
    }
  } catch {
    console.warn('Invalid first_registration date:', item.advert.first_registration);
  }
  
  // Get currency symbols
  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case 'EUR': return '€';
      case 'CHF': return 'CHF';
      case 'USD': return '$';
      case 'GBP': return '£';
      default: return currency || 'EUR';
    }
  };
  
  const advertCurrency = getCurrencySymbol(item.advert.price_currency || 'EUR');
  const wishlistCurrency = getCurrencySymbol(item.wishlist_option.currency || 'EUR');
  
  // Safe price parsing with fallbacks
  const adjustedPrice = typeof item.advert.adjusted_price === 'number' ? item.advert.adjusted_price : 0;
  const offeredPrice = item.wishlist_option.offered_price ? parseFloat(item.wishlist_option.offered_price) : 0;
  
  return {
    model: `${item.advert.make || 'Unknown'} ${item.advert.model || 'Model'}`,
    year: year,
    trim: item.advert.model_version || "Standard",
    km: item.advert.mileage || '0 km',
    price: `${advertCurrency} ${Math.round(adjustedPrice).toLocaleString()}`,
    advertisedPrice: `${wishlistCurrency} ${Math.round(offeredPrice).toLocaleString()}`,
    soldInDays: item.advert.sell_time === 0 ? 1 : (item.advert.sell_time || 1),
    demand: Math.random() > 0.5 ? "high" : "very-high",
    imageUrl: item.advert.image_url || '',
    specs: {
      mileage: item.advert.mileage || '0 km',
      fuel: item.advert.fuel_type || 'Unknown',
      transmission: item.advert.gearbox || 'Unknown',
      horsepower: item.advert.power || '0 HP'
    },
    estimatedPrice: `${wishlistCurrency} ${Math.round(offeredPrice).toLocaleString()}`
  };
}

// Unified car specification badge
function CarSpecBadge({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 shadow-sm">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
      <span className="text-xs sm:text-sm text-gray-700">{children}</span>
    </div>
  );
}

// Demand badge component - Updated with gold for very-high, blue for high
function DemandBadge({ demand, t }: { demand: "high" | "very-high"; t: WishlistTranslations }) {
  if (demand === "very-high") {
    return (
      <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 px-2 sm:px-3 py-1 shadow-sm text-xs sm:text-sm">
        <Zap className="w-3 h-3 mr-1" />
        <span>{t.veryHighDemand}</span>
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 border border-sky-200 px-2 sm:px-3 py-1 shadow-sm text-xs sm:text-sm">
      <BarChart3 className="w-3 h-3 mr-1" />
      <span>{t.highDemand}</span>
    </Badge>
  );
}

// Car card component for customer cars only
function CarCard({ car, wishlistItem, t }: { car: CarRecommendation; wishlistItem?: WishlistItem; t: WishlistTranslations }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      {/* Car Image */}
      <div className="flex-shrink-0 w-full sm:w-32 md:w-40">
        <ImageWithFallback
          src={car.imageUrl || "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop"}
          alt={`${car.year} ${car.model} ${car.trim}`}
          className="w-full h-48 sm:h-24 md:h-30 object-cover rounded-lg shadow-sm"
        />
      </div>
      
      {/* Car Details */}
      <div className="flex-1 space-y-3 sm:space-y-4">
        {/* Car Title */}
        <h4 className="text-gray-900">
          {car.model} {car.trim}
        </h4>
        
        {/* Car Specifications */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <CarSpecBadge icon={Calendar}>{car.year}</CarSpecBadge>
          <CarSpecBadge icon={Gauge}>{car.specs?.mileage || car.km}</CarSpecBadge>
          <CarSpecBadge icon={Zap}>{car.specs?.horsepower}</CarSpecBadge>
          <CarSpecBadge icon={Settings}>{car.specs?.transmission}</CarSpecBadge>
        </div>
        
        {/* Price Display */}
        <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{t.yourAdvertisedPrice}</p>
          <p className="text-lg sm:text-xl text-gray-900">{car.price}</p>
          {wishlistItem?.wishlist_option?.offered_price_vat_type && (
            <p className="text-xs text-gray-500 mt-1">{translateVatText(wishlistItem.wishlist_option.offered_price_vat_type, t)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Section header component
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div>
        <h2 className="text-gray-900">{title}</h2>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}


// Section Divider Component - Updated with blue theme
function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4 sm:py-6">
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300"></div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300"></div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlistData, setWishlistData] = useState<WishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickedItems, setClickedItems] = useState<Set<number>>(new Set());
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());

  // Get translations based on user language - only use loaded data to prevent flash
  const t = getWishlistTranslations(wishlistData?.user?.language || 'en');

  // Initialize Hotjar tracking
  useEffect(() => {
    // Hotjar Tracking Code for Site 6513615
    const initHotjar = () => {
      interface HotjarWindow extends Window {
        hj?: {
          (...args: unknown[]): void;
          q?: unknown[][];
        };
        _hjSettings?: {
          hjid: number;
          hjsv: number;
        };
      }

      const w = window as HotjarWindow;
      w.hj = w.hj || function(...args: unknown[]) { 
        (w.hj!.q = w.hj!.q || []).push(args); 
      };
      w._hjSettings = { hjid: 6513615, hjsv: 6 };
      
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://static.hotjar.com/c/hotjar-${w._hjSettings.hjid}.js?sv=${w._hjSettings.hjsv}`;
      head.appendChild(script);
    };

    initHotjar();
  }, []);

  // Track wishlist activity when opened with login token
  useEffect(() => {
    const trackWishlistActivity = async () => {
      const params = new URLSearchParams(window.location.search);
      const loginToken = params.get('login_token');
      
      if (loginToken) {
        try {
          console.log('🔄 Tracking wishlist activity with login token:', loginToken);
          const response = await apiService.postWishlistActivity(loginToken);
          console.log('✅ Wishlist activity tracked successfully:', response);
        } catch (error) {
          console.error('❌ Error tracking wishlist activity:', error);
        }
      }
    };

    trackWishlistActivity();
  }, []); // Run once on component mount

  // Fetch wishlist data on component mount
  useEffect(() => {
    const fetchWishlistData = async () => {
      if (!user?.id) {
        console.log('⚠️ No user ID available, skipping wishlist fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Fetching wishlist data for user ID:', user.id);
        const response = await apiService.getWishlist(user.id.toString());
        console.log('📋 Wishlist API Response:', response);
        console.log('📋 Wishlist Data:', response.data);
        console.log('📋 Wishlist Message:', response.message);
        console.log('📋 Wishlist Success:', response.success);
        
        if (response.success && response.data) {
          setWishlistData(response.data as WishlistData);
        } else {
          setError('Failed to fetch wishlist data');
        }
      } catch (error) {
        console.error('❌ Error fetching wishlist data:', error);
        setError('Error fetching wishlist data');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, [user?.id]);

  // Handle wishlist click
  const handleWishlistClick = async (wishlistOptionId: number, listingId: number) => {
    if (!user?.id) {
      console.error('No user ID available for wishlist click');
      return;
    }

    // Add to loading state
    setLoadingItems(prev => new Set(prev).add(wishlistOptionId));

    try {
      console.log('🔄 Sending wishlist click:', { wishlistOptionId, listingId, userId: user.id });
      const response = await apiService.addWishlistClick(wishlistOptionId, listingId, user.id);
      console.log('✅ Wishlist click response:', response);
      
      if (response.success) {
        // Add to clicked items
        setClickedItems(prev => new Set(prev).add(wishlistOptionId));
      } else {
        console.error('❌ Wishlist click failed:', response.message);
      }
    } catch (error) {
      console.error('❌ Error sending wishlist click:', error);
    } finally {
      // Remove from loading state
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(wishlistOptionId);
        return newSet;
      });
    }
  };

  // Convert wishlist data to the format expected by the template
  const fastSellingCars = wishlistData?.wishlist
    ?.filter(item => item.advert !== null && item.advert !== undefined)
    ?.map(convertWishlistItemToCarRecommendation) || [];

  return (
    <div className="flex-1 lg:ml-[290px] min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
      <div className="p-4 lg:p-8 pt-8 lg:pt-12">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mt-8 lg:mt-8">
          {/* Header Accent - Updated to blue */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"></div>
          
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

            {/* Loading State */}
            {loading && (
              <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t.loadingFastestSelling}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Card className="border border-red-200 shadow-sm rounded-lg overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t.tryAgain}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            

            {/* Only show content when we have wishlist data loaded and no error */}
            {!loading && !error && wishlistData && (
              <>
                {/* Header - Updated badge to blue theme */}
                <div className="text-center space-y-6 sm:space-y-8 pb-4 sm:pb-6">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-200 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>{wishlistData.user.company_name}</span>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="relative">
                      <h1 className="text-gray-900 relative z-10">
                        {t.yourFastestSellingCars}
                      </h1>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-30"></div>
                    </div>
                    <div className="space-y-3 sm:space-y-4 text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                      <p>{t.hiGreeting} <span className="text-blue-600">{wishlistData.user.name}</span>,</p>
                      <p>{formatString(t.freeReportDescription, wishlistData.user.company_name)}</p>
                      <p>{t.sourcingSimilarCars}</p>
                      <p>{t.clickInterestedButton}</p>
                    </div>
                  </div>
                </div>

                <SectionDivider />

                {/* Empty State */}
                {!error && (!wishlistData.wishlist || wishlistData.wishlist.length === 0) && (
                  <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.wishlistEmpty}</h3>
                        <p className="text-gray-600">{t.startAddingCars}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Fast Selling Cars - Wishlist Items */}
                {!error && fastSellingCars.length > 0 && (
                  <div className="space-y-4 sm:space-y-6">
                    <SectionHeader 
                      icon={TrendingUp} 
                      title={t.fastestSellingCarsLastWeek} 
                      subtitle={t.opportunityToBuySimilar} 
                    />
                    
                    {fastSellingCars.map((car, index) => {
                      const wishlistItem = wishlistData?.wishlist?.[index];
                      const wishlistOptionId = wishlistItem?.wishlist_option?.id;
                      const listingId = wishlistItem?.wishlist_option?.listing_id;
                      const hasBeenClicked = (wishlistItem?.wishlist_option as WishlistItem['wishlist_option'] & { has_been_clicked?: boolean })?.has_been_clicked || false;
                      const isLoading = wishlistOptionId ? loadingItems.has(wishlistOptionId) : false;
                      const isClicked = wishlistOptionId ? (clickedItems.has(wishlistOptionId) || hasBeenClicked) : false;

                      return (
                        <Card key={index} className="border border-gray-200 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                          <CardContent className="p-0">
                            {/* Customer's Car Section - Updated with blue theme */}
                            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-gray-900 text-lg sm:text-xl truncate">
                                      {car.soldInDays === 1 ? formatString(t.soldInDay, car.soldInDays) : formatString(t.soldInDays, car.soldInDays)}
                                    </h3>
                                    <p className="text-blue-600 text-sm">{t.highDemandCarSoldQuickly}</p>
                                  </div>
                                </div>
                                {car.demand && (
                                  <div className="flex-shrink-0">
                                    <DemandBadge demand={car.demand} t={t} />
                                  </div>
                                )}
                              </div>
                              
                              <CarCard car={car} wishlistItem={wishlistItem} t={t} />
                            </div>

                            {/* Buying Section */}
                            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border-t border-blue-100">
                              <div className="p-4 sm:p-6">
                                {/* Header with Badge */}
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Search className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="mb-1">
                                      <h4 className="text-gray-900">{t.youSoldCarFast}</h4>
                                    </div>
                                  </div>
                                </div>

                                {/* Price and Features Grid */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Price Highlight */}
                                    <div className="sm:col-span-1">
                                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                        <p className="text-blue-600 text-xs mb-1">{t.priceWeCanSourceForYou}</p>
                                        <p className="text-blue-800 font-semibold text-lg">{car.estimatedPrice}</p>
                                        {wishlistItem?.wishlist_option?.offered_price_vat_type && (
                                          <p className="text-blue-600 text-xs mt-1">{translateVatText(wishlistItem.wishlist_option.offered_price_vat_type, t)}</p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Features */}
                                    <div className="sm:col-span-2">
                                      <div className="grid grid-cols-2 gap-3 h-full">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span>{t.verifiedInspectionReport}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span>{t.equipmentTrimMatched}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span>{t.fastReliableTransport}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span>{t.bestPurchasePriceGuaranteed}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* CTA Section */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-gray-700 text-sm">
                                      {isClicked 
                                        ? hasBeenClicked 
                                          ? t.alreadyReceivedInterest
                                          : t.requestReceived
                                        : t.interestedLetUsFindCar
                                      }
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <Button 
                                      onClick={() => wishlistOptionId && listingId && !hasBeenClicked && handleWishlistClick(wishlistOptionId, listingId)}
                                      disabled={isLoading || isClicked || !wishlistOptionId || !listingId}
                                      className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform w-full sm:w-auto justify-center ${
                                        isClicked 
                                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed"
                                          : isLoading
                                          ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                                          : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                                      }`}
                                    >
                                      {isLoading ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                          <span className="font-medium">{t.processing}</span>
                                        </>
                                      ) : isClicked ? (
                                        <>
                                          <CheckCircle2 className="w-4 h-4" />
                                          <span className="font-medium">{t.interestSaved}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Target className="w-4 h-4" />
                                          <span className="font-medium">{t.iAmInterested}</span>
                                          <ArrowRight className="w-4 h-4" />
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                <SectionDivider />

                {/* Smart Inventory Buying Section */}
                <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm flex-shrink-0">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-gray-900">{t.smartInventoryBuying}</h2>
                    <p className="text-gray-600 text-sm">{t.dataDrivenWayToSource}</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                  <p>{t.smartestCarsToBuy}</p>
                  <p>{t.ratherThanOfferingRandom}</p>
                  <p>{t.ourTeamReadyToHelp}</p>
                  <p>It's simple: Click "{t.iAmInterested}" and we'll take care of everything—from sourcing to delivery straight to your dealership.</p>
                  
                  {/* Simple process CTA */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                    <p className="text-gray-700 text-sm">
                      <strong>{t.simpleProcess}</strong> {t.simpleProcessDescription}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SectionDivider />

            {/* Privacy Notice */}
            <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-gray-900">{t.weRespectYourPrivacy}</h2>
                    <p className="text-gray-600 text-sm">{t.dataProtectionCommitment}</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                  <p>{t.strictlyUsePublicData}</p>
                  <p>{t.fullyCommittedToPrivacy}</p>
                </div>
              </CardContent>
            </Card>

            <SectionDivider />

            {/* Footer - Enhanced Logo Section with blue theme */}
            <div className="text-center space-y-6 pt-6 sm:pt-8">
              {/* Enhanced Logo Section */}
              <div className="space-y-4">
                {/* Separator Line */}
                <div className="flex items-center justify-center">
                  <div className="flex-1 h-px bg-gray-200 max-w-24"></div>
                  <div className="px-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 h-px bg-gray-200 max-w-24"></div>
                </div>
                
                {/* Logo Container */}
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center min-h-[80px]">
                   <img src="https://cdn.automarket.example.com/favicon-dark.png" alt="" className="w-20 sm:w-40 lg:w-auto h-20" />
                  </div>
                </div>
                
                {/* Tagline */}
                <div className="text-gray-600 text-sm">
                  <p className="italic">{t.buildingFutureAutomotive}</p>
                </div>
                
               
              </div>
              
              {/* Copyright */}
              <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                <p>{t.allRightsReserved}</p>
                <p>{t.emailSentPartnership}</p>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}