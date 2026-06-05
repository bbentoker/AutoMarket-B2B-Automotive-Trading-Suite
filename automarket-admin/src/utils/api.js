const baseURL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get authentication token
const getAuthToken = () => {
  // First try to get token directly (for backward compatibility)
  let token = localStorage.getItem('token');

  // If not found, try to get from authData
  if (!token) {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsedAuthData = JSON.parse(authData);
        // Handle different token formats
        if (typeof parsedAuthData.token === 'string') {
          token = parsedAuthData.token;
        } else if (parsedAuthData.token && parsedAuthData.token.access_token) {
          token = parsedAuthData.token.access_token;
        } else if (parsedAuthData.token) {
          // If token is an object, try to find any token-like property
          token = parsedAuthData.token.token || parsedAuthData.token;
        }
      } catch (error) {
        console.error('Error parsing authData:', error);
      }
    }
  }

  return token;
};

async function login(email, password) {
  const response = await fetch(`${baseURL}/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

async function registerDealer(dealerData) {
  const response = await fetch(`${baseURL}/auth/dealer/register-complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dealerData),
  });

  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  // }

  return response.json();
}

async function registerScrapedDealer(dealerData) {
  console.log('Making request to register scraped dealer with data:', dealerData);

  const response = await fetch(`${baseURL}/auth/dealer/register-scraped`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dealerData),
  });

  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);

  const data = await response.json();
  console.log('Response data:', data);

  if (!response.ok) {
    console.log('Response not ok, returning error');
    return {
      error: true,
      message: data.error || data.message || `HTTP error! status: ${response.status}`,
    };
  }

  console.log('Response ok, returning success');
  return { success: true, data };
}

// URL detection helper function
function detectUrlType(url) {
  if (url.includes('listingsiteb.example.com')) {
    return 'listingsiteb';
  } else if (url.includes('listingsitea.')) {
    return 'listingsitea';
  } else if (url.includes('listingsitec.example.com')) {
    return 'listingsitec';
  } else if (url.includes('hasznaltauto.hu')) {
    return 'hasznalt';
  } else if (url.includes('sauto.cz')) {
    return 'sauto';
  } else if (url.includes('mobile.de')) {
    return 'mobile';
  }
  return 'unknown';
}

async function fetchListingDataListingSiteB(url) {
  try {
    const response = await fetch(`${baseURL}/api/listings/extract-listing-listingsiteb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    return response.json();
  } catch (error) {
    console.error('Error fetching listing data from ListingSiteB:', error);
    throw error;
  }
}

async function fetchListingDataListingSiteA(url) {
  try {
    const response = await fetch(`${baseURL}/api/listings/extract-listing-listingsitea`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    return response.json();
  } catch (error) {
    console.error('Error fetching listing data from ListingSiteA:', error);
    throw error;
  }
}

async function fetchListingDataListingSiteC(url) {
  try {
    const response = await fetch(`${baseURL}/api/listings/extract-listing-listingsitec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    // Log the response for debugging purposes
    console.log('ListingSiteC API Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('Error fetching listing data from ListingSiteC UAE:', error);
    throw error;
  }
}

async function fetchListingDataHasznalt(url) {
  try {
    const response = await fetch(`${baseURL}/api/listings/extract-listing-hasznaltauto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    // Log the response for debugging purposes
    console.log('Hasznaltauto API Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('Error fetching listing data from Hasznaltauto.hu:', error);
    throw error;
  }
}

async function fetchListingDataSauto(url) {
  try {
    const response = await fetch(`${baseURL}/api/listings/extract-listing-sauto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    // Log the response for debugging purposes
    console.log('Sauto.cz API Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('Error fetching listing data from Sauto.cz:', error);
    throw error;
  }
}

async function fetchListingDataMobile(url) {
  try {
    const response = await fetch(`${baseURL}/api/listings/extract-listing-mobilede`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    // Log the response for debugging purposes
    console.log('Mobile.de API Response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('Error fetching listing data from Mobile.de:', error);
    throw error;
  }
}

async function fetchListingData(url) {
  const urlType = detectUrlType(url);

  switch (urlType) {
    case 'listingsiteb':
      return await fetchListingDataListingSiteB(url);
    case 'listingsitea':
      return await fetchListingDataListingSiteA(url);
    case 'listingsitec':
      return await fetchListingDataListingSiteC(url);
    case 'hasznalt':
      return await fetchListingDataHasznalt(url);
    case 'sauto':
      return await fetchListingDataSauto(url);
    case 'mobile':
      return await fetchListingDataMobile(url);
    default:
      throw new Error(
        'Unsupported URL type. Please use ListingSiteB, ListingSiteA, listingsitec.example.com, Hasznaltauto.hu, Sauto.cz, or Mobile.de URLs.'
      );
  }
}

export const getListingStatuses = async () => {
  try {
    const response = await fetch(`${baseURL}/api/listings/statuses`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching listing statuses:', error);
    throw error;
  }
};

export const getStatusesWithCounts = async () => {
  try {
    const response = await fetch(`${baseURL}/api/listings/statuses-and-listing-counts`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching statuses with counts:', error);
    throw error;
  }
};

export const createManualListing = async (formData) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/create-with-language`, {
      method: 'POST',
      body: formData, // FormData will automatically set the correct Content-Type
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating manual listing:', error);
    throw error;
  }
};

// const getListings = async (params = {}) => {
//   try {
//     const { language = 'en', statusId, page = 1, limit = 10, fallbackLanguage = 'en' } = params;

//     // Build query parameters
//     const queryParams = new URLSearchParams({
//       language,
//       page: page.toString(),
//       limit: limit.toString(),
//       fallbackLanguage,
//     });

//     // Add status_id if provided
//     if (statusId) {
//       queryParams.append('status_id', statusId.toString());
//     }

//     const response = await fetch(`${baseURL}/api/listings?${queryParams}`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching listings:', error);
//     throw error;
//   }
// };

const getListings = async (params = {}) => {
  try {
    const {
      language = 'en',
      statusId,
      input,
      page = 1,
      limit = 50,
      fallbackLanguage = 'en',
    } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      language,
      page: page.toString(),
      limit: limit.toString(),
      fallbackLanguage,
    });

    // Add status_id if provided
    if (statusId) {
      queryParams.append('status_id', statusId.toString());
    }

    // Add input search parameter if provided
    if (input && input.trim()) {
      queryParams.append('input', input.trim());
    }

    const response = await fetch(`${baseURL}/api/listings?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching listings for kanban:', error);
    throw error;
  }
};

const getDealers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add search parameter if provided
    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }

    const response = await fetch(`${baseURL}/api/users?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dealers:', error);
    throw error;
  }
};

const getDealersWithLoginCodes = async () => {
  try {
    const response = await fetch(`${baseURL}/api/users/with-login-codes`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dealers with login codes:', error);
    throw error;
  }
};

const getUserStatuses = async () => {
  try {
    const response = await fetch(`${baseURL}/api/users/statuses`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.userStatuses || [];
  } catch (error) {
    console.error('Error fetching user statuses:', error);
    throw error;
  }
};

const getListingById = async (id, language = 'en') => {
  try {
    const response = await fetch(`${baseURL}/api/listings/${id}?language=${language}`, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    throw error;
  }
};

const updateListing = async (id, listingData) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

const deleteListing = async (id) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // DELETE might return empty response or success message
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

const createOffer = async (offerData) => {
  try {
    const response = await fetch(`${baseURL}/api/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offerData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

const acceptOffer = async (offerId) => {
  try {
    const response = await fetch(`${baseURL}/api/offers/accept-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ offer_id: offerId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting offer:', error);
    throw error;
  }
};

const counterOffer = async (amount, offerId) => {
  try {
    const response = await fetch(`${baseURL}/api/offers/counter-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        counter_offer: Number(amount),
        offer_id: offerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error making counter offer:', error);
    throw error;
  }
};

const rejectOffer = async (offerId) => {
  try {
    const response = await fetch(`${baseURL}/api/offers/reject-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ offer_id: offerId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting offer:', error);
    throw error;
  }
};

const getOffers = async (params = {}) => {
  try {
    const { page = 1, limit = 20 } = params;
    const token = localStorage.getItem('token');

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${baseURL}/api/offers?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};

const getDeclinedOffers = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseURL}/api/offers/declined-offers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching declined offers:', error);
    throw error;
  }
};

const reserveListing = async (listingId, dealerId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
        dealer_id: dealerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error reserving listing:', error);
    throw error;
  }
};

const makeOffer = async (listingId, dealerId, amount) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
        dealer_id: dealerId,
        offer_amount: parseFloat(amount),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error making offer:', error);
    throw error;
  }
};

const purchaseListing = async (listingId, amountSoldFor, transportCost = null) => {
  try {
    const requestBody = {
      listing_id: listingId,
      amount_sold_for: parseFloat(amountSoldFor),
    };

    // Add transport cost if provided
    if (transportCost !== null && transportCost !== undefined) {
      requestBody.transport_cost = parseFloat(transportCost);
    }

    const response = await fetch(`${baseURL}/api/listings/set-purchased`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error purchasing listing:', error);
    throw error;
  }
};

const setProformaInvoiceSent = async (listingId, billingCompany = null) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-proforma-invoice-sent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
        billing_company: billingCompany,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting proforma invoice sent:', error);
    throw error;
  }
};

const setPaymentReceived = async (listingId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-payment-received`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting payment received:', error);
    throw error;
  }
};

const setPaymentSent = async (listingId, sellerInfo) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-payment-sent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
        seller_email: sellerInfo?.sellerEmail,
        seller_company: sellerInfo?.sellerCompany,
        telephone: sellerInfo?.telephone,
        seller_address: sellerInfo?.sellerAddress,
        amount_purchased: sellerInfo?.amountPurchased
          ? parseFloat(sellerInfo.amountPurchased)
          : null,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting payment sent:', error);
    throw error;
  }
};

const setBookTransport = async (listingId, expectedPickupDate, expectedDeliveryDate) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-book-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
        expected_pick_up_date: expectedPickupDate,
        expected_delivery_date: expectedDeliveryDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error booking transport:', error);
    throw error;
  }
};

const setSendDocuments = async (listingId, trackingCode) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-send-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
        tracking_code: trackingCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending documents:', error);
    throw error;
  }
};

const setCarPickedUp = async (listingId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-car-picked-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting car picked up:', error);
    throw error;
  }
};

const setCarDelivered = async (listingId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-car-delivered`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting car delivered:', error);
    throw error;
  }
};

const setCarDeregistered = async (listingId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-car-deregistered`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting car deregistered:', error);
    throw error;
  }
};

