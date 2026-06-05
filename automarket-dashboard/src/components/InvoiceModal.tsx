import React from 'react';
import { X, FileText, Calendar, CreditCard, Check, Clock, Download } from 'lucide-react';

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

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  carTitle: string;
  carImage?: string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  invoice, 
  carTitle,
  carImage 
}) => {
  if (!isOpen || !invoice) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : currency;
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
  };

  const handleDownload = () => {
    // Implement download logic here
    console.log('Downloading invoice:', invoice.invoice_number);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-950">Invoice Details</h2>
              <p className="text-sm text-gray-500">{invoice.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${
              invoice.is_paid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {invoice.is_paid ? (
                <Check className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {invoice.is_paid ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-950 text-white rounded-lg hover:bg-primary-900 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Car Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-primary-950 mb-3">Vehicle Information</h3>
            <div className="flex items-center space-x-4">
              {carImage && (
                <img 
                  src={carImage} 
                  alt={carTitle}
                  className="w-20 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-medium text-primary-950">{carTitle}</p>
                <p className="text-sm text-gray-600">{invoice.description}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Invoice Number</label>
                <p className="font-mono text-primary-950 font-medium">{invoice.invoice_number}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Invoice Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-primary-950">{formatDate(invoice.created_at)}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Due Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-primary-950">{formatDate(invoice.due_date)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Amount</label>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-2xl font-bold text-primary-950">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                </div>
              </div>
              
              {invoice.is_paid && invoice.paid_at && (
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Paid Date</label>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-primary-950">{formatDate(invoice.paid_at)}</span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Currency</label>
                <span className="text-primary-950 font-medium">{invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-primary-950 mb-4">Payment Information</h3>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Bank Details</p>
                  <p className="text-primary-950 font-medium">AutoMarket AB</p>
                  <p className="text-gray-600">Account: SE12 3456 7890 1234 5678</p>
                  <p className="text-gray-600">BIC: SWEDSESS</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Reference</p>
                  <p className="text-primary-950 font-mono font-medium">{invoice.invoice_number}</p>
                  <p className="text-gray-600 mt-2">Please include reference in payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              This invoice was generated automatically by the AutoMarket system.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              For questions regarding this invoice, please contact support@automarket.example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal; 