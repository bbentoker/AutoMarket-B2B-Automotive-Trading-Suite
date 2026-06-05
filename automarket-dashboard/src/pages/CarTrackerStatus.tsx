import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Fuel, 
  Settings, 
  Check,
  Truck,
  FileText,
  Calendar,
  Hash,
  Eye,
  Download,
  ExternalLink,
  Clock,
  AlertCircle
} from 'lucide-react';
import RegDocTrackingModal from '../components/RegDocTrackingModal';
import InvoiceModal from '../components/InvoiceModal';
import CarDetailsModal from '../components/CarDetailsModal';
import apiService from '../utils/api';

// Interface for API car data
interface ApiCarData {
  id: number;
  brand_name: string;
  model: string;
  km_stand: number;
  fuel_type: string;
  transmission_type: string;
  vin_number: string;
  listing_price: string;
  created_at: string;
  deal_stage: string;
  features: string;
  photos: Array<{ url: string }>;
  color: string;
  reference_no: string;
  first_registration: string;
  status_id: number;
  tracking_code?: string;
  invoices: Array<{
    id: number;
    dealer_id: number;
    amount: string;
    currency: string;
    is_paid: boolean;
    paid_at: string | null;
    invoice_number: string;
    description: string;
    due_date: string;
    listing_id: number;
    created_at: string;
    updated_at: string;
  }>;
}

// Interface for API response
interface ApiResponse {
  data: ApiCarData[];
  message?: string;
}

// Interface for progress step
interface ProgressStep {
  id: number;
  label: string;
  completed: boolean;
}

// Interface for document
interface Document {
  name: string;
  type: 'download' | 'show' | 'view';
  available: boolean;
}

// Interface for processed car data
interface ProcessedCarData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  mileage: string;
  fuel: string;
  transmission: string;
  vinNumber: string;
  price: string;
  purchaseDate: string;
  location: string;
  dealer: string;
  trackingCode: string;
  documents: Document[];
  progressSteps: ProgressStep[];
  invoices: Array<{
    id: number;
    dealer_id: number;
    amount: string;
    currency: string;
    is_paid: boolean;
    paid_at: string | null;
    invoice_number: string;
    description: string;
    due_date: string;
    listing_id: number;
    created_at: string;
    updated_at: string;
  }>;
}