const setDealDone = async (listingId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-deal-done`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting deal done:', error);
    throw error;
  }
};

const setNoDeal = async (listingId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/set-no-deal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_id: listingId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting no deal:', error);
    throw error;
  }
};

const reactivateListing = async (listingId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/re-activate/${listingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error reactivating listing:', error);
    throw error;
  }
};

const getActivities = async () => {
  try {
    const response = await fetch(`${baseURL}/auth/activities`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

const getNewListingsCount = async () => {
  try {
    const response = await fetch(`${baseURL}/api/listings/new-count`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching new listings count:', error);
    throw error;
  }
};

export const updateDealerStatus = async (dealerId, statusId) => {
  const response = await fetch(`${baseURL}/auth/dealer/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status_id: statusId, dealer_id: dealerId }),
  });

  if (!response.ok) {
    throw new Error('Failed to update dealer status');
  }

  return await response.json();
};

export const getDealerById = async (dealerId) => {
  const response = await fetch(`${baseURL}/auth/dealer/${dealerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dealer details');
  }

  return await response.json();
};

export const updateDealer = async (dealerId, dealerData) => {
  const response = await fetch(`${baseURL}/auth/dealer/${dealerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dealerData),
  });

  if (!response.ok) {
    throw new Error('Failed to update dealer');
  }

  return await response.json();
};

