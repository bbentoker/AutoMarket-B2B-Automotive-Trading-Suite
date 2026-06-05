import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  Eye, 
  Gauge, 
  Settings, 
  Star, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  BarChart3, 
  Zap, 
  ArrowDown, 
  Target 
} from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { getTranslations, formatString } from '../utils/translations';

interface CarRecommendation {
  model: string;
  year: number | string;
  trim?: string;
  km?: string;
  price: string | number;
  advertisedPrice?: string;
  soldInDays: number | string;
  demand?: "high" | "very-high";
  imageUrl?: string;
  specs?: {
    mileage?: string;
    fuel?: string;
    transmission?: string;
    horsepower?: string;
  };
}

interface ScrapedListing {
  make?: string;
  model?: string;
  first_registration?: string;
  sell_time?: number;
  image_url?: string;
  mileage?: string;
  km_stand?: number;
  fuel_type?: string;
  gearbox?: string;
  transmission?: string;
  transmission_type?: string;
  power?: string;
  adjusted_price?: number;
  price?: string;
}

interface OfferedListing {
  brand_name?: string;
  model?: string;
  first_registration?: string;
  image_url?: string;
  photos?: Array<{ url?: string }>;
  km_stand?: number;
  mileage?: string;
  fuel_type?: string;
  transmission_type?: string;
  gearbox?: string;
  transmission?: string;
  horsepower?: string;
  power?: string;
  adjusted_price?: number;
  listing_price?: string;
}

interface PriceComparison {
  dealer_price_adjusted?: number;
  our_price_adjusted?: number;
}

// Helpers to transform incoming API data to the template's expected shape
function getYearFromDateString(dateString?: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  const y = d.getFullYear();
  if (!Number.isNaN(y)) return String(y);
  const match = String(dateString).match(/^(\d{4})/);
  return match ? match[1] : '';
}

function formatMileage(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return `${value.toLocaleString()} km`;
  const str = String(value);
  return /km/i.test(str) ? str : `${str} km`;
}

function extractHorsePower(powerString?: string, fallback?: string): string {
  if (typeof powerString === 'string') {
    const hpMatch = powerString.match(/(\d+)\s*hp/i) || powerString.match(/\((\d+)\s*hp\)/i);
    if (hpMatch) return `${hpMatch[1]} hp`;
    return powerString;
  }
  return fallback || '';
}

function getDemandFromSellTime(sellTime?: unknown): undefined | 'high' | 'very-high' {
  const n = Number(sellTime);
  if (Number.isNaN(n)) return undefined;
  if (n <= 7) return 'very-high';
  if (n <= 21) return 'high';
  return undefined;
}

function formatCurrency(amount: unknown, isSwedish?: boolean): string {
  const num = Number(amount);
  if (Number.isNaN(num)) return '';
  
  if (isSwedish) {
    return `CHF ${Math.round(num).toLocaleString()}`;
  }
  
  return `€${Math.round(num).toLocaleString()}`;
}

// Note: template fallback removed in favor of API data only

// Unified car specification badge
function CarSpecBadge({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 shadow-sm">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
      <span className="text-xs sm:text-sm text-gray-700">{children}</span>
    </div>
  );
}

