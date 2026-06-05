import React, { useEffect, useState } from 'react';
import { getWeeklyDealerReport } from '../utils/api';
import Select from 'react-select';
import GenerateReportPopup from '../components/GenerateReportPopup';
import { useNavigate } from 'react-router-dom';

const metricFormat = {
  carsSold: (v) => (v && v !== 0 ? v : '-'),
  avgSellingPrice: (v) => (v ? `€${Math.round(Number(v)).toLocaleString()}` : '-'),
  avgDaysToSell: (v) => (v ? `${Math.floor(Number(v))} days` : '-'),
  inventoryChange: (v) => (v && v !== 0 ? v : '-'),
};

const metricColor = {
  carsSold: 'text-blue-600',
  avgSellingPrice: 'text-green-600',
  avgDaysToSell: 'text-purple-600',
  inventoryChange: 'text-blue-600',
};

const changeFormat = (change, type, metric, prevWeek) => {
  // If prev week is missing or 0, show "-" for change
  if (!prevWeek || prevWeek === 0) {
    return '-';
  }

  if (metric === 'avgDaysToSell') {
    const sign = change < 0 ? '- ' : '+ ';
    return `${sign}${Math.floor(Math.abs(change))} days`;
  }
  if (metric === 'avgSellingPrice') {
    const sign = change < 0 ? '- ' : '+ ';
    return `${sign}€${Math.round(Math.abs(change)).toLocaleString()}`;
  }
  // carsSold
  const sign = change < 0 ? '- ' : '+ ';
  return `${sign}${Math.abs(change)}`;
};

