import React from 'react';
import ImageCarouselMobile from './ImageCarouselMobile';
import SimilarListings from './SimilarListings';
import { ProtectedAction } from './ProtectedAction';
import MakeOfferPopup from './MakeOfferPopup';
import Overview from './Overview';
import Equipment from './Equipment';
import Condition from './Condition';

const CarDetailsMainMobile = ({
  carDetails,
  id,
  cardRef,
  isSaved,
  setIsSaved,
  isAuthenticated,
  handleReserve,
  handleMakeOffer,
  isReserving,
  offerMade,
  showOfferPopup,
  setShowOfferPopup,
  handleSubmitOffer,
  showOfferSubmittedPopup,
  handleCloseOfferSubmittedPopup,
  showReservationPopup,
  handleCloseReservationPopup,
  saveListing,
  unsaveListing,
  toast
}) => {

  return (
    <div className="bg-c-grey overflow-x-hidden w-full">
      {/* Breadcrumb Navigation */}
     

      {/* Image Carousel - Full Width */}
      <div className="relative w-full">
        <ImageCarouselMobile id={id} />
        {/* Back Arrow */}
        <div className="absolute top-4 left-4 z-20">
          <div 
            onClick={() => window.history.back()}
            className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-sm"
          >
            <img src="/back-button-vector-mobile.svg" alt="Back" className="w-5 h-5" />
          </div>
        </div>
        {/* Save Heart */}
        <div className="absolute top-4 right-4 z-20">
          <div
            onClick={async () => {
              if (!isAuthenticated) {
                window.location.href = `${import.meta.env.VITE_LANDING_URL}/login`;
                return;
              }
              try {
                if (isSaved) {
                  await unsaveListing(carDetails.id);
                  setIsSaved(false);
                  toast.success('Listing unsaved successfully!');
                } else {
                  await saveListing(carDetails.id);
                  setIsSaved(true);
                  toast.success('Listing saved successfully!');
                }
              } catch (error) {
                console.error('Error saving/unsaving listing:', error);
                toast.error(`Failed to ${isSaved ? 'unsave' : 'save'} listing: ${error.message}`);
              }
            }}
            className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
          >
                        <img 
               src={isSaved ? "/favorite-icon-vector-mobile-red.svg?v=1" : "/favorite-icon-vector-mobile.svg"} 
               alt="Save" 
               className="w-5 h-5"
             />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="bg-stone-200 min-h-screen overflow-x-hidden w-full max-w-full">
        <div className="flex flex-col w-full max-w-full overflow-x-hidden">

          {/* Car Info Card */}
          <div ref={cardRef} className="bg-stone-50 p-4 relative min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="flex justify-between items-start px-4 min-w-0">
                  <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold break-words">{carDetails.brand_name}</div>
                  {/* Truncate long model names for mobile, show full value in title */}
                  <p
                    className="text-sm text-gray-600 max-w-full"
                    title={carDetails.model}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word'
                    }}
                  >
                    {carDetails.model}
                  </p>
                </div>
                {carDetails.logo_filename && (
                  <img src={`/brand-logos/${carDetails.logo_filename}`} alt="Logo" className="w-10 h-10 object-contain" />
                )}
              </div>

              <div className="w-full h-[1px] bg-gray-200"></div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-4 px-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src="/car-detail-mileage.svg" alt="Mileage" className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm font-medium text-black break-words min-w-0">{carDetails.km_stand?.toLocaleString() || '0'} km</span>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <img src="/car-detail-transmisson.svg" alt="Transmission" className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm font-medium text-black break-words min-w-0">{carDetails.transmission_type || 'Automatic'}</span>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <img src="/car-detail-fuel.svg" alt="Fuel" className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm font-medium text-black break-words min-w-0">{carDetails.fuel_type || 'Diesel'}</span>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <img src="/seat.svg" alt="Seats" className="w-6 h-6 flex-shrink-0" />
                  <span className="text-sm font-medium text-black break-words min-w-0">{carDetails.seat || '5'} seats</span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gray-200"></div>
            </div>


          </div>

          {/* Free Delivery */}
          {/* <div className="bg-stone-50 p-4">
            <div className="flex items-center gap-4 pl-4">
              <img src="/green-truck.svg" alt="green-truck" className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-md text-black font-semibold">Free delivery included</p>
                  <p className="text-sm text-gray-500">Hassle-free transport included in your purchase price.</p>
              </div>
            </div>
          <div className="mt-8 h-[1px] bg-gray-200"></div>
          </div> */}

