import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusListingView from '../components/StatusListingView';

const StatusPage = () => {
  const { statusId } = useParams();
  const navigate = useNavigate();
  const currentStatusId = parseInt(statusId);

  // Status mapping
  const statusNames = {
    1: 'Cars for Sale',
    2: 'Reserved',
    3: 'Offers',
    4: 'Purchased',
    5: 'Proforma Invoice Sent',
    6: 'Payment Received',
    7: 'Payment Sent',
    8: 'Transport Booked',
    9: 'Documents Sent',
    10: 'Car Picked Up',
    11: 'Car Delivered',
    12: 'Car De-registered',
    13: 'Deal Done',
    14: 'No Deal',
  };

  // Status range from 1 to 14 based on STATUS_TRANSITIONS
  const MIN_STATUS_ID = 1;
  const MAX_STATUS_ID = 14;

  const handlePrevStatus = () => {
    if (currentStatusId > MIN_STATUS_ID) {
      navigate(`/status/${currentStatusId - 1}`);
    }
  };

  const handleNextStatus = () => {
    if (currentStatusId < MAX_STATUS_ID) {
      navigate(`/status/${currentStatusId + 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4 px-4">
        <button
          onClick={handlePrevStatus}
          disabled={currentStatusId <= MIN_STATUS_ID}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStatusId <= MIN_STATUS_ID
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          ← Previous Status
        </button>

        <div className="text-white text-lg font-semibold">
          {statusNames[currentStatusId] || `Status ${currentStatusId}`}
        </div>

        <button
          onClick={handleNextStatus}
          disabled={currentStatusId >= MAX_STATUS_ID}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentStatusId >= MAX_STATUS_ID
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Next Status →
        </button>
      </div>

      <StatusListingView fixedStatusId={currentStatusId} showReserver={true} />
    </div>
  );
};

export default StatusPage;