// Demand badge component - Updated with blue theme for "high" demand
function DemandBadge({ demand, t }: { demand: "high" | "very-high"; t: ReturnType<typeof getTranslations> }) {
  if (demand === "very-high") {
    return (
      <Badge className="bg-gradient-to-r from-pink-100 to-red-100 text-pink-800 border border-pink-200 px-2 sm:px-3 py-1 shadow-sm text-xs sm:text-sm">
        <Zap className="w-3 h-3 mr-1" />
        <span>{t.veryHighDemand}</span>
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 px-2 sm:px-3 py-1 shadow-sm text-xs sm:text-sm">
      <BarChart3 className="w-3 h-3 mr-1" />
      <span>{t.highDemand}</span>
    </Badge>
  );
}

// Unified car card component for both customer and recommendation cars
function CarCard({ 
  car, 
  type, 
  showButton = false,
  listingId,
  t
}: { 
  car: CarRecommendation; 
  type: 'customer' | 'recommendation';
  showButton?: boolean;
  listingId?: number;
  t: ReturnType<typeof getTranslations>;
}) {
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
        
        {/* Bottom Row - Button and Price */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Left Side - Button for recommendation type only */}
          <div className="order-2 sm:order-1">
            {type === 'recommendation' && showButton ? (
              <Button 
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                onClick={() => {
                  if (listingId) {
                    let browseUrl = import.meta.env.VITE_BROWSE_URL || 'https://browse.automarket.example.com';
                    
                    // Ensure the URL has a protocol
                    if (!browseUrl.startsWith('http://') && !browseUrl.startsWith('https://')) {
                      browseUrl = 'https://' + browseUrl;
                    }
                    
                    const url = `${browseUrl}/listings/${listingId}`;
                    window.open(url, '_blank');
                  }
                }}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">{t.viewOurOffer}</span>
                <span className="sm:hidden">{t.viewOffer}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
          
          {/* Right Side - Price */}
          <div className="order-1 sm:order-2 bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg shadow-sm text-center sm:text-right">
            <p className="text-xs text-gray-500 mb-1">
              {type === 'customer' ? t.advertised_price_excl_vat : t.price_excl_vat}
            </p>
            <p className="text-lg sm:text-xl text-gray-900">
              {type === 'customer' ? car.advertisedPrice : car.price}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section header component
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
      <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow-sm flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div>
        <h2 className="text-gray-900">{title}</h2>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

// Section Divider Component
function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4 sm:py-6">
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300"></div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-80"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-80"></div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300"></div>
      </div>
    </div>
  );
}

export interface WeeklyReportData {
  userName?: string;
  companyName?: string;
  userLanguage?: string;
  percentage?: number;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    company_name?: string;
    language?: string;
    isSwedish?: boolean;
  };
  suggestions?: Array<{
    suggestioned_listing?: {
      id?: number;
      model?: string;
      brand_name?: string;
      fuel_type?: string;
      transmission_type?: string;
      km_stand?: number;
      horsepower?: string;
      image_url?: string;
      adjusted_price?: number;
      original_price?: string;
      vat_status?: string;
      first_registration?: string;
    };
    scraped_listing?: {
      id?: number;
      model?: string;
      make?: string;
      mileage?: string;
      fuel_type?: string;
      transmission?: string;
      power?: string;
      image_url?: string;
      price?: string;
      original_price?: string;
      vat_status?: string;
      first_registration?: string;
    };
    price_comparison?: {
      price_difference?: number;
      price_difference_percentage?: number;
      our_price_adjusted?: number;
      dealer_price_adjusted?: number;
    };
  }>;
  detailedReport?: {
    generatedAt?: string;
    salesPerformanceOverview?: Array<{
      dealerName?: string;
      metrics?: {
        carsSold?: {
          metric?: string;
          currentWeek?: number;
          prevWeek?: number;
          change?: number;
          changeType?: 'increase' | 'decrease' | 'equal' | string;
        }
      };
      topFastestCars?: Array<{
        id?: number;
        model?: string;
        make?: string;
        price?: string;
        power?: string;
        first_registration?: string;
        mileage?: string;
        fuel_type?: string;
        transmission?: string;
        main_photo?: string;
      }>;
    }>;
  };
}

export function WeeklyReport({ weeklyData }: { weeklyData?: WeeklyReportData }) {
  const t = getTranslations(weeklyData?.userLanguage || 'en');
  const suggestions = weeklyData?.suggestions ?? [];
  const isSwedish = weeklyData?.user?.isSwedish;
  
  // Build the exact two-card (sold + similar offer) pairs
  const mappedPairs: { customerCar: CarRecommendation; recommendationCar: CarRecommendation }[] = (suggestions || []).map((sugg) => {
    const scraped: ScrapedListing = sugg.scraped_listing || {};
    const offered: OfferedListing = sugg.suggestioned_listing || {};
    const comparison: PriceComparison = sugg.price_comparison || {};

    const scrapedModel = [scraped.make, scraped.model].filter(Boolean).join(' ') || scraped.model || '';
    const offeredModel = [offered.brand_name, offered.model].filter(Boolean).join(' ') || offered.model || '';

    const customerCar: CarRecommendation = {
      model: scrapedModel,
      year: getYearFromDateString(scraped.first_registration),
      price: formatCurrency(comparison.dealer_price_adjusted ?? scraped.adjusted_price ?? scraped.price, isSwedish),
      advertisedPrice: formatCurrency(comparison.dealer_price_adjusted ?? scraped.adjusted_price ?? scraped.price, isSwedish),
      soldInDays: Math.max(Number(scraped.sell_time ?? 1), 1),
      imageUrl: scraped.image_url,
      demand: getDemandFromSellTime(scraped.sell_time),
      specs: {
        mileage: scraped.mileage || formatMileage(scraped.km_stand),
        fuel: scraped.fuel_type,
        transmission: scraped.gearbox || scraped.transmission || scraped.transmission_type,
        horsepower: extractHorsePower(scraped.power, ''),
      },
    };

    const recommendationCar: CarRecommendation = {
      model: offeredModel,
      year: getYearFromDateString(offered.first_registration),
      price: formatCurrency(comparison.our_price_adjusted ?? offered.adjusted_price ?? offered.listing_price, false),
      soldInDays: customerCar.soldInDays,
      imageUrl: offered.image_url || (offered.photos && offered.photos[0]?.url) || scraped.image_url,
      demand: customerCar.demand,
      specs: {
        mileage: formatMileage(offered.km_stand ?? offered.mileage),
        fuel: offered.fuel_type,
        transmission: offered.transmission_type || offered.gearbox || offered.transmission,
        horsepower: offered.horsepower || extractHorsePower(offered.power, ''),
      },
    };

    return { customerCar, recommendationCar };
  });
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header Accent */}
      <div className="h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-600"></div>
      
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 sm:space-y-8 pb-4 sm:pb-6">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-50 to-red-50 text-pink-700 rounded-full border border-pink-200 shadow-sm">
            <Sparkles className="w-4 h-4" />
            {/* shoul be company name */}
            <span>{weeklyData?.companyName}</span>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <h1 className="text-gray-900 relative z-10">
                {t.weeklyDealerReport}
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-30"></div>
            </div>
            <div className="space-y-3 sm:space-y-4 text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              <p>{t.hiGreeting} <span className="text-pink-600">{weeklyData?.userName}</span>,</p>
              <p>{t.performanceReportDescription}</p>
              <p>{t.insightsDescription}</p>
            </div>
          </div>
        </div>

     
        <SectionDivider />

        {/* Fast Selling Cars */}
        <div className="space-y-4 sm:space-y-6">
          <SectionHeader 
            icon={TrendingUp} 
            title={t.fastestSellingCarsTitle} 
            subtitle={t.exclusiveOffersSubtitle} 
          />
          
          {(mappedPairs.length ? mappedPairs : []).map(({ customerCar, recommendationCar }, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-0">
                {/* Customer's Car Section */}
                <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 text-lg sm:text-xl truncate">{formatString(t.soldInDays, customerCar.soldInDays)}</h3>
                        <p className="text-pink-600 text-sm">{t.highDemandCar}</p>
                      </div>
                    </div>
                    {customerCar.demand && (
                      <div className="flex-shrink-0">
                        <DemandBadge demand={customerCar.demand} t={t} />
                      </div>
                    )}
                  </div>
                  
                  <CarCard car={customerCar} type="customer" t={t} />
                </div>

                {/* Connection Arrow */}
                <div className="relative h-12 bg-gray-50 flex items-center justify-center">
                  <div className="absolute right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2">
                    <div className="bg-white rounded-full p-2 shadow-sm border border-pink-200">
                      <ArrowDown className="w-4 h-4 text-pink-600" />
                    </div>
                  </div>
                  <div className="absolute left-4 sm:left-6 bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm border border-pink-200">
                    <span className="text-xs text-pink-600">{t.basedOnSuccessfulSale}</span>
                  </div>
                </div>

                {/* Recommendation Section */}
                <div className="bg-gradient-to-br from-pink-50 to-red-50">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-red-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 truncate">{t.yourCarSoldQuickly}</h3>
                          <p className="text-pink-600 text-sm">{t.similarCarSourced}</p>
                        </div>
                      </div>
                    </div>
                    
                    <CarCard car={recommendationCar} type="recommendation" showButton={true} listingId={suggestions[index]?.suggestioned_listing?.id} t={t} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <SectionDivider />

        {/* Market Information */}
        <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <SectionHeader 
              icon={Star} 
              title={t.inventorySourcedTitle} 
              subtitle={t.dataDrivenSubtitle} 
            />
            
            <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
              <p>
                {t.dataDrivenApproach}
              </p>
              <p>
                {t.recommendationsBasedOn}
              </p>
              <p>
                {t.analyzingData}
              </p>
              <p className="text-pink-700">
                {t.buyingRightCars}
              </p>
            </div>
          </CardContent>
        </Card>

        <SectionDivider />

        {/* Privacy Notice */}
        <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow-sm flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900">{t.respectPrivacyTitle}</h2>
                <p className="text-gray-600 text-sm">{t.dataProtectionSubtitle}</p>
              </div>
            </div>
            
            <div className="text-gray-600 text-xs sm:text-sm space-y-3 leading-relaxed">
              <p>
                {t.publicDataOnly}
              </p>
              <p>
                {t.privacyCommitment}
              </p>
            </div>
          </CardContent>
        </Card>

        <SectionDivider />

        {/* Footer */}
        <div className="text-center space-y-6 pt-6 sm:pt-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="">
                <div className="text-2xl font-bold text-gray-800">
                  <img src="/AutoMarket-logo-dark.svg" alt="" className="w-60  pr-5 pb-5 sm:pr-0 sm:w-32 lg:w-auto" />
                </div>
              </div>
            </div>
            
            <div className="text-gray-600 text-sm">
              <p className="italic">{t.buildingFuture}</p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
            <p>{t.allRightsReserved}</p>
            <p>{t.partnershipProgram}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
