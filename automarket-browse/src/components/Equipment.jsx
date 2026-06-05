import React from 'react';
import { useTranslation } from '../i18n';

const Equipment = ({ carDetails }) => {
  const { t } = useTranslation();
  if (!carDetails.features) return null;
  const equipments = carDetails.features.split(',').filter((e) => e.trim() !== 'PLEASE CALL BEFORE VIEWING');
  return (
    <div className="bg-stone-50 px-4 rounded-xl w-full max-w-full overflow-x-hidden">
      {/* Equipment details */}
      <div className="bg-stone-50 pt-4 rounded-xl mt-4 w-full max-w-full">
      <div className="hidden md:block my-2 mb-2">
        <div className="text-lg font-semibold ">{t('common.equipment')}</div>
      </div>
        <div className="flex flex-col divide-y divide-gray-200">
          {/* Mobile: 1 item per row, Desktop: 2 items per row */}
          <div className="md:hidden">
            {equipments.map((equipment, index) => (
              <div key={index} className="flex items-start gap-2 py-3">
                <img src="/green-tick-icon.svg" alt="tick" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{equipment.trim()}</span>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            {Array.from({ length: Math.ceil(equipments.length / 2) }, (_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2 gap-4 py-3">
                {equipments.slice(rowIndex * 2, rowIndex * 2 + 2).map((equipment, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <img src="/green-tick-icon.svg" alt="tick" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{equipment.trim()}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Equipment; 