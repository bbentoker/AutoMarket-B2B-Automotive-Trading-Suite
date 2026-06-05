import React from 'react';
import PropTypes from 'prop-types';
import ImageCarousel from './ImageCarousel';
import SimilarListings from './SimilarListings';
import { ProtectedAction } from './ProtectedAction';
import MakeOfferPopup from './MakeOfferPopup';
import Overview from './Overview';
import Equipment from './Equipment';
import Condition from './Condition';
import { useTranslation } from '../i18n';

const CarDetailsMain = ({
  carDetails,
  id,
  activeTab,
  setActiveTab,
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

  const { t } = useTranslation();

  if (!carDetails) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="bg-c-grey border-2 border-gray-200 flex flex-col items-center">
      <div className="ml-56 w-3/4 flex">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto pl-8 py-4 ml-20 bg-gray-100 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{t('carDetails.home')}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            
            <span>{t('carDetails.shopCars')}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            
            <span>{carDetails.brand_name}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            
            <span>{carDetails.model.split(' ')[0]} {t('carDetails.series')}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pr-96 mr-8 bg-gray-100 rounded-xl py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">{t('common.stockId')}</span>
          <div className="text-sm font-medium text-gray-900 bg-gray-200 px-3 py-1 rounded whitespace-nowrap">
            {carDetails.reference_no}
          </div>
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
                  toast.success(t('carDetails.listingUnsavedSuccessfully'));
                } else {
                  await saveListing(carDetails.id);
                  setIsSaved(true);
                  toast.success(t('carDetails.listingSavedSuccessfully'));
                }
              } catch (error) {
                console.error('Error saving/unsaving listing:', error);
                toast.error(`${isSaved ? t('carDetails.failedToUnsaveListing') : t('carDetails.failedToSaveListing')} ${error.message}`);
              }
            }}
            className={`flex items-center justify-center gap-1 text-sm cursor-pointer transition-colors px-5 py-1 rounded bg-gray-200 text-gray-900 hover:text-gray-800`}
          >
            <span className={`${isSaved ? 'text-c-red-dark' : 'text-gray-900'}`}>
              {isSaved ? t('common.saved') : t('common.save')}
            </span>
            <img src={isSaved ? '/saved.svg' : '/save-icon.svg'} alt="Save" className="w-4 h-4" />
          </div>
        </div>
      </div>
      </div>

      {/* Registration Number Save Section */}
      

      {/* Main Content */}
      <main className="w-full pt-8 px-8 bg-stone-200">
        <div className="w-full max-w-7xl mx-auto pb-8">
          <div className="flex gap-6">
            <div className="w-7/12 space-y-4">
              <div className="bg-stone-50 p-3 py-3 rounded-xl select-none">
                <ImageCarousel id={id} />
              </div>
              
              {/* Tab buttons */}
              <div className="bg-stone-50 px-4 py-3 rounded-xl">
                <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-3 font-medium transition-colors border-none focus:border-none hover:border-none ${
                        activeTab === 'overview'
                          ? 'bg-c-red-dark text-white rounded-xl'
                          : 'text-gray-600 rounded-xl'
                      }`}
                    >
                      {t('common.overview')}
                    </button>
                    <button
                      onClick={() => setActiveTab('equipment')}
                      className={`px-6 py-3 font-medium transition-colors border-none focus:border-none hover:border-none ${
                        activeTab === 'equipment'
                          ? 'bg-c-red-dark text-white rounded-xl'
                          : 'text-gray-600 rounded-xl'
                      }`}
                    >
                      {t('common.equipment')}
                    </button>
                    <button
                      onClick={() => setActiveTab('condition')}
                      className={`px-6 py-3 font-medium transition-colors border-none focus:border-none hover:border-none ${
                        activeTab === 'condition'
                          ? 'bg-c-red-dark text-white rounded-xl'
                          : 'text-gray-600 rounded-xl'
                      }`}
                    >
                      {t('common.conditionReport')}
                    </button>
                </div>
              </div>
              
              {/* Tab content */}
              <div>
                {activeTab === 'overview' && <Overview carDetails={carDetails} />}
                {activeTab === 'equipment' && <Equipment carDetails={carDetails} />}
                {activeTab === 'condition' && <Condition />}
              </div>
              
              {/* Similar listings */}
              <div>
                <SimilarListings currentCar={carDetails} />
              </div>
            </div>

            {/* Right side card */}
            <div className="relative w-[30%]">
              {/* Main card */}
              <div ref={cardRef} className="bg-stone-50 w-full p-6 rounded-xl h-fit relative z-10 min-w-0">
                <div className="space-y-4 min-w-0">
                  <div className="w-full flex justify-between items-center min-w-0">
                    <div className="flex flex-col justify-between items-start min-w-0 flex-1">
                      <div className="text-xl font-semibold break-words">{carDetails.brand_name}</div>
                      <p className="text-md text-gray-600 break-words">{carDetails.model}</p>
                    </div>

                    <div className="w-fit h-fit mr-2">
                      {carDetails.logo_filename ? (
                        <img src={`/brand-logos/${carDetails.logo_filename}`} alt="Logo" className="max-w-14 max-h-14 object-contain" />
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-gray-200 my-2"></div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                        <img src="/car-detail-mileage.svg" alt="Mileage" className="w-6 h-6" />
                      </div>
                      <span className="text-base text-black break-words min-w-0">{carDetails.km_stand?.toLocaleString() || '0'} {t('common.km')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                        <img src="/car-detail-transmisson.svg" alt="Transmission" className="w-6 h-6" />
                      </div>
                      <span className="text-base text-black break-words min-w-0">{carDetails.transmission_type || t('common.automatic')}</span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                        <img src="/car-detail-fuel.svg" alt="Fuel" className="w-6 h-6" />
                      </div>
                      <span className="text-base text-black break-words min-w-0">{carDetails.fuel_type || t('common.diesel')}</span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                        <img src="/seat.svg" alt="Seats" className="w-6 h-6" />
                      </div>
                      <span className="text-base text-black break-words min-w-0">{carDetails.seat || '5'} {t('common.seats')}</span>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-gray-200 my-2"></div>

                  <div className="pt-1 pl-2 flex justify-between items-center">
                    <p className="text-base pt-2 text-gray-500">
                      {t('common.price')} {carDetails.vat_or_margin}
                    </p>
                    <p className="text-xl">€{Number(carDetails.listing_price).toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    {isAuthenticated ? (
                      <>
                        <ProtectedAction onAction={handleReserve}>
                          <button 
                            className={`w-full bg-c-red-dark text-white py-2.5 rounded-full font-medium transition-colors ${
                              isReserving ? 'opacity-75 cursor-not-allowed' : 'hover:bg-c-red-dark'
                            }`}
                            disabled={isReserving}
                          >
                            {isReserving ? t('common.reserving') : t('common.reserve')}
                          </button>
                        </ProtectedAction>
                        
                        <ProtectedAction onAction={handleMakeOffer}>
                          <button 
                            className={`w-full border-1 bg-stone-50 border-c-red py-2.5 rounded-full font-medium transition-colors ${
                              offerMade 
                                ? 'text-gray-400 border-gray-400 cursor-not-allowed' 
                                : 'text-c-red hover:bg-c-red/10'
                            }`}
                            disabled={offerMade}
                          >
                            {offerMade ? `${t('common.offerMade')}: €${Number(offerMade.amount).toLocaleString()}` : t('common.makeAnOffer')}
                          </button>
                        </ProtectedAction>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => window.location.href = `${import.meta.env.VITE_LANDING_URL}/login`}
                          className="w-full bg-c-red-dark text-white py-2.5 rounded-full font-medium transition-colors hover:bg-c-red-dark"
                        >
                          {t('common.reserve')}
                        </button>
                        
                        <button 
                          onClick={() => window.location.href = `${import.meta.env.VITE_LANDING_URL}/login`}
                          className="w-full border-1 bg-stone-50 border-c-red text-c-red py-2.5 rounded-full font-medium transition-colors hover:bg-c-red/10"
                        >
                          {t('common.makeAnOffer')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
{/* Remaining time - Hidden */}
              
              {/* Free delivery */}
              {/* <div className="mt-12 w-full bg-stone-50 rounded-xl p-4">
                <div className="flex gap-3">
                  <img src="/green-truck.svg" alt="green-truck" className="w-10 h-10" />
                  <div className="flex-col gap-2 ml-2">
                    <p className="text-sm text-black font-semibold">Free delivery included</p>
                    <p className="text-sm text-gray-500">Hassle-free transport included in your purchase price.</p>
                  </div>
                </div>
              </div>
               */}
{/* Belgium Price Section - Hidden */}
              {/* Sales Person */}
              {/* <div className="mt-4 w-full bg-stone-50 rounded-xl p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-5 pl-2">
                    <img src="/MikeLorem.png" alt="sales-person" className="w-12 h-12 rounded-full p-[1px] border-[1px] border-c-red" />
                    <div>
                      <p className="text-sm text-black font-semibold">Mike Lorem</p>
                      <p className="text-sm text-gray-500">test@example.com</p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-gray-200 my-2"></div>
                  <div className="flex">
                    <div className="w-1/2 flex items-center gap-2">
                      <img src="/whatsapp.svg" alt="whatsapp" className="w-10 h-10" />
                      <p className="text-sm text-black font-semibold">+88-123456789</p>
                    </div>
                    <div className="w-1/2 flex items-center gap-2">
                      <img src="/phone.svg" alt="phone" className="w-10 h-10" />
                      <p className="text-sm text-black font-semibold">+88-123456789</p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </main>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 relative">
            <button
              onClick={handleCloseOfferSubmittedPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
            
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <img src="/offer-made-icon.svg" alt="Offer Made" className="w-16 h-16" />
              </div>
              
              <div className="space-y-4" style={{ color: 'rgba(144, 163, 191, 1)' }}>
                <p className="text-sm">
                  {t('carDetails.yourOfferSubmitted')}
                </p>
                <p className="text-sm">
                  {t('carDetails.offerNotification')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation popup */}
      {showReservationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 relative">
            <button
              onClick={handleCloseReservationPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
            
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <img src="/reserved-icon.svg" alt="Reserved" className="w-16 h-16" />
              </div>
              
              <div className="space-y-4" style={{ color: 'rgba(144, 163, 191, 1)' }}>
                <p className="text-sm">
                  {t('carDetails.vehicleReserved')}
                </p>
                <p className="text-sm">
                  {t('carDetails.teamWillReachOut')}
                </p>
                <p className="text-sm">
                  {t('carDetails.dealConfirmed')}
                </p>
                <p className="text-sm">
                  {t('carDetails.thankYouForChoosing')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetailsMain; 