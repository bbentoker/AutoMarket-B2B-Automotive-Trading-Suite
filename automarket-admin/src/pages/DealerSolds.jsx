import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDealerSoldCars } from '../utils/api';

const DealerSolds = () => {
  const { dealerId } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [soldCars, setSoldCars] = useState([]);
  const [filteredSoldCars, setFilteredSoldCars] = useState([]);
  const [weekFilter, setWeekFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchDealerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dealer details and sold cars in one call
        const soldCarsData = await getDealerSoldCars(dealerId);
        console.log('Dealer sold cars data:', soldCarsData);

        // Set dealer and sold cars data from the response
        setDealer(soldCarsData.dealer);
        // Sort sold cars by last_seen (latest first)
        const sortedSoldCars = (soldCarsData.data || []).sort(
          (a, b) => new Date(b.last_seen) - new Date(a.last_seen)
        );
        setSoldCars(sortedSoldCars);
        setFilteredSoldCars(sortedSoldCars);
      } catch (err) {
        console.error('Error fetching dealer data:', err);
        setError('Failed to load dealer data');
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      fetchDealerData();
    }
  }, [dealerId]);

  // Filter cars based on selected week filter
  useEffect(() => {
    if (weekFilter === 'all') {
      setFilteredSoldCars(soldCars);
    } else {
      const weeksToFilter = parseInt(weekFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - weeksToFilter * 7);

      const filtered = soldCars.filter((car) => {
        const lastSeenDate = new Date(car.last_seen);
        return lastSeenDate >= cutoffDate;
      });

      setFilteredSoldCars(filtered);
    }
  }, [soldCars, weekFilter]);

  const handleWeekFilterChange = (e) => {
    setWeekFilter(e.target.value);
  };

  const handleImageClick = (imageUrl, carName, carData) => {
    console.log('Image clicked:', imageUrl, carName);
    setSelectedImage({ url: imageUrl, name: carName, data: carData });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Close modal when clicking outside
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dealer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => navigate('/scraped-dealers')}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Back to Dealers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/scraped-dealers')}
          className="mb-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ← Back to Dealers
        </button>

        {dealer && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Sold Cars - {dealer.name}</h1>
            <p className="text-gray-200">{dealer.email}</p>
            {dealer.company_name && (
              <p className="text-gray-200 font-medium">Company: {dealer.company_name}</p>
            )}
            <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-4">
              <p className="text-blue-800 font-semibold text-lg">
                {weekFilter === 'all' ? 'Total' : 'Filtered'} Sold Cars:{' '}
                <span className="text-blue-900">{filteredSoldCars.length}</span>
                {weekFilter !== 'all' && (
                  <span className="text-blue-600 text-sm ml-2">(of {soldCars.length} total)</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        {soldCars.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              {weekFilter !== 'all' && (
                <span className="text-sm text-gray-600">
                  Showing cars sold in the last {weekFilter} week{weekFilter !== '1' ? 's' : ''}
                </span>
              )}
              <div className="flex items-center gap-4 ml-auto">
                <label htmlFor="week-filter" className="text-sm font-medium text-gray-700">
                  Filter by sold date:
                </label>
                <select
                  id="week-filter"
                  value={weekFilter}
                  onChange={handleWeekFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="1">Last 1 Week</option>
                  <option value="2">Last 2 Weeks</option>
                  <option value="3">Last 3 Weeks</option>
                  <option value="4">Last 4 Weeks</option>
                  <option value="8">Last 8 Weeks</option>
                  <option value="12">Last 12 Weeks</option>
                  <option value="24">Last 24 Weeks (6 months)</option>
                  <option value="52">Last 52 Weeks (1 year)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {soldCars.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No sold cars found for this dealer</div>
          <p className="text-gray-400">This dealer has no sold cars in the system</p>
        </div>
      ) : filteredSoldCars.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No cars found for the selected time period
          </div>
          <p className="text-gray-400">Try selecting a different time range or view all cars</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-700 text-sm border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 font-semibold">No.</th>
                  <th className="py-4 px-6 font-semibold">Photo</th>
                  <th className="py-4 px-6 font-semibold">Car</th>
                  <th className="py-4 px-6 font-semibold">Price</th>
                  <th className="py-4 px-6 font-semibold">Power</th>
                  <th className="py-4 px-6 font-semibold">Mileage</th>
                  <th className="py-4 px-6 font-semibold">Fuel</th>
                  <th className="py-4 px-6 font-semibold">Transmission</th>
                  <th className="py-4 px-6 font-semibold">Registration</th>
                  <th className="py-4 px-6 font-semibold">Days to Sell</th>
                  <th className="py-4 px-6 font-semibold">Created At</th>
                  <th className="py-4 px-6 font-semibold">Sold Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSoldCars.map((car, index) => (
                  <tr
                    key={car.id}
                    className="border-b last:border-b-0 align-middle hover:bg-gray-50"
                  >
                    <td className="py-6 px-6 text-gray-600 font-medium text-center">{index + 1}</td>
                    <td className="py-6 px-6">
                      <img
                        src={car.image_url}
                        alt={`${car.make} ${car.model}`}
                        className="w-20 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          handleImageClick(car.image_url, `${car.make} ${car.model}`, car)
                        }
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x64?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="py-6 px-6 font-medium text-gray-800 text-base">
                      {car.make} {car.model}
                    </td>
                    <td className="py-6 px-6 font-bold text-green-600 text-base">
                      {car.price_currency === 'CHF' ? 'CHF' : '€'}{' '}
                      {Number(car.price).toLocaleString()}
                    </td>
                    <td className="py-6 px-6 text-gray-700 text-base">{car.power || '-'}</td>
                    <td className="py-6 px-6 text-gray-700 text-base">{car.mileage}</td>
                    <td className="py-6 px-6 text-gray-700 text-base">{car.fuel_type}</td>
                    <td className="py-6 px-6 text-gray-700 text-base">{car.gearbox}</td>
                    <td className="py-6 px-6 text-gray-700 text-base">
                      {new Date(car.first_registration).getFullYear()}
                    </td>
                    <td className="py-6 px-6 font-medium text-blue-600 text-base">
                      {car.sell_time} day{car.sell_time !== 1 ? 's' : ''}
                    </td>
                    <td className="py-6 px-6 text-gray-700 text-base">
                      {new Date(car.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-6 px-6 text-gray-700 text-base">
                      {new Date(car.last_seen).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleModalClick}
        >
          <div className="relative max-w-6xl max-h-full p-4">
            <div className="bg-white rounded-lg p-4 relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-4 text-gray-600 text-2xl font-bold hover:text-gray-800 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10"
              >
                ×
              </button>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pr-12">
                {selectedImage.name}
              </h3>

              <div className="flex gap-6">
                {/* Left side - Image */}
                <div className="flex-1">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full max-h-96 object-contain rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                    }}
                  />
                </div>

                {/* Right side - Car Details */}
                {selectedImage.data && (
                  <div className="flex-1 bg-gray-50 rounded-lg p-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Car Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Price:</span>
                        <span className="text-green-600 font-bold text-lg">
                          {selectedImage.data.price_currency === 'CHF' ? 'CHF' : '€'}{' '}
                          {Number(selectedImage.data.price).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Power:</span>
                        <span className="text-gray-800">{selectedImage.data.power || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Mileage:</span>
                        <span className="text-gray-800">{selectedImage.data.mileage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Fuel Type:</span>
                        <span className="text-gray-800">{selectedImage.data.fuel_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Transmission:</span>
                        <span className="text-gray-800">{selectedImage.data.gearbox}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Registration:</span>
                        <span className="text-gray-800">
                          {new Date(selectedImage.data.first_registration).getFullYear()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Days to Sell:</span>
                        <span className="text-blue-600 font-medium">
                          {selectedImage.data.sell_time} day
                          {selectedImage.data.sell_time !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Sold Date:</span>
                        <span className="text-gray-800">
                          {new Date(selectedImage.data.last_seen).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerSolds;