const ScrapedDealers = () => {
  const [reportData, setReportData] = useState(null);
  const [openCards, setOpenCards] = useState({});
  const [selectedDealers, setSelectedDealers] = useState([]);
  const [reportPopup, setReportPopup] = useState({ isOpen: false, dealer: null });
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getWeeklyDealerReport()
      .then((data) => {
        console.log('Weekly dealer report data:', data);
        setReportData(data.report);
      })
      .catch((err) => {
        console.error('Failed to fetch weekly dealer report:', err);
      });
  }, []);

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

  if (!reportData) {
    return <div className="text-xl p-8">Loading dealer reports...</div>;
  }

  const dealerOptions = reportData.salesPerformanceOverview.map((dealer) => ({
    value: dealer.dealerId,
    label: dealer.dealerName,
  }));
  console.log('Dealer options:', dealerOptions);
  const filteredDealers =
    selectedDealers.length > 0
      ? reportData.salesPerformanceOverview.filter((dealer) =>
          selectedDealers.some((sel) => sel.value === dealer.dealerId)
        )
      : reportData.salesPerformanceOverview;

  return (
    <div className="max-w-8xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Weekly Dealer Sales Performance</h1>
        <button
          onClick={() => navigate('/add-scraped-dealer')}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          Add Dealer
        </button>
      </div>

      <div className="mb-6">
        <Select
          isMulti
          options={dealerOptions}
          value={selectedDealers}
          onChange={setSelectedDealers}
          placeholder="Select dealers to show..."
          className="w-full"
          styles={{
            input: (base) => ({ ...base, color: 'black' }),
            singleValue: (base) => ({ ...base, color: 'black' }),
            multiValueLabel: (base) => ({ ...base, color: 'black' }),
            option: (base, state) => ({
              ...base,
              color: 'black',
              backgroundColor: state.isFocused ? '#e5e7eb' : 'white',
            }),
            placeholder: (base) => ({ ...base, color: 'black' }),
            menu: (base) => ({ ...base, color: 'black' }),
            control: (base, state) => ({
              ...base,
              minHeight: '48px',
              height: '48px',
              borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
              boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
              '&:hover': {
                borderColor: '#3b82f6',
              },
            }),
            valueContainer: (base) => ({
              ...base,
              padding: '8px 12px',
            }),
            indicatorsContainer: (base) => ({
              ...base,
              height: '48px',
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: '#e5e7eb',
              borderRadius: '6px',
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#d1d5db',
                color: '#374151',
              },
            }),
          }}
        />
      </div>
      <div className="space-y-4">
        {filteredDealers.map((dealer) => {
          const isOpen = openCards[dealer.dealerId] || false;
          return (
            <div
              key={dealer.dealerId}
              className="bg-white shadow border border-gray-200 rounded-lg"
            >
              <button
                className={`w-full flex items-center justify-between px-6 py-4 focus:outline-none transition-colors duration-150 ${
                  isOpen ? 'rounded-t-lg' : 'rounded-lg'
                } hover:bg-gray-50 focus:ring-2 focus:ring-blue-400`}
                onClick={() => setOpenCards((prev) => ({ ...prev, [dealer.dealerId]: !isOpen }))}
                style={{
                  borderBottomLeftRadius: isOpen ? 0 : '',
                  borderBottomRightRadius: isOpen ? 0 : '',
                }}
              >
                <div>
                  <div className="text-lg font-semibold text-gray-800 text-left">
                    {dealer.dealerName}
                  </div>
                  <div className="text-sm text-gray-500 text-left">{dealer.region}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dealer-solds/${dealer.dealerId}`);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    See Solds
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReportPopup({ isOpen: true, dealer });
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Edit Report
                  </button>
                  <span className="text-2xl text-gray-400">{isOpen ? '−' : '+'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 rounded-b-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full mt-2">
                      <thead>
                        <tr className="text-left text-gray-500 text-sm border-b border-gray-200">
                          <th className="py-2">Metric</th>
                          <th className="py-2">Current Week Cars Sold</th>
                          <th className="py-2">Previous Week Cars Sold</th>
                          <th className="py-2">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(dealer.metrics).map(([key, metric]) => {
                          // Handle the new data structure for inventoryChange
                          if (key === 'inventoryChange' && metric.currentWeek && metric.prevWeek) {
                            const currentWeekSold = metric.currentWeek.difference || 0;
                            const prevWeekSold = metric.prevWeek.difference || 0;
                            const change = currentWeekSold - prevWeekSold;
                            const changeType = change >= 0 ? 'increase' : 'decrease';

                            return (
                              <tr key={key} className="border-b last:border-b-0 align-middle">
                                <td className="py-4 font-medium text-gray-700">{metric.metric}</td>
                                <td className={`py-4 font-bold ${metricColor[key] || ''}`}>
                                  {metricFormat[key](currentWeekSold)}
                                </td>
                                <td className="py-4 text-gray-700">
                                  {metricFormat[key](prevWeekSold)}
                                </td>
                                <td className="py-4">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                      changeType === 'increase'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {changeFormat(change, changeType, key, prevWeekSold)}
                                  </span>
                                </td>
                              </tr>
                            );
                          }

                          // Handle other metrics with the old structure
                          return (
                            <tr key={key} className="border-b last:border-b-0 align-middle">
                              <td className="py-4 font-medium text-gray-700">{metric.metric}</td>
                              <td className={`py-4 font-bold ${metricColor[key] || ''}`}>
                                {metricFormat[key](metric.currentWeek)}
                              </td>
                              <td className="py-4 text-gray-700">
                                {metricFormat[key](metric.prevWeek)}
                              </td>
                              <td className="py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                  {changeFormat(
                                    metric.change,
                                    metric.changeType,
                                    key,
                                    metric.prevWeek
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {dealer.topFastestCars && dealer.topFastestCars.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Top Fastest Selling Cars ({dealer.topFastestCars.length} cars)
                      </h4>
                      {console.log(
                        'Top fastest cars for dealer:',
                        dealer.dealerName,
                        dealer.topFastestCars
                      )}
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-left text-gray-500 text-sm border-b border-gray-200">
                              <th className="py-2">Photo</th>
                              <th className="py-2">Car</th>
                              <th className="py-2">Price</th>
                              <th className="py-2">Power</th>
                              <th className="py-2">Mileage</th>
                              <th className="py-2">Fuel</th>
                              <th className="py-2">Transmission</th>
                              <th className="py-2">Registration</th>
                              <th className="py-2">Days to Sell</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dealer.topFastestCars.map((car) => {
                              console.log('Car data:', car);
                              return (
                                <tr key={car.id} className="border-b last:border-b-0 align-middle">
                                  <td className="py-4">
                                    <img
                                      src={car.main_photo}
                                      alt={`${car.make} ${car.model}`}
                                      className="w-16 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() =>
                                        handleImageClick(
                                          car.main_photo,
                                          `${car.make} ${car.model}`,
                                          car
                                        )
                                      }
                                      onError={(e) => {
                                        console.log('Image failed to load:', car.main_photo);
                                        e.target.src =
                                          'https://via.placeholder.com/64x48?text=No+Image';
                                      }}
                                      onLoad={() => {
                                        console.log('Image loaded successfully:', car.main_photo);
                                      }}
                                    />
                                  </td>
                                  <td className="py-4 font-medium text-gray-700">
                                    {car.make} {car.model}
                                  </td>
                                  <td className="py-4 font-bold text-green-600">
                                    {car.currency === 'CHF' ? 'CHF' : '€'}{' '}
                                    {Number(car.price).toLocaleString()}
                                  </td>
                                  <td className="py-4 text-gray-700">{car.power || '-'}</td>
                                  <td className="py-4 text-gray-700">{car.mileage}</td>
                                  <td className="py-4 text-gray-700">{car.fuel_type}</td>
                                  <td className="py-4 text-gray-700">{car.transmission}</td>
                                  <td className="py-4 text-gray-700">
                                    {new Date(car.first_registration).getFullYear()}
                                  </td>
                                  <td className="py-4 font-medium text-blue-600">
                                    {car.sell_time} day{car.sell_time !== 1 ? 's' : ''}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Top Fastest Selling Cars
                      </h4>
                      <p className="text-gray-500">
                        No fastest selling cars data available for this dealer.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <GenerateReportPopup
        isOpen={reportPopup.isOpen}
        onClose={() => setReportPopup({ isOpen: false, dealer: null })}
        dealer={reportPopup.dealer}
      />

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
                          {selectedImage.data.currency === 'CHF' ? 'CHF' : '€'}{' '}
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
                        <span className="text-gray-800">{selectedImage.data.transmission}</span>
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

export default ScrapedDealers;