{/* Belgium Price Section - Hidden */}

          {/* Overview */}
          <div className="bg-stone-50 p-4 w-full max-w-full overflow-x-hidden">
            <div className="text-lg font-semibold text-black mb-4 px-4">Overview</div>
            <div className="w-full max-w-full overflow-x-hidden">
              <Overview carDetails={carDetails} />
            </div>
          </div>
          
          {/* Equipment */}
          <div className="bg-stone-50 p-4 w-full max-w-full overflow-x-hidden">
              <div className="h-[1px] bg-gray-200 mb-4"></div>
            <div className="text-lg font-semibold text-black mb-4 px-4">Equipment</div>
            <div className="w-full max-w-full overflow-x-hidden">
              <Equipment carDetails={carDetails} />
            </div>

          </div>
          
          {/* Condition */}
          <div className="bg-stone-50 p-4 mb-28 w-full max-w-full overflow-x-hidden">
              <div className="h-[1px] bg-gray-200 mb-4"></div>
            <div className="text-lg font-semibold text-black mb-4 px-4">Condition Report</div>
            <div className="w-full max-w-full overflow-x-hidden">
              {/* thin grey line  */}
              <Condition />
            </div>
          </div>

           {/* Sales Person */}
           {/* <div className="bg-stone-50 px-10 pb-10 mb-28">
            <div className="flex justify-between items-center gap-4 mb-6">
                             <div className="text-start">
                 <p className="text-base text-black font-semibold">Mike Lorem</p>
                 <p className="text-sm text-gray-500">test@example.com</p>
               </div>
               <img src="/MikeLorem.png" alt="sales-person" className="w-12 h-12 rounded-full" />
             </div>
             
             <div className="flex gap-3">
               <div className="flex-1 flex items-center gap-2">
                 <img src="/whatsapp.svg" alt="whatsapp" className="w-8 h-8" />
               </div>
               <div className="flex-1 flex items-center gap-2">
                 <img src="/phone.svg" alt="phone" className="w-8 h-8" />
               </div>
            </div>
          </div> */}
        </div>
      </main>

      {/* Sticky Bottom Container with Price and Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-40 w-full max-w-full overflow-x-hidden">
        {/* Time remaining - Hidden */}

        {/* Price and Buttons Row */}
        <div className="flex items-center p-4 px-4 w-full max-w-full overflow-x-hidden">
          <div className="flex-1">
            <p className="text-xs text-gray-500">
              Price {carDetails.vat_or_margin}
            </p>
            <p className="text-xl ">€{Number(carDetails.listing_price).toLocaleString()}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {isAuthenticated ? (
              <>
                <ProtectedAction onAction={handleMakeOffer}>
                  <button 
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      offerMade 
                        ? 'text-gray-400 border border-gray-400 cursor-not-allowed bg-white' 
                        : 'text-white bg-c-red-dark hover:bg-c-red-dark'
                    }`}
                    disabled={offerMade}
                  >
                    {offerMade ? 'Offer Made' : 'Offer'}
                  </button>
                </ProtectedAction>
                
                <ProtectedAction onAction={handleReserve}>
                  <button 
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      isReserving ? 'opacity-75 cursor-not-allowed bg-c-red-dark text-white' : 'bg-c-red-dark text-white hover:bg-c-red-dark'
                    }`}
                    disabled={isReserving}
                  >
                    {isReserving ? 'Reserving...' : 'Reserve'}
                  </button>
                </ProtectedAction>
              </>
            ) : (
              <>
                <button 
                  onClick={() => window.location.href = `${import.meta.env.VITE_LANDING_URL}/login`}
                  className="px-6 py-3 text-sm font-medium transition-colors text-white bg-c-red-dark hover:bg-c-red-dark"
                >
                  Offer
                </button>
                
                <button 
                  onClick={() => window.location.href = `${import.meta.env.VITE_LANDING_URL}/login`}
                  className="px-6 py-3 text-sm font-medium transition-colors bg-c-red-dark text-white hover:bg-c-red-dark"
                >
                  Reserve
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Offer popup */}
      {showOfferPopup && (
        <MakeOfferPopup
          onClose={() => setShowOfferPopup(false)}
          onSubmit={handleSubmitOffer}
          listingPrice={Number(carDetails.listing_price)}
        />
      )}

      {/* Offer submitted popup */}
      {showOfferSubmittedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center md:items-center z-50">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-sm relative">
            <button
              onClick={handleCloseOfferSubmittedPopup}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
            
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <img src="/offer-made-icon.svg" alt="Offer Made" className="w-12 h-12" />
              </div>
              
              <div className="space-y-3 text-gray-600">
                <p className="text-xs">
                  Your offer has been successfully submitted.
                </p>
                <p className="text-xs">
                  You will be notified by email and in your dashboard once there is an update regarding your offer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation popup */}
      {showReservationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center md:items-center z-50">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-sm relative">
            <button
              onClick={handleCloseReservationPopup}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold w-5 h-5 flex items-center justify-center"
            >
              ×
            </button>
            
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <img src="/reserved-icon.svg" alt="Reserved" className="w-12 h-12" />
              </div>
              
              <div className="space-y-3 text-gray-600">
                <p className="text-xs">This vehicle has now been reserved for you.</p>
                <p className="text-xs">One of our team members will reach out to the seller to finalize the purchase.</p>
                <p className="text-xs">Once the deal is confirmed, you will receive a notification via email as well as in your dashboard</p>
                <p className="text-xs">Thank you for choosing AutoMarket for your automotive needs.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetailsMainMobile; 