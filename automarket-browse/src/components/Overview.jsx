import React from 'react';
import { useTranslation } from '../i18n';

const Overview = ({carDetails}) => {
  const { t } = useTranslation();
  if(!carDetails) return null;
  return (
    <div>
      {/* Hide General Features icons in mobile */}
      <div className="hidden md:block bg-stone-50 p-6 rounded-xl">
      <div className="text-xl font-semibold  mb-4 ">{t('overview.generalFeatures')}</div>
                                  <div className="grid grid-cols-4 gap-4 overflow-hidden rounded-xl">
                    <div className="flex flex-col items-center bg-stone-100 p-6 rounded-none min-h-[120px]">
                      <div className="flex-1 flex items-end pb-2">
                        <img src="/km-grey.svg" alt={t('common.mileage')} className="w-12 h-12 filter grayscale flex-shrink-0" />
                      </div>
                      <div className="flex-1 flex items-start pt-2">
                        <span className="text-base text-gray-600 text-center">{carDetails.km_stand?.toLocaleString() || '0'} {t('common.km')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-stone-100 p-6 rounded-none min-h-[120px]">
                      <div className="flex-1 flex items-end pb-2">
                        <img src="/transmission-grey.svg" alt={t('overview.transmission')} className="w-12 h-12 filter grayscale flex-shrink-0" />
                      </div>
                      <div className="flex-1 flex items-start pt-2">
                        <span className="text-base text-gray-600 text-center">{carDetails.transmission_type || t('common.automatic')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-stone-100 p-6 rounded-none min-h-[120px]">
                      <div className="flex-1 flex items-end pb-2">
                        <img src="/fuel-grey.svg" alt={t('overview.fuel')} className="w-12 h-12 filter grayscale flex-shrink-0" />
                      </div>
                      <div className="flex-1 flex items-start pt-2">
                        <span className="text-base text-gray-600 text-center">{carDetails.fuel_type || t('common.diesel')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-stone-100 p-6 rounded-none min-h-[120px]">
                      <div className="flex-1 flex items-end pb-2">
                        <img src="/seat-grey.svg" alt={t('overview.seats')} className="w-12 h-12 filter grayscale flex-shrink-0" />
                      </div>
                      <div className="flex-1 flex items-start pt-2">
                        <span className="text-base text-gray-600 text-center">{carDetails.seat || '7'} {t('common.seats')}</span>
                      </div>
                    </div>
                  </div>
      </div>

    <div className="mt-4  bg-stone-50 px-4 rounded-xl w-full max-w-full overflow-x-hidden">
              {/* feats */}
              <div className="bg-stone-50  rounded-xl mt-4 w-full max-w-full">
                <div className="divide-y divide-gray-200 w-full">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('common.brand')}</span>
                    </div>
                    <span className="text-right">{carDetails.brand_name}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('common.model')}</span>
                    </div>
                    <span className="text-right sm:text-right mt-1 sm:mt-0 min-w-0 break-words" title={carDetails.model}>{carDetails.model}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.firstRegistration')}</span>
                    </div>
                    <span className="text-right">{new Date(carDetails.first_registration).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.horsepower')}</span>
                    </div>
                    <span className="text-right">{carDetails.horsepower || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.odometer')}</span>
                    </div>
                    <span className="text-right">{carDetails.km_stand?.toLocaleString()} {t('common.km')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.transmission')}</span>
                    </div>
                    <span className="text-right">{carDetails.transmission_type}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.fuel')}</span>
                    </div>
                    <span className="text-right">{carDetails.fuel_type}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.exteriorColor')}</span>
                    </div>
                    <span className="text-right">{carDetails.color || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.interiorColor')}</span>
                    </div>
                    <span className="text-right">{carDetails.interior_color || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.seats')}</span>
                    </div>
                    <span className="text-right">{carDetails.seat || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.engine')}</span>
                    </div>
                    <span className="text-right">{carDetails.engine || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.drivetrain')}</span>
                    </div>
                    <span className="text-right">{carDetails.drivetrain || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.trimPackage')}</span>
                    </div>
                    <span className="text-right">{carDetails.trim_package || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.vehicleCategory')}</span>
                    </div>
                    <span className="text-right">{carDetails.vehicle_category || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.vinNumber')}</span>
                    </div>
                    <span className="text-right">{carDetails.vin_number || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.vehicleLocation')}</span>
                    </div>
                    <span className="text-right">{carDetails.location || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.serviceHistory')}</span>
                    </div>
                    <span className="text-right">{carDetails.service_history || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.numberOfOwners')}</span>
                    </div>
                    <span className="text-right">{carDetails.number_of_owners || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('common.stockId')}</span>
                    </div>
                    <span className="text-right">{carDetails.reference_no || t('overview.na')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{t('overview.previousAccidents')}</span>
                    </div>
                    <span className="text-right">{carDetails.previous_accidents ? t('overview.yes') : t('overview.no')}</span>
                  </div>

                  
                </div>
              </div>
    </div>
    </div>
  );
};

export default Overview; 