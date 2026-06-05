import React from 'react';
import { X, Package, Copy, Check, ExternalLink, Truck } from 'lucide-react';

interface RegDocTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingCode: string;
  carTitle: string;
}

const RegDocTrackingModal: React.FC<RegDocTrackingModalProps> = ({
  isOpen,
  onClose,
  trackingCode,
  carTitle
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackOnUPS = () => {
    window.open(`https://www.ups.com/track?track=yes&trackNums=${trackingCode}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-950">Registration Document Tracking</h3>
              <p className="text-sm text-gray-500">Track your document shipment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Car Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-primary-950 mb-1">Vehicle</h4>
            <p className="text-sm text-gray-600">{carTitle}</p>
          </div>

          {/* Tracking Code Section */}
          <div>
            <h4 className="font-medium text-primary-950 mb-3">UPS Tracking Code</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-mono font-bold text-blue-800">{trackingCode}</span>
                <button
                  onClick={handleCopyTrackingCode}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-blue-700">
                Use this tracking code to monitor your registration document shipment on UPS Express.
              </p>
            </div>
          </div>

          {/* Track on UPS Express Button */}
          <button
            onClick={handleTrackOnUPS}
            className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
          >
            <Truck className="w-4 h-4" />
            <span className="font-medium">Track on UPS Express</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">Important Information</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Registration documents are sent via UPS Express</li>
              <li>• Delivery requires signature confirmation</li>
              <li>• Contact us if you don't receive within 5 business days</li>
              <li>• Keep this tracking code for your records</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Need help? Contact our support team</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegDocTrackingModal;