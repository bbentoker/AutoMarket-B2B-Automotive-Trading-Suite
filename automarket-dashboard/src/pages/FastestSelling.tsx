import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { WeeklyReport, type WeeklyReportData } from '../components/WeeklyReport';
import apiService from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FastestSelling: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('📊 FastestSelling useEffect - isAuthenticated:', isAuthenticated);
    
    // Only fetch data if user is authenticated
    if (!isAuthenticated) {
      console.log('⏳ User not authenticated yet, skipping API call');
      setIsLoading(false);
      return;
    }

    const fetchWeeklyReport = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching weekly report data...');
        const response = await apiService.getWeeklyReport();
        console.log('✅ Weekly report response:', response);
        console.log('📊 Weekly report data:', response.data);
        if (response && response.data) {
          // Cast the response to ensure we have access to the user language property
          const data = response.data as WeeklyReportData;
          
          // Extract user language from the user data if available
          if ((data as any)?.user?.language) {
            data.userLanguage = (data as any).user.language;
          }
          
          setWeeklyData(data);
        }
      } catch (error) {
        console.error('❌ Error fetching weekly report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyReport();
  }, [isAuthenticated]);

  return (
    <main className="lg:ml-[290px] pt-16 lg:pt-20 min-h-screen" style={{ backgroundColor: '#F4F7FE' }}>
      <div className="p-4 lg:p-8">
        {/* Info Banner */}
      <div className="bg-primary-950 rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden z-0">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-200" fill="currentColor" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Weekly Report</h1>
            </div>
            <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-2xl">
            Your weekly performance overview and insights.
            </p>
      
          </div>
          
          {/* Background Logo */}
          <div className="absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 opacity-90 pt-20">
            <img src="/AutoMarket-banner.svg" alt="" className="w-60  pr-5 pb-5 sm:pr-0 sm:w-32 lg:w-auto" />
          </div>
        </div>
       

        {/* Weekly Report Section */}
        {isLoading || !isAuthenticated ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {!isAuthenticated ? 'Authenticating...' : 'Loading weekly report...'}
              </p>
            </div>
          </div>
        ) : (
          <WeeklyReport weeklyData={weeklyData} />
        )}
      </div>
    </main>
  );
};

export default FastestSelling;