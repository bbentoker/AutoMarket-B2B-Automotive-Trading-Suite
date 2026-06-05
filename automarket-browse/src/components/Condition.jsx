import DamagedParts from './DamagedParts';
import DamagedPartsMobile from './DamagedPartsMobile';
import { useTranslation } from '../i18n';

const Condition = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-stone-50 p-6 rounded-xl w-full max-w-full overflow-x-hidden">    
      {/* this shouldnt be in mobile view */}
      <div className="hidden md:block">
        
        <div className="text-lg font-semibold mb-4 pl-4">{t('condition.conditionReport')}</div>
      </div>
      
      {/* Desktop version */}
      <div className="hidden md:block">
        <DamagedParts />
      </div>
      
      {/* Mobile version */}
      <div className="block md:hidden w-full max-w-full overflow-x-hidden">
        <DamagedPartsMobile />
      </div>
      
      <div className="flex w-full justify-center items-center">
        <div className="text-sm text-gray-500">
        {t('condition.hoverHint')}
        </div>
        {/* on mobile add a thin grey line */}
         </div>
        <div className="w-full h-[1px] bg-gray-200 mt-4 block md:hidden"></div>
    </div>
  );
};

export default Condition; 