const CarTrackerStatus: React.FC = () => {
  const [selectedTrackingCar, setSelectedTrackingCar] = useState<ProcessedCarData | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ProcessedCarData['invoices'][0] | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedCarForInvoice, setSelectedCarForInvoice] = useState<ProcessedCarData | null>(null);
  const [purchasedCars, setPurchasedCars] = useState<ProcessedCarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCarDetailsModalOpen, setIsCarDetailsModalOpen] = useState(false);
  const [selectedCarForDetails, setSelectedCarForDetails] = useState<ApiCarData | null>(null);
  const [originalApiCars, setOriginalApiCars] = useState<ApiCarData[]>([]);

  // Progress steps logic from MainContent
  const getProgressSteps = (carStatusId: number): ProgressStep[] => [
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

  // Map API data to component format
  const mapApiDataToComponentFormat = (apiCars: ApiCarData[]): ProcessedCarData[] => {
    return apiCars.map((car) => {
      // Extract first feature for subtitle
      const subtitle = car.features ? 
        car.features.split(',')[0].substring(0, 50) + (car.features.length > 50 ? '...' : '') :
        `${car.color} • Ref: ${car.reference_no}`;

      // Format purchase date
      const purchaseDate = new Date(car.created_at).toISOString().split('T')[0];

      // Get the latest invoice by created_at date instead of summing all invoices
      let latestInvoiceAmount = 0;
      if (car.invoices && car.invoices.length > 0) {
        const latestInvoice = car.invoices.reduce((latest, current) => {
          const latestDate = new Date(latest.created_at);
          const currentDate = new Date(current.created_at);
          return currentDate > latestDate ? current : latest;
        });
        latestInvoiceAmount = parseFloat(latestInvoice.amount || '0');
      } else {
        // Fallback to listing price if no invoices
        latestInvoiceAmount = parseFloat(car.listing_price || '0');
      }

      // Generate documents based on status
      const documents: Document[] = [
        { 
          name: "Invoice", 
          type: "download", 
          available: car.status_id >= 5 && car.invoices && car.invoices.length > 0 // Available after proforma invoice sent and invoice exists
        },
        { 
          name: "R.Doc Tracking Code", 
          type: "show", 
          available: car.status_id >= 8 && Boolean(car.tracking_code) // Available after documents sent
        },
        { 
          name: "View Listing", 
          type: "view", 
          available: true // Always available
        }
      ];

      return {
        id: car.id,
        image: car.photos?.[0]?.url || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600',
        title: `${car.brand_name} ${car.model}`,
        subtitle,
        mileage: `${car.km_stand?.toLocaleString() || 0} km`,
        fuel: car.fuel_type || 'Unknown',
        transmission: car.transmission_type || 'Unknown',
        vinNumber: car.vin_number || 'N/A',
        price: `€${latestInvoiceAmount.toLocaleString()}`,
        purchaseDate,
        location: 'Europe',
        dealer: 'AutoMarket Partner',
        trackingCode: car.tracking_code || `TRK${car.id}${Date.now().toString().slice(-6)}`,
        documents,
        progressSteps: getProgressSteps(car.status_id),
        invoices: car.invoices || []
      };
    });
  };

  // Fetch purchased cars data
  useEffect(() => {
    const fetchPurchasedCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getTrackPurchasedCars() as ApiResponse;
        
        if (response.data && response.data.length > 0) {
          const apiCars = response.data;
          setOriginalApiCars(apiCars); // Store original API data
          const processedCars = mapApiDataToComponentFormat(apiCars);
          setPurchasedCars(processedCars);
        } else {
          setPurchasedCars([]);
        }
      } catch (err) {
        console.error('Error fetching purchased cars:', err);
        setError('Failed to load purchased cars. Please try again.');
        setPurchasedCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCars();
  }, []);

  const calculateProgress = (steps: ProgressStep[]) => {
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    return ((completedSteps - 1) / (totalSteps - 1)) * 100;
  };

  const getCompletedSteps = (steps: ProgressStep[]) => {
    return steps.filter(step => step.completed).length;
  };

  const handleAutoMarket = (carId: number) => {
    console.log(`Viewing car details for car ID: ${carId}`);
  };

  const handleDocumentAction = (docName: string, type: string, available: boolean, car?: ProcessedCarData) => {
    if (!available) return;
    
    if (type === 'download') {
      if (docName === 'Invoice' && car && car.invoices.length > 0) {
        // Find the latest invoice by created_at date
        const latestInvoice = car.invoices.reduce((latest, current) => {
          const latestDate = new Date(latest.created_at);
          const currentDate = new Date(current.created_at);
          return currentDate > latestDate ? current : latest;
        });
        setSelectedInvoice(latestInvoice);
        setSelectedCarForInvoice(car);
        setIsInvoiceModalOpen(true);
      } else {
        console.log(`Downloading ${docName}`);
        // Implement other download logic
      }
    } else if (type === 'show') {
      console.log(`Showing ${docName} for car:`, car);
      // Open the tracking modal
      setSelectedTrackingCar(car || null);
      setIsTrackingModalOpen(true);
    } else if (type === 'view') {
      console.log(`Viewing ${docName}`);
      // Open the car details modal
      const foundCar = car?.id ? originalApiCars.find(apiCar => apiCar.id === car.id) : null;
      setSelectedCarForDetails(foundCar || null);
      setIsCarDetailsModalOpen(true);
    }
  };

  const totalPurchased = purchasedCars.length;
  const totalValue = purchasedCars.reduce((sum, car) => sum + parseFloat(car.price.replace('€', '').replace(',', '')), 0);
  const completedDeals = purchasedCars.filter(car => car.progressSteps.every(step => step.completed)).length;
  const inProgress = totalPurchased - completedDeals;

  // Loading state
  if (loading) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">Loading car tracker...</h3>
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
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-1 sm:w-1.5 h-10 sm:h-14 bg-primary-950 rounded-full"></div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-950">Car Tracker Status</h1>
              <p className="text-xs sm:text-sm text-gray-400">Track your purchased vehicles and delivery progress</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">{totalPurchased}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Total Purchased</p>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">{inProgress}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">In Progress</p>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">{completedDeals}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Completed</p>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950 mb-1">€{totalValue.toLocaleString()}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Total Value</p>
          </div>
        </div>

        {/* Purchased Cars List */}
        {purchasedCars.length > 0 ? (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {purchasedCars.map((car) => (
              <div key={car.id} className="bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleAutoMarket(car.id)}>
                <div className="flex flex-col xl:flex-row xl:items-start space-y-4 sm:space-y-6 xl:space-y-0 xl:space-x-8">
                  {/* Car Image */}
                  <div className="flex-shrink-0 relative">
                    <img 
                      src={car.image} 
                      alt={car.title}
                      className="w-full sm:w-80 xl:w-80 h-40 sm:h-48 xl:h-60 object-cover rounded-xl lg:rounded-2xl"
                    />
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 rounded-full p-1.5 sm:p-2 hover:bg-white transition-colors">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary-950" />
                    </div>
                  </div>

                  {/* Car Details and Progress */}
                  <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 sm:space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg lg:text-xl font-medium text-primary-950 hover:text-accent-500 transition-colors">{car.title}</h3>
                        <p className="text-primary-950/50 mb-3 sm:mb-4 text-sm sm:text-base">{car.subtitle}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-8 text-xs sm:text-sm text-gray-400">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Gauge className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{car.mileage}</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Fuel className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{car.fuel}</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-mono text-xs">{car.vinNumber}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left lg:text-right">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Price: {car.price}</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-950">{car.price}</p>
                        <p className="text-gray-400 text-xs mt-1">Purchased: {new Date(car.purchaseDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div>
                      <h4 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-3 sm:mb-4">Documents</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                        {car.documents.map((doc, index) => (
                          <div 
                            key={index} 
                            className={`bg-gray-50 rounded-lg p-3 sm:p-4 transition-colors ${
                              doc.available 
                                ? 'cursor-pointer hover:bg-gray-100' 
                                : ''
                            }`}
                            onClick={doc.available ? (e) => {
                              e.stopPropagation();
                              handleDocumentAction(doc.name, doc.type, doc.available, car);
                            } : undefined}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                                <span className="text-xs sm:text-sm font-medium text-primary-950">{doc.name}</span>
                              </div>
                              {doc.available ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDocumentAction(doc.name, doc.type, doc.available, car);
                                  }}
                                  className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    doc.type === 'download' 
                                      ? 'text-green-600 hover:bg-green-50' 
                                      : doc.type === 'view'
                                      ? 'text-purple-600 hover:bg-purple-50'
                                      : 'text-blue-600 hover:bg-blue-50'
                                  }`}
                                >
                                  {doc.type === 'download' ? (
                                    <>
                                      <Download className="w-2 h-2 sm:w-3 sm:h-3" />
                                      <span className="hidden sm:inline">Download</span>
                                    </>
                                  ) : doc.type === 'view' ? (
                                    <>
                                      <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                                      <span className="hidden sm:inline">View</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-2 h-2 sm:w-3 sm:h-3" />
                                      <span className="hidden sm:inline">Show</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">Not Available</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h4 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950">Status</h4>
                        <span className="text-xs sm:text-sm text-gray-400">
                          {getCompletedSteps(car.progressSteps)}/{car.progressSteps.length} Complete
                        </span>
                      </div>
                      
                      {/* Mobile: Vertical List */}
                      <div className="block lg:hidden">
                        <div className="space-y-3">
                          {car.progressSteps.map((step, index) => (
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
                            style={{ width: `${Math.max(0, calculateProgress(car.progressSteps))}%` }}
                          ></div>
                        </div>
                        
                        {/* Steps */}
                        <div className="flex justify-between relative z-10">
                          {car.progressSteps.map((step, index) => (
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
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-primary-950" />
            </div>
            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary-950 mb-2">No purchased cars yet</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
              Cars you purchase will appear here with delivery tracking.
            </p>
            <button className="bg-primary-950 text-white px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors text-sm sm:text-base">
              Browse Cars
            </button>
          </div>
        )}
      </div>

      {/* Reg Doc Tracking Modal */}
      <RegDocTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        trackingCode={selectedTrackingCar?.trackingCode || ''}
        carTitle={selectedTrackingCar?.title || ''}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
        carTitle={selectedCarForInvoice?.title || ''}
        carImage={selectedCarForInvoice?.image}
      />

      {/* Car Details Modal */}
      <CarDetailsModal
        isOpen={isCarDetailsModalOpen}
        onClose={() => setIsCarDetailsModalOpen(false)}
        // @ts-expect-error - API data structure is compatible with CarData interface
        car={selectedCarForDetails}
      />
    </main>
  );
};

export default CarTrackerStatus;