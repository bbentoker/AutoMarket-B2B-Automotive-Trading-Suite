import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ArrowRight,
  Gauge,
  Fuel,
  Settings,
  Clock,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Star,
  Hash,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../utils/api';
import CarDetailsModal from '../components/CarDetailsModal';

// Interface for invoice data
interface Invoice {
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
}

// Interface for the API response car data
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
  invoices?: Invoice[];
}

// Interface for API response structure
interface ApiResponse {
  data: {
    purchasedCars: ApiCarData[];
  };
  message?: string;
}

// Interface for processed car data used in the component
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
  purchasedDate: string;
  dealer: string;
  dealerEmail: string;
  location: string;
  status: string;
  paymentDeadline: string;
  timeLeft: string;
  urgencyLevel: number;
}

const PurchasedCars: React.FC = () => {
  const navigate = useNavigate();
  const [purchasedCars, setPurchasedCars] = useState<ProcessedCarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Interface for modal car data (extends ApiCarData with required fields)
  interface ModalCarData extends ApiCarData {
    currency: string;
    updated_at: string;
    horsepower: string;
    registration_number: string;
  }

  const [selectedCar, setSelectedCar] = useState<ModalCarData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalApiCars, setOriginalApiCars] = useState<ApiCarData[]>([]);

  // Function to map API data to modal format
  const mapApiDataToModalFormat = (apiCar: ApiCarData): ModalCarData => {
    return {
      ...apiCar,
      currency: 'euro',
      updated_at: apiCar.created_at,
      horsepower: '0',
      registration_number: apiCar.vin_number || 'N/A'
    };
  };

  // Function to map API data to component format
  const mapApiDataToComponentFormat = (apiCars: ApiCarData[]): ProcessedCarData[] => {
    return apiCars.map((car) => {
      // Extract first feature for subtitle (up to first comma or 50 chars)
      const subtitle = car.features ?
        car.features.split(',')[0].substring(0, 50) + (car.features.length > 50 ? '...' : '') :
        `${car.color} • Ref: ${car.reference_no}`;

      // Format date
      const purchaseDate = new Date(car.created_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // Get unpaid invoices and find the earliest due date
      const unpaidInvoices = car.invoices?.filter(inv => !inv.is_paid) || [];

      // If all invoices are paid, this car shouldn't appear in purchased cars
      // But we'll handle the status anyway for robustness
      let deadline: Date;

      if (unpaidInvoices.length > 0) {
        // Find the earliest due date among unpaid invoices
        const earliestDueDate = unpaidInvoices.reduce((earliest, invoice) => {
          return new Date(invoice.due_date) < new Date(earliest) ? invoice.due_date : earliest;
        }, unpaidInvoices[0].due_date);

        deadline = new Date(earliestDueDate);
      } else {
        // Fallback: use creation date + 7 days if no unpaid invoices
        deadline = new Date(car.created_at);
        deadline.setDate(deadline.getDate() + 7);
      }

      // Calculate days left
      const today = new Date();
      const timeDiff = deadline.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Determine status and urgency based on unpaid invoices
      let status = 'Payment Pending';
      let timeLeft = `${daysLeft} days left`;
      let urgencyLevel = 2;

      if (unpaidInvoices.length === 0) {
        // All invoices are paid
        status = 'Payment Completed';
        timeLeft = 'Completed';
        urgencyLevel = 3;
      } else if (daysLeft < 0) {
        status = 'Overdue';
        timeLeft = 'Overdue';
        urgencyLevel = 1;
      } else if (daysLeft <= 2) {
        urgencyLevel = 1;
      }

      return {
        id: car.id,
        image: car.photos?.[0]?.url || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400',
        title: `${car.brand_name} ${car.model}`,
        subtitle,
        mileage: `${car.km_stand?.toLocaleString() || 0} km`,
        fuel: car.fuel_type || 'Unknown',
        transmission: car.transmission_type || 'Unknown',
        vinNumber: car.vin_number || 'N/A',
        price: `€${parseFloat(car.listing_price || '0').toLocaleString()}`,
        purchasedDate: purchaseDate,
        dealer: 'AutoMarket Partner',
        dealerEmail: 'sales@automarket.example.com',
        location: 'Europe',
        status,
        paymentDeadline: deadline.toISOString().split('T')[0],
        timeLeft,
        urgencyLevel
      };
    });
  };

  // Fetch purchased cars data
  useEffect(() => {
    const fetchPurchasedCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getDashboardPurchasedCars() as ApiResponse;

        if (response.data && response.data.purchasedCars) {
          const apiCars = response.data.purchasedCars;
          setOriginalApiCars(apiCars); // Store original API data for modal
          const processedCars = mapApiDataToComponentFormat(apiCars);
          // Sort by urgency level (1 = most urgent)
          const sortedCars = processedCars.sort((a, b) => a.urgencyLevel - b.urgencyLevel);
          setPurchasedCars(sortedCars);
        } else {
          setOriginalApiCars([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payment Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Payment Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAutoMarket = (carId: number) => {
    const car = originalApiCars.find(c => c.id === carId);
    if (car) {
      setSelectedCar(mapApiDataToModalFormat(car));
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  const handleCompletePayment = (carId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // Simulate payment completion
    const isConfirmed = window.confirm('Complete payment for this vehicle?');

    if (isConfirmed) {
      // Show success message
      alert('Payment completed successfully! Car has been moved to Car Tracker Status.');

      // In a real app, you would update the backend here
      // The car would be removed from purchased cars and added to tracker

      // Navigate to tracker page to show the car there
      navigate('/tracker');
    }
  };

  const paymentPending = purchasedCars.filter(car => car.status === 'Payment Pending').length;
  const paymentOverdue = purchasedCars.filter(car => car.status === 'Overdue').length;
  const totalValue = purchasedCars.reduce((sum, car) => sum + parseFloat(car.price.replace('€', '').replace(',', '')), 0);

  // Loading state
  if (loading) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">Loading purchased cars...</h3>
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
      <div className="p-4 lg:p-8">
        {/* Info Banner */}
        <div className="bg-primary-950 rounded-2xl p-6 lg:p-8 mb-6 lg:mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-5 h-5 lg:w-6 lg:h-6 text-blue-200" fill="currentColor" />
              <h2 className="text-xl lg:text-2xl font-bold text-white">Complete Your Purchases</h2>
            </div>
            <p className="text-white/80 text-base lg:text-lg max-w-2xl">
              {paymentPending + paymentOverdue > 0
                ? "Complete payment for your purchased vehicles to secure your purchase and start the delivery process."
                : "All payments completed! Your vehicles are ready for the next stage of the delivery process."
              }
            </p>
          </div>

          {/* Background Logo */}
          <div className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 opacity-20">
            <div className="text-accent-500 text-4xl lg:text-6xl font-bold">
              Car<br />Click
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-1.5 h-14 bg-primary-950 rounded-full"></div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary-950">Purchased Cars</h1>
              <p className="text-gray-400">
                ({paymentPending + paymentOverdue} items awaiting payment
                {purchasedCars.filter(car => car.status === 'Payment Completed').length > 0 &&
                  `, ${purchasedCars.filter(car => car.status === 'Payment Completed').length} completed`})
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-1">{paymentPending + paymentOverdue}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Awaiting Payment</p>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-1">{paymentPending}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Payment Pending</p>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-1">{paymentOverdue}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Overdue</p>
          </div>

          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-primary-950 mb-1">€{totalValue.toLocaleString()}</h3>
            <p className="text-gray-400 text-xs lg:text-sm">Total Value</p>
          </div>
        </div>

        {/* Purchased Cars List */}
        {purchasedCars.length > 0 ? (
          <div className="space-y-6 lg:space-y-8">
            {purchasedCars.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl p-4 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleAutoMarket(car.id)}>
                <div className="flex flex-col xl:flex-row xl:items-start space-y-6 xl:space-y-0 xl:space-x-8">
                  {/* Car Image */}
                  <div className="flex-shrink-0 relative">
                    <img
                      src={car.image}
                      alt={car.title}
                      className="w-full xl:w-80 h-48 xl:h-60 object-cover rounded-2xl"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white transition-colors">
                      <Eye className="w-4 h-4 text-primary-950" />
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="flex-1 space-y-4 lg:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                          <h3 className="text-lg lg:text-xl font-medium text-primary-950 hover:text-accent-500 transition-colors">{car.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border mt-2 sm:mt-0 self-start ${getStatusColor(car.status)}`}>
                            {car.status}
                          </span>
                        </div>
                        <p className="text-primary-950/50 mb-4">{car.subtitle}</p>

                        {/* Car Specs */}
                        <div className="flex flex-wrap items-center gap-4 lg:gap-8 text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Gauge className="w-4 h-4" />
                            <span>{car.mileage}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Fuel className="w-4 h-4" />
                            <span>{car.fuel}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4" />
                            <span className="font-mono text-xs">{car.vinNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left lg:text-right">
                        <p className="text-gray-400 text-sm mb-1">{car.vat_or_margin}</p>
                        <p className="text-xl lg:text-2xl font-bold text-primary-950">{car.price}</p>
                      </div>
                    </div>

                    {/* Purchase Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Purchase Date</p>
                          <p className="font-medium text-primary-950">{car.purchasedDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Payment Deadline</p>
                          <p className={`font-medium ${car.status === 'Overdue' ? 'text-red-600' : 'text-orange-600'
                            }`}>
                            {car.status === 'Overdue' ? car.timeLeft :
                              new Date(car.paymentDeadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className={`rounded-lg p-4 ${car.status === 'Payment Completed' ? 'bg-green-50 border border-green-200' :
                        car.status === 'Overdue' ? 'bg-red-50 border border-red-200' :
                          'bg-blue-50 border border-blue-200'
                      }`}>
                      <div className="flex items-start space-x-2">
                        <FileText className={`w-4 h-4 mt-0.5 ${car.status === 'Payment Completed' ? 'text-green-600' :
                            car.status === 'Overdue' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        <div>
                          <h5 className={`font-medium mb-1 ${car.status === 'Payment Completed' ? 'text-green-800' :
                              car.status === 'Overdue' ? 'text-red-800' : 'text-blue-800'
                            }`}>
                            {car.status === 'Payment Completed' ? 'Payment Completed' :
                              car.status === 'Overdue' ? 'Urgent Action Required' : 'Next Steps'}
                          </h5>
                          <p className={`text-sm ${car.status === 'Payment Completed' ? 'text-green-700' :
                              car.status === 'Overdue' ? 'text-red-700' : 'text-blue-700'
                            }`}>
                            {car.status === 'Payment Completed'
                              ? 'All payments have been completed successfully. Your vehicle is being prepared for delivery. Track progress in the Car Tracker.'
                              : car.status === 'Overdue'
                                ? 'URGENT: Payment deadline has passed. Please complete payment immediately to avoid cancellation.'
                                : 'Please complete payment within 7 days to secure your vehicle. Contact dealer for payment options.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end pt-4 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAutoMarket(car.id);
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>

                      {car.status === 'Payment Completed' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/tracker');
                          }}
                          className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>View Tracker</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleCompletePayment(car.id, e)}
                          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${car.status === 'Overdue'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-primary-950 text-white hover:bg-primary-900'
                            }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Complete Payment</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 lg:w-12 lg:h-12 text-green-600" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">All payments completed!</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              All your purchased cars have been paid for and moved to Car Tracker Status for delivery tracking.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/tracker')}
                className="bg-primary-950 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors"
              >
                View Car Tracker
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Browse More Cars
              </button>
            </div>
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

export default PurchasedCars;