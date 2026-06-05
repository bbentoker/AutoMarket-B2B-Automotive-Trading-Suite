const express = require('express');
const userController = require('../controllers/userController');
const countryController = require('../controllers/countryController');
const emailTesterController = require('../controllers/emailTesterController');
const {
  verifyDealerToken,
  verifyDealerTokenOptional,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users with role_id 2 (dealers) with pagination
// Query parameters: page (default: 1), limit (default: 10)
// Example: GET /api/users?page=1&limit=10
router.get('/', userController.getAllUsers);

// Get all users with scraped listings (users who have listingsitea_url and their adverts)
// Returns: All users with listingsitea_url and their associated adverts
router.get(
  '/with-scraped-listings',
  userController.getAllUsersWithScrapedListings
);

// Get all users with login codes (generates codes if they don't exist)
// Returns: All users with their login codes, generates new codes for users without them
router.get('/with-login-codes', userController.getAllUsersWithLoginCodes);

// Update a user by ID (only users with role_id 2)
// Body: { name?, email?, status_id? }
router.put('/:id', userController.updateUser);

// Get all user statuses
router.get('/statuses', userController.getAllUserStatuses);

// Get all countries
router.get('/countries', countryController.getAllCountries);

// Make an offer on a listing
// Body: { listing_id: number, offer: number }
// Returns: Created offer object
router.post('/make-offer', verifyDealerToken, userController.makeOffer);

// Change user language
// Body: { language: string }
// Returns: Updated user object
router.post(
  '/change-language',
  verifyDealerToken,
  userController.changeLanguage
);

router.post(
  '/reserve-listing',
  verifyDealerToken,
  userController.reserveListing
);
// Get filtered listings
// Query parameters: brand?, model?, year?, mileage? (format: min-max, e.g. 0-1000)
// Example: GET /api/users/fetch-listings?brand=BMW&model=M3&year=2020&mileage=0-1000
router.get('/fetch-listings', userController.getFilteredListings);

// Get listing information without photos
router.get(
  '/get-listing/:id',
  verifyDealerTokenOptional,
  userController.getListingInfo
);
router.get(
  '/get-listing-basic/:id',
  verifyDealerTokenOptional,
  userController.getListingInfoBasic
);
// Get listing photos separately for lazy loading
router.get('/get-listing/:id/photos', userController.getListingPhotos);
router.get(
  '/get-listing/:id/damaged-parts',
  userController.getListingPhotosDamaged
);

// Get similar listings based on a specific listing ID
// Returns listings with similar characteristics in the same format as getFilteredListings
router.get('/get-similar-listings/:id', userController.getListingsBasedOn);

// Add user activity for a listing
// Body: { listing_id: number, user_id: number }
router.post('/add-activity', verifyDealerToken, userController.addUserActivity);
router.post('/add-newsletter-activity', userController.addNewsletterActivity);
router.post(
  '/add-weekly-report-activity',
  userController.addWeeklyReportActivity
);
// Add newsletter contact
router.post('/add-newsletter-contact', userController.addNewsletterContact);
// remove newsletter contact
router.post(
  '/remove-newsletter-contact',
  userController.removeNewsletterContact
);

router.post('/get-newsletter-contacts', userController.getNewsletterContacts);
// Get listings for newsletter (status_id 1 or 3)
router.get('/newsletter-listings', userController.getNewsletterListings);

// Send newsletters to users in a specific country
router.post('/send-newsletters-country', userController.sendNewslettersCountry);
router.post('/unsubscribe-newsletter', userController.unsubscribeNewsletter);
// Get newsletter job status
router.get(
  '/newsletter-job-status/:jobId',
  userController.getNewsletterJobStatus
);
// Get email rate limiter status
router.get('/email-rate-limiter-status', userController.getEmailRateLimiterStatus);

// Save a listing for the authenticated user
// Body: { listing_id: number }
// Returns: Saved listing entry
router.post('/save-listing', verifyDealerToken, userController.saveListing);

// Unsave a listing for the authenticated user
// Body: { listing_id: number }
// Returns: Success message
router.post('/unsave-listing', verifyDealerToken, userController.unsaveListing);

router.post('/landing-contact', userController.landingContact);

// Test emails route - sends all email templates to test email
router.post('/test-mails', emailTesterController.testAllEmails);

// Test specific email template
router.post('/test-specific-email', emailTesterController.testSpecificEmail);

// User report options routes
// Update or create user report options
// Body: { dealer_id: number, percentage?: number, suggestions?: array, when_to_send?: object, is_sending?: boolean }
router.post('/report-options', userController.updateUserReportOptions);

// Get user report options
// Params: dealer_id
router.get('/report-options/:dealer_id', userController.getUserReportOptions);

router.get(
  '/get-weekly-report',
  verifyDealerToken,
  userController.getWeeklyReport
);

// Get user's wishlist with associated listings
// Body: { user_id: number }
// Returns: User's wishlist options with associated advert data
router.post('/get-wishlist', userController.getUserWishlist);

// Add wishlist click
// Body: { wishlist_option_id: number, listing_id: number, user_id: number }
// Returns: Created wishlist click entry
router.post('/add-wishlist-click', userController.addWishlistClick);

// Get all wishlist orders (clicks) grouped by user
// Returns: All wishlist clicks grouped by user with user and advert data
router.get('/get-wishlist-orders', userController.getWishlistOrders);

// User wishlist sending options routes
// Add or update user wishlist sending options
// Body: { user_id: number, when_to_send?: object, is_sending?: boolean }
router.post(
  '/wishlist-sending-options',
  userController.addUserWishlistSendingOptions
);

// Get user wishlist sending options by user ID
// Params: user_id
router.get(
  '/wishlist-sending-options/:user_id',
  userController.getUserWishlistSendingOptions
);

// Get all users with wishlist sending options (with pagination)
// Query parameters: page (default: 1), limit (default: 10)
router.get(
  '/wishlist-sending-options',
  userController.getAllUsersWithWishlistSendingOptions
);

// Add wishlist activity based on login code
// Body: { code: string, listing_id?: number, activity_type?: string }
// Returns: Created activity entry or success message
router.post('/wishlist-activity', userController.addWishlistActivity);

module.exports = router;
