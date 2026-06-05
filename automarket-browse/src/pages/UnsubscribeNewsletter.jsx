import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ui/toast';
import { unsubscribeNewsletter } from '../services/api';
import { trackNewsletterActivity } from '../utils/newsletterTracker';
import Header from '../components/Header';
import HeaderMobile from '../components/HeaderMobile';
import { Footer } from '../components/Footer';
import { FooterMobile } from '../components/FooterMobile';

export default function UnsubscribeNewsletter() {
  const { contactId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const { toast } = useToast();
  const newsletterProcessedRef = useRef(false);

  useEffect(() => {
    const handleUnsubscribeAndTracking = async () => {
      try {
        // Track newsletter activity if newsletter_id is present (without listing_id)
        await trackNewsletterActivity(searchParams, setSearchParams, null, newsletterProcessedRef);
        
        // Proceed with unsubscribe
        await unsubscribeNewsletter(contactId);
        setStatus('success');
        toast({
          title: 'Successfully unsubscribed',
          description: 'You have been unsubscribed from our newsletter.',
          type: 'success',
        });
      } catch (error) {
        setStatus('error');
        toast({
          title: 'Error',
          description: 'Failed to unsubscribe from newsletter. Please try again later.',
          type: 'error',
        });
      }
    };

    if (contactId) {
      handleUnsubscribeAndTracking();
    }
  }, [contactId, searchParams, setSearchParams, toast]);

  const ContentSection = () => (
    <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Newsletter Unsubscribe
          </h2>
          <div className="mt-4 text-center">
            {status === 'processing' && (
              <p className="text-gray-600">Processing your unsubscribe request...</p>
            )}
            {status === 'success' && (
              <p className="text-green-600">You have been successfully unsubscribed from our newsletter.</p>
            )}
            {status === 'error' && (
              <p className="text-red-600">There was an error processing your request. Please try again later.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-screen bg-c-grey text-black overflow-x-hidden flex flex-col">
      {/* Desktop Version */}
      <div className="hidden md:flex md:flex-col md:min-h-screen">
        <Header />
        <ContentSection />
    
      </div>

      {/* Mobile Version */}
      <div className="flex md:hidden flex-col min-h-screen">
        <HeaderMobile />
        <ContentSection />
      
      </div>
    </div>
  );
} 