export const getCountries = async () => {
  try {
    const response = await fetch(`${baseURL}/api/users/countries`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const addNewsletterContact = async (contactData) => {
  try {
    const response = await fetch(`${baseURL}/api/users/add-newsletter-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding newsletter contact:', error);
    throw error;
  }
};

export const getNewsletterListings = async () => {
  try {
    const response = await fetch(`${baseURL}/api/users/newsletter-listings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching newsletter listings:', error);
    throw error;
  }
};

export const sendNewslettersByCountry = async (countryIds, listingIDs = []) => {
  try {
    // Convert single countryId to array for backward compatibility
    const countryIdsArray = Array.isArray(countryIds) ? countryIds : [countryIds];

    const response = await fetch(`${baseURL}/api/users/send-newsletters-country`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country_ids: countryIdsArray,
        listingIDs,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send newsletters');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending newsletters by country:', error);
    throw error;
  }
};

export const getNewsletterContactsByCountry = async (countryIds) => {
  try {
    // Convert single countryId to array for backward compatibility
    const countryIdsArray = Array.isArray(countryIds) ? countryIds : [countryIds];

    const response = await fetch(`${baseURL}/api/users/get-newsletter-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country_ids: countryIdsArray,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch newsletter contacts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching newsletter contacts by country:', error);
    throw error;
  }
};

export const removeNewsletterContact = async (contactId) => {
  try {
    const response = await fetch(`${baseURL}/api/users/remove-newsletter-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: contactId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove newsletter contact');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing newsletter contact:', error);
    throw error;
  }
};

const deleteListingPhoto = async (listingId, photoId) => {
  try {
    const response = await fetch(`${baseURL}/api/listings/${listingId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting listing photo:', error);
    throw error;
  }
};

// Blog API functions
export const getBlogs = async (params = {}) => {
  try {
    const { page = 1, limit = 10, category, featured, search, published = true } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      published: published.toString(),
    });

    if (category) queryParams.append('category', category);
    if (featured !== undefined) queryParams.append('featured', featured.toString());
    if (search) queryParams.append('search', search);

    const response = await fetch(`${baseURL}/api/blogs?${queryParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

export const getBlogById = async (id) => {
  try {
    const response = await fetch(`${baseURL}/api/blogs/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};

export const createBlog = async (blogData) => {
  try {
    const response = await fetch(`${baseURL}/api/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

export const updateBlog = async (id, blogData) => {
  try {
    const response = await fetch(`${baseURL}/api/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

export const deleteBlog = async (id) => {
  try {
    const response = await fetch(`${baseURL}/api/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

export const getBlogCategories = async () => {
  try {
    const response = await fetch(`${baseURL}/api/blogs/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    throw error;
  }
};

export const uploadBlogImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${baseURL}/api/blogs/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading blog image:', error);
    throw error;
  }
};

export const createBlogWithImage = async (blogData, imageFile) => {
  try {
    const formData = new FormData();

    // Add all blog data to FormData
    Object.keys(blogData).forEach((key) => {
      if (blogData[key] !== null && blogData[key] !== undefined) {
        formData.append(key, blogData[key]);
      }
    });

    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${baseURL}/api/blogs/create-with-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating blog with image:', error);
    throw error;
  }
};

export const updateBlogWithImage = async (id, blogData) => {
  try {
    const data = {
      title: blogData.title,
      excerpt: blogData.excerpt,
      category: blogData.category,
      date: blogData.date,
      read_time: blogData.read_time,
      featured: blogData.featured,
      content: blogData.content,
      author_id: blogData.author_id,
      is_published: blogData.is_published,
    };
    const response = await fetch(`${baseURL}/api/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating blog with image:', error);
    throw error;
  }
};

export {
  login,
  fetchListingData,
  fetchListingDataListingSiteB,
  fetchListingDataListingSiteA,
  fetchListingDataListingSiteC,
  fetchListingDataHasznalt,
  fetchListingDataSauto,
  fetchListingDataMobile,
  detectUrlType,
  getListings,
  registerDealer,
  registerScrapedDealer,
  getDealers,
  getDealersWithLoginCodes,
  getUserStatuses,
  getListingById,
  updateListing,
  deleteListing,
  createOffer,
  getOffers,
  getDeclinedOffers,
  acceptOffer,
  counterOffer,
  rejectOffer,
  reserveListing,
  makeOffer,
  purchaseListing,
  setProformaInvoiceSent,
  setPaymentReceived,
  setPaymentSent,
  setBookTransport,
  setSendDocuments,
  setCarPickedUp,
  setCarDelivered,
  setCarDeregistered,
  setDealDone,
  setNoDeal,
  reactivateListing,
  getActivities,
  getNewListingsCount,
  deleteListingPhoto,
};

// Fetch weekly dealer report
export const getWeeklyDealerReport = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/auth/weekly-dealer-report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching weekly dealer report:', error);
    throw error;
  }
};

export const generateReportWithSuggestions = async (
  dealerId,
  percentage,
  suggestions,
  whenToSend,
  isSending
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/auth/generate-report-with-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        dealer_id: dealerId,
        percentage: parseFloat(percentage),
        suggestions: suggestions.map((suggestion) => ({
          listingsitea_listing_id: suggestion.listingId,
          reference_code: suggestion.referenceCode,
        })),
        when_to_send: whenToSend,
        is_sending: isSending,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error generating report with suggestions:', error);
    throw error;
  }
};

export const generateScrapedDealersReport = async (
  dealerId,
  suggestions,
  whenToSend,
  isSending
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/auth/generate-scraped-dealers-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        dealer_id: dealerId,
        suggestions: suggestions.map((suggestion) => ({
          listingsitea_listing_id: suggestion.listingId,
          reference_code: suggestion.referenceCode,
        })),
        when_to_send: whenToSend,
        is_sending: isSending,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error generating scraped dealers report:', error);
    throw error;
  }
};

export const getDealerSoldCars = async (dealerId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/auth/dealers-sold-cars-scraped/${dealerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dealer sold cars:', error);
    throw error;
  }
};

export const getAllUsersWithScrapedListings = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${baseURL}/api/users/with-scraped-listings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all users with scraped listings:', error);
    throw error;
  }
};

export const getDealersScrapedListings = async (userId) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${baseURL}/api/listings/get-dealers-scraped-listings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dealer scraped listings:', error);
    throw error;
  }
};

export const addToWishlist = async (wishlistData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${baseURL}/api/listings/add-to-wishlist`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wishlistData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const addBatchToWishlist = async (wishlistEntries) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${baseURL}/api/listings/add-batch-to-wishlist`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wishlist_entries: wishlistEntries }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding batch to wishlist:', error);
    throw error;
  }
};

// Wishlist Sending Options API functions
export const getUserWishlistSendingOptions = async (userId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${baseURL}/api/users/wishlist-sending-options/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Wishlist sending options not found for this user');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user wishlist sending options:', error);
    throw error;
  }
};

export const addOrUpdateWishlistSendingOptions = async (optionsData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${baseURL}/api/users/wishlist-sending-options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(optionsData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding/updating wishlist sending options:', error);
    throw error;
  }
};

export const getAllUsersWithWishlistSendingOptions = async (page = 1, limit = 10) => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${baseURL}/api/users/wishlist-sending-options?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all users with wishlist sending options:', error);
    throw error;
  }
};
