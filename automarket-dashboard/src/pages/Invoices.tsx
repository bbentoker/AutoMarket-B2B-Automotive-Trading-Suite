import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle,
  Clock,
  CreditCard,
  ArrowRight,
  Gauge,
  Fuel,
  Settings,
  Hash,
  Eye
} from 'lucide-react';
import apiService from '../utils/api';

interface Invoice {
  id: number;
  invoiceNumber: string;
  carTitle: string;
  carSubtitle: string;
  carImage: string;
  mileage: string;
  fuel: string;
  transmission: string;
  vinNumber: string;
  amount: string;
  issueDate: string;
  dueDate: string;
  status: string;
  paymentMethod: string;
  dealer: string;
  registrationNumber: string;
  color: string;
  horsepower: string;
  description: string;
}

interface ApiInvoiceResponse {
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
  listing: {
    id: number;
    brand_name: string;
    model: string;
    km_stand: number;
    fuel_type: string;
    transmission_type: string;
    vin_number: string;
    registration_number: string;
    color: string;
    horsepower: string;
    photos: Array<{ url: string }>;
  };
}

const Invoices: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDashboardInvoices();
      
      if (response.data && Array.isArray(response.data)) {
        const transformedInvoices = response.data.map((invoice: ApiInvoiceResponse) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          carTitle: `${invoice.listing.brand_name} ${invoice.listing.model}`,
          carSubtitle: invoice.description || `${invoice.listing.brand_name} ${invoice.listing.model}`,
          carImage: invoice.listing.photos?.[0]?.url || "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=600",
          mileage: `${invoice.listing.km_stand?.toLocaleString() || 0} km`,
          fuel: invoice.listing.fuel_type || 'Unknown',
          transmission: invoice.listing.transmission_type || 'Unknown',
          vinNumber: invoice.listing.vin_number || 'N/A',
          amount: `€${parseFloat(invoice.amount).toLocaleString()}`,
          issueDate: new Date(invoice.created_at).toISOString().split('T')[0],
          dueDate: invoice.due_date,
          status: invoice.is_paid ? 'Paid' : (new Date(invoice.due_date) < new Date() ? 'Overdue' : 'Pending'),
          paymentMethod: 'Bank Transfer',
          dealer: `Dealer ID: ${invoice.dealer_id}`,
          registrationNumber: invoice.listing.registration_number || 'N/A',
          color: invoice.listing.color || 'Unknown',
          horsepower: invoice.listing.horsepower || 'N/A',
          description: invoice.description || ''
        }));
        setInvoices(transformedInvoices);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sort invoices with Overdue first, then by status priority
  const getSortPriority = (status: string) => {
    switch (status) {
      case 'Overdue': return 1;
      case 'Pending': return 2;
      case 'Paid': return 3;
      default: return 4;
    }
  };

  const sortedInvoicesData = [...invoices].sort((a, b) => {
    const priorityA = getSortPriority(a.status);
    const priorityB = getSortPriority(b.status);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by due date (earliest first for overdue/pending)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Filter invoices based on active filter
  const filteredInvoices = sortedInvoicesData.filter(invoice => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unpaid') return invoice.status === 'Pending';
    if (activeFilter === 'paid') return invoice.status === 'Paid';
    if (activeFilter === 'overdue') return invoice.status === 'Overdue';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePayment = (invoiceId: number, amount: string) => {
    console.log(`Processing payment for invoice ${invoiceId} - ${amount}`);
    alert(`Payment initiated for ${amount}`);
  };

  const handleAutoMarket = (carId: number) => {
    console.log(`Viewing car details for car ID: ${carId}`);
  };

  const totalInvoices = sortedInvoicesData.length;
  const paidInvoices = sortedInvoicesData.filter(inv => inv.status === 'Paid').length;
  const pendingInvoices = sortedInvoicesData.filter(inv => inv.status === 'Pending').length;
  const overdueInvoices = sortedInvoicesData.filter(inv => inv.status === 'Overdue').length;
  const unpaidInvoices = pendingInvoices; // Only pending invoices are considered unpaid
  const totalAmount = sortedInvoicesData.reduce((sum, inv) => sum + parseFloat(inv.amount.replace('€', '').replace(',', '')), 0);
  const outstandingAmount = sortedInvoicesData
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + parseFloat(inv.amount.replace('€', '').replace(',', '')), 0);

  // Get count for current filter
  const getFilterCount = (filter: string) => {
    if (filter === 'all') return totalInvoices;
    if (filter === 'unpaid') return unpaidInvoices;
    if (filter === 'paid') return paidInvoices;
    if (filter === 'overdue') return overdueInvoices;
    return 0;
  };

  // Loading state
  if (loading) {
    return (
      <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
        <div className="p-4 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-950 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invoices...</p>
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
        <div className="p-4 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Invoices</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchInvoices}
                className="bg-primary-950 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
      <div className="p-4 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-14 bg-primary-950 rounded-full"></div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary-950">Invoices</h1>
              <p className="text-gray-400">({getFilterCount(activeFilter)} items)</p>
            </div>
          </div>
        </div>

        {/* Top Stats Row - 3 Cards - Improved Mobile Design */}
        <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-6">
          {/* Total Invoices */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-primary-950" />
              </div>
              <div>
                <h3 className="text-lg lg:text-2xl font-bold text-primary-950">{totalInvoices}</h3>
                <p className="text-gray-400 text-xs lg:text-sm">Total Invoices</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg lg:text-2xl font-bold text-orange-600">{unpaidInvoices}</h3>
                <p className="text-gray-400 text-xs lg:text-sm">Pending</p>
              </div>
            </div>
          </div>

          {/* Paid */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg lg:text-2xl font-bold text-green-600">{paidInvoices}</h3>
                <p className="text-gray-400 text-xs lg:text-sm">Paid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Row - 2 Cards - Total Invoice Amount & Outstanding Amount */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
          {/* Total Invoice Amount */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base lg:text-lg font-semibold text-primary-950 mb-2">Total Invoice Amount</h3>
            <p className="text-2xl lg:text-3xl font-bold text-primary-950">€{totalAmount.toLocaleString()}</p>
          </div>

          {/* Outstanding Amount */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base lg:text-lg font-semibold text-primary-950 mb-2">Outstanding Amount</h3>
            <p className="text-2xl lg:text-3xl font-bold text-red-500">€{outstandingAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filter Tabs - Now positioned after the stats cards with horizontal scroll on mobile */}
        <div className="mb-6 lg:mb-8">
          <div className="flex overflow-x-auto scrollbar-hide space-x-2 pb-2 lg:pb-0 lg:flex-wrap lg:gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-shrink-0 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-primary-950 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Invoices ({totalInvoices})
            </button>
            <button
              onClick={() => setActiveFilter('unpaid')}
              className={`flex-shrink-0 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'unpaid'
                  ? 'bg-primary-950 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Pending ({unpaidInvoices})
            </button>
            <button
              onClick={() => setActiveFilter('overdue')}
              className={`flex-shrink-0 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'overdue'
                  ? 'bg-primary-950 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Overdue ({overdueInvoices})
            </button>
            <button
              onClick={() => setActiveFilter('paid')}
              className={`flex-shrink-0 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'paid'
                  ? 'bg-primary-950 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Paid ({paidInvoices})
            </button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-6">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleAutoMarket(invoice.id)}>
              <div className="flex flex-col xl:flex-row xl:items-start space-y-6 xl:space-y-0 xl:space-x-8">
                {/* Car Image */}
                <div className="flex-shrink-0 relative">
                  <img 
                    src={invoice.carImage} 
                    alt={invoice.carTitle}
                    className="w-full xl:w-80 h-48 xl:h-60 object-cover rounded-2xl"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white transition-colors">
                    <Eye className="w-4 h-4 text-primary-950" />
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="flex-1 space-y-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <h3 className="text-lg lg:text-xl font-medium text-primary-950 hover:text-accent-500 transition-colors">{invoice.invoiceNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border mt-2 sm:mt-0 self-start ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <h4 className="text-base lg:text-lg font-semibold text-primary-950 mb-2">{invoice.carTitle}</h4>
                      <p className="text-primary-950/50 mb-4">{invoice.carSubtitle}</p>
                      
                      {/* Car Specs */}
                      <div className="flex flex-wrap items-center gap-4 lg:gap-8 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Gauge className="w-4 h-4" />
                          <span>{invoice.mileage}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Fuel className="w-4 h-4" />
                          <span>{invoice.fuel}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>{invoice.transmission}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4" />
                          <span className="font-mono text-xs">{invoice.vinNumber}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left lg:text-right">
                      <p className="text-gray-400 text-sm mb-1">Amount:</p>
                      <p className="text-xl lg:text-2xl font-bold text-primary-950">{invoice.amount}</p>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Issue Date</p>
                        <p className="font-medium text-primary-950">{new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Due Date</p>
                        <p className="font-medium text-primary-950">{new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Payment Method</p>
                        <p className="font-medium text-primary-950">{invoice.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
                    {/* Download Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Download invoice');
                      }}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Invoice</span>
                    </button>

                    {/* Payment Button for Unpaid Invoices */}
                    {(invoice.status === 'Pending' || invoice.status === 'Overdue') && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayment(invoice.id, invoice.amount);
                        }}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          invoice.status === 'Overdue' 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-primary-950 text-white hover:bg-primary-900'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 lg:w-12 lg:h-12 text-primary-950" />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-primary-950 mb-2">
              {activeFilter === 'all' ? 'No invoices found' : 
               activeFilter === 'unpaid' ? 'No pending invoices found' :
               `No ${activeFilter} invoices found`}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              {activeFilter === 'all' 
                ? 'Your vehicle purchase invoices will appear here.'
                : activeFilter === 'unpaid' 
                ? 'No invoices with pending status at the moment.'
                : `No invoices with ${activeFilter} status at the moment.`
              }
            </p>
            <button className="bg-primary-950 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium hover:bg-primary-900 transition-colors">
              Browse Cars
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Invoices;