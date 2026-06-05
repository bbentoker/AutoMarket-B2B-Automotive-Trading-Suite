import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ui/toast';
import Header from '../components/Header';
import HeaderMobile from '../components/HeaderMobile';
import CarDetailsMain from '../components/CarDetailsMain';
import CarDetailsMainMobile from '../components/CarDetailsMainMobile';
import { getCarListing, makeOffer, reserveListing, addUserActivity, saveListing, unsaveListing, addWeeklyReportActivity } from '../services/api';
import { trackNewsletterActivity } from '../utils/newsletterTracker';
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/Footer';
import { FooterMobile } from '../components/FooterMobile';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [carDetails, setCarDetails] = useState(null);
  const [offerMade, setOfferMade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [showOfferSubmittedPopup, setShowOfferSubmittedPopup] = useState(false);
  const [showReservationPopup, setShowReservationPopup] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [cardHeight, setCardHeight] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const cardRef = useRef(null);
  const newsletterProcessedRef = useRef(false);
  const weeklyReportProcessedRef = useRef(false);
  
  // Offset from the bottom of the card (negative value to overlap)
  const REMAINING_TIME_OFFSET = -30;

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        // Track newsletter activity if newsletter_id is present (with listing_id)
        await trackNewsletterActivity(searchParams, setSearchParams, id, newsletterProcessedRef);

        // Check for weekly-report-email-id parameter only if we haven't processed it yet
        const weeklyReportId = searchParams.get('weekly-report-email-id');
        
        // If weekly-report-email-id exists and we haven't processed it, remove it from URL and track the activity
        if (weeklyReportId && !weeklyReportProcessedRef.current) {
          weeklyReportProcessedRef.current = true;
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('weekly-report-email-id');
          setSearchParams(newSearchParams, { replace: true });
          
          // Track weekly report activity
          await addWeeklyReportActivity(id, weeklyReportId);
        }
        
        const data = await getCarListing(id);
        console.log(data);
        setCarDetails(data.listing || data);
        setOfferMade(data.offer_made);
        setIsSaved((data.listing || data).is_saved || false);
        setLoading(false);

        // Initialize remaining seconds from remaining_hours
        const totalHours = parseFloat((data.listing || data).remaining_hours || 0);
        const totalSeconds = Math.floor(totalHours * 3600);
        setRemainingSeconds(totalSeconds);

        // Track user activity if user is authenticated
        if (isAuthenticated && user?.id) {
          await addUserActivity(user.id, id,'web click');
        }
      } catch (err) {
        console.error('Error loading car details:', err);
        setError(`Failed to load car details: ${err.message}`);
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id, isAuthenticated, user, searchParams, setSearchParams]);

  // Countdown timer effect
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  // Measure card height when component mounts or updates
  useEffect(() => {
    const measureCardHeight = () => {
      if (cardRef.current) {
        const height = cardRef.current.offsetHeight;
        setCardHeight(height);
      }
    };

    measureCardHeight();
    const timer = setTimeout(measureCardHeight, 100);
    window.addEventListener('resize', measureCardHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureCardHeight);
    };
  }, [carDetails, activeTab]);

  const handleReserve = async () => {
    try {
      setIsReserving(true);
      await reserveListing(id);
      setShowReservationPopup(true);
      const data = await getCarListing(id);
      setCarDetails(data.listing);
    } catch (err) {
      console.error('Error reserving car:', err);
      toast.error(`Failed to reserve car: ${err.message}`);
    } finally {
      setIsReserving(false);
    }
  };

  const handleCloseReservationPopup = () => {
    setShowReservationPopup(false);
    navigate('/');
  };

  const handleMakeOffer = () => {
    setShowOfferPopup(true);
  };

  const handleSubmitOffer = async (offerAmount) => {
    try {
      await makeOffer(id, offerAmount);
      setShowOfferPopup(false);
      setOfferMade({
        amount: offerAmount,
        is_approved: false,
        counter_offer: null,
        created_at: new Date().toISOString()
      });
      setShowOfferSubmittedPopup(true);
    } catch (err) {
      console.error('Error submitting offer:', err);
      toast.error(`Failed to submit offer: ${err.message}`);
    }
  };

  const handleCloseOfferSubmittedPopup = () => {
    setShowOfferSubmittedPopup(false);
    navigate('/');
  };

  // Common props for both desktop and mobile components
  const mainProps = {
    carDetails,
    id,
    activeTab,
    setActiveTab,
    cardRef,
    cardHeight,
    remainingSeconds,
    isSaved,
    setIsSaved,
    isAuthenticated,
    user,
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
    toast,
    REMAINING_TIME_OFFSET
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-stone-100 text-black">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="block md:hidden">
          <HeaderMobile />
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen bg-stone-100 text-black">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="block md:hidden">
          <HeaderMobile />
        </div>
        <div className="text-red-500 text-center mt-8">{error}</div>
      </div>
    );
  }

  if (!carDetails) {
    return (
      <div className="min-h-screen w-screen bg-stone-100 text-black">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="block md:hidden">
          <HeaderMobile />
        </div>
        <div className="text-center text-gray-500 mt-8">No car details found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-c-grey text-black overflow-x-hidden">
      {/* Desktop Version */}
      <div className="hidden md:block">
        <Header />
        <CarDetailsMain {...mainProps} />
        {/* <Footer hideScrollTop={showOfferPopup || showOfferSubmittedPopup || showReservationPopup} /> */}
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden overflow-x-hidden w-full max-w-full">
        <CarDetailsMainMobile {...mainProps} />
        {/* <FooterMobile hideScrollTop={showOfferPopup || showOfferSubmittedPopup || showReservationPopup} /> */}
      </div>
    </div>
  );
};

export default CarDetails; 