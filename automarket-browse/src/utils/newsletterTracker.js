/**
 * Global newsletter tracking utility
 * Handles newsletter_id parameter tracking across all pages
 */

import { addNewsletterActivity } from '../services/api';

/**
 * Tracks newsletter activity from URL parameters
 * @param {URLSearchParams} searchParams - Current URL search parameters
 * @param {Function} setSearchParams - Function to update URL search parameters
 * @param {string|null} listingId - Optional listing ID (null for browse pages)
 * @param {React.MutableRefObject} processedRef - Ref to track if newsletter has been processed
 * @returns {Promise<void>}
 */
export const trackNewsletterActivity = async (searchParams, setSearchParams, listingId = null, processedRef = null) => {
  try {
    // Check for newsletter_id parameter only if we haven't processed it yet
    const newsletterId = searchParams.get('newsletter_id');
    
    // If newsletter_id exists and we haven't processed it, remove it from URL and track the activity
    if (newsletterId && (!processedRef || !processedRef.current)) {
      // Mark as processed to prevent duplicate tracking
      if (processedRef) {
        processedRef.current = true;
      }
      
      // Remove newsletter_id from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('newsletter_id');
      setSearchParams(newSearchParams, { replace: true });
      
      // Track newsletter activity (with or without listing_id)
      await addNewsletterActivity(listingId, newsletterId);
      
      console.log(`Newsletter activity tracked: newsletter_id=${newsletterId}, listing_id=${listingId || 'none'}`);
      
      return true; // Indicates newsletter was tracked
    }
    
    return false; // No newsletter to track
  } catch (error) {
    console.error('Error tracking newsletter activity:', error);
    // Don't throw error as this is not critical functionality
    return false;
  }
};

/**
 * Hook-like utility for newsletter tracking in functional components
 * @param {URLSearchParams} searchParams - Current URL search parameters
 * @param {Function} setSearchParams - Function to update URL search parameters
 * @param {string|null} listingId - Optional listing ID
 * @returns {Object} Object with tracking function and processed state management
 */
export const useNewsletterTracker = (searchParams, setSearchParams, listingId = null) => {
  const processedRef = { current: false };
  
  const trackNewsletter = async () => {
    return await trackNewsletterActivity(searchParams, setSearchParams, listingId, processedRef);
  };
  
  return {
    trackNewsletter,
    processedRef
  };
};

export default {
  trackNewsletterActivity,
  useNewsletterTracker
};
