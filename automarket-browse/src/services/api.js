/**
 * API service for car listings
 */

import { getToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Handles API errors and returns a formatted error object
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed error response
 */
const handleApiError = async (response) => {
  if (response.status === 404) {
    throw new Error('Resource not found');
  }
  
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  } catch (error) {
    throw new Error('An unexpected error occurred',error.message);
  }
};

/**
 * Converts filters object to URL query string
 * @param {Object} filters - Filter parameters
 * @returns {string} URL query string
 */
const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  
  // Only add parameters that have values
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, value);
      }
    }
  });
  
  return params.toString();
};

// Helper function to get headers with auth token if it exists
const getHeaders = (additionalHeaders = {}) => {
  const headers = {
    'Accept': 'application/json',
    ...additionalHeaders
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Fetches car listings with filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.brand - Car brand
 * @param {string} filters.model - Car model
 * @param {string} filters.year - Car year
 * @param {string} filters.mileage - Mileage range
 * @param {Object} filters.price - Price range with min and max
 * @param {string} filters.bodyType - Body type
 * @param {string} filters.transmission - Transmission type
 * @param {string} filters.fuelType - Fuel type
 * @param {string} filters.doors - Number of doors
 * @param {string} filters.seats - Number of seats
 * @param {string} filters.color - Car color
 * @returns {Promise<Array>} Array of car listings
 */
export const fetchListings = async (filters) => {
  try {
    const queryString = buildQueryString(filters);
    const url = `${API_BASE_URL}/users/fetch-listings${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const getCarListing = async (id) => {
  try {
    // Use different endpoints based on authentication status
    const endpoint = getToken() 
      ? `/users/get-listing/${id}`
      : `/users/get-listing-basic/${id}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching car listing:', error);
    throw error;
  }
};

export const getCarPhotos = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/get-listing/${id}/photos`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching car photos:', error);
    throw error;
  }
};

export const getCarListingDamagedParts = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/get-listing/${id}/damaged-parts`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching car listing damaged parts:', error);
    throw error;
  }
};

export const makeOffer = async (listingId, offerAmount) => {
  if (!getToken()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/make-offer`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        listing_id: listingId,
        offer: offerAmount
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to make offer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error making offer:', error);
    throw error;
  }
};

export const reserveListing = async (listingId) => {
  if (!getToken()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/reserve-listing`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        listing_id: listingId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reserve listing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reserving listing:', error);
    throw error;
  }
};

export const getSimilarListings = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/get-similar-listings/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch similar listings');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch similar listings');
  }
};

export const addUserActivity = async (userId, listingId,type) => {
  if (!getToken()) {
    // Skip if not authenticated
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/add-activity`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        user_id: userId,
        listing_id: listingId,
        type: type
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding user activity:', error);
    // Don't throw error as this is not critical functionality
  }
};

/**
 * Adds newsletter activity for a listing
 * @param {string} listingId - The ID of the listing
 * @param {string} newsletterId - The ID of the newsletter
 * @returns {Promise<Object>} API response
 */
export const addNewsletterActivity = async (listingId, newsletterId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/add-newsletter-activity`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        listing_id: listingId || null,
        newsletter_id: newsletterId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add newsletter activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding newsletter activity:', error);
    // Don't throw error as this is not critical functionality
  }
};

/**
 * Adds weekly report activity for a listing
 * @param {string} listingId - The ID of the listing
 * @param {string} reportId - The ID of the weekly report
 * @returns {Promise<Object>} API response
 */
export const addWeeklyReportActivity = async (listingId, reportId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/add-weekly-report-activity`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        listing_id: listingId,
        report_id: reportId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add weekly report activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding weekly report activity:', error);
    // Don't throw error as this is not critical functionality
  }
};

export const saveListing = async (listingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/save-listing`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        listing_id: listingId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save listing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving listing:', error);
    throw error;
  }
};

export const unsaveListing = async (listingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/unsave-listing`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        listing_id: listingId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unsave listing');
    }

    return await response.json();
  } catch (error) {
    console.error('Error unsaving listing:', error);
    throw error;
  }
};

export const changeLanguage = async (languageCode) => {
  if (!getToken()) {
    // Skip if not authenticated
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/change-language`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        language: languageCode
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change language');
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing language:', error);
    // Don't throw error as this is not critical functionality
  }
};

export const unsubscribeNewsletter = async (contactId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/unsubscribe-newsletter`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ contact_id: contactId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unsubscribe from newsletter');
    }

    return await response.json();
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    throw error;
  }
};

export const submitDealerLoginCode = async (loginCode) => {
  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/api$/, '') }/auth/dealer/login-code`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        code: loginCode
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit dealer login code');
    }

    const data = await response.json();
    console.log('Login code response:', data);
    return data;
  } catch (error) {
    console.error('Error submitting dealer login code:', error);
    throw error;
  }
};

export default {
  fetchListings,
  getCarListing,
  getCarPhotos,
  getCarListingDamagedParts,
  makeOffer,
  reserveListing,
  addUserActivity,
  saveListing,
  unsaveListing,
  changeLanguage,
  submitDealerLoginCode,
  addWeeklyReportActivity
}; 