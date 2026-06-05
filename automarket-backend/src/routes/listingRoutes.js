const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { extractListingListingSiteB } = require('../controllers/listingController');
const {
  verifyAdmin,
  verifyDealerToken,
} = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Middleware to extend timeout for long-running scraping routes (default: 5 minutes)
const extendTimeout = (timeoutMs = 300000) => (req, res, next) => {
  req.setTimeout(timeoutMs);
  res.setTimeout(timeoutMs);
  next();
};


router.get('/all-listings', listingController.getAllListingsHomepage);


// POST add listing to wishlist
router.post('/add-to-wishlist', listingController.addToWishlistScraped);

// POST add batch listings to wishlist
router.post('/add-batch-to-wishlist', listingController.addBatchToWishlist);

router.get('/new-count', listingController.getNewListingCount);
// GET listing statuses
router.get('/statuses', listingController.getListingStatuses);

router.get(
  '/statuses-and-listing-counts',
  listingController.getListingStatusesAndListingCounts
);
// GET all listings
router.get('/', listingController.getAllListings);

// GET new listing count (is_viewed: false and status_id: 2)

// GET single listing
router.get('/:id', listingController.getListing);

// POST new listing, from admin panel
router.post(
  '/create-with-language',
  upload.any(), // Handle any field names (including dynamic ones like damagedParts[0][images][0])
  listingController.createMainListingWithImages
);

// PUT update listing
router.put('/:id', listingController.updateListingWithImages);

// PUT update listing with images and damaged parts
router.put(
  '/:id/with-images',
  upload.any(), // Handle any field names (including dynamic ones like damagedParts[0][images][0])
  listingController.updateListingWithImages
);

// DELETE listing
router.delete('/:id', listingController.deleteListing);

// DELETE individual photo from listing
router.delete('/:id/photos/:photoId', listingController.deleteListingPhoto);

// Extract listing from URL (ListingSiteB only - returns data without creating listing)
router.post(
  '/extract-listing-listingsiteb',
  listingController.extractListingListingSiteB
);
// Extract listing from URL (ListingSiteA only - logs incoming URL)
router.post(
  '/extract-listing-listingsitea',
  listingController.extractListingSiteA
);
// Extract listing from URL (ListingSiteC only - logs incoming URL and HTML content)
// Extended timeout to 5 minutes (300000ms) for production scraping
router.post(
  '/extract-listing-listingsitec',
  extendTimeout(300000),
  listingController.extractListingListingSiteC
);
// Extract listing from URL (Hasznaltauto only - logs incoming URL and HTML content)
router.post(
  '/extract-listing-hasznaltauto',
  listingController.extractListingHasznaltauto
);

// Extract listing from URL (Mobile.de only - logs incoming URL and HTML content)
router.post(
  '/extract-listing-mobilede',
  listingController.extractListingMobileDe
);

// Extract listing from URL (Sauto.cz)
router.post('/extract-listing-sauto', listingController.extractListingSauto);
// Advanced extraction (handles all URLs and creates listing)
router.post(
  '/extract-listing-advanced',
  listingController.extractListingAdvanced
);

// GET all listings with status id 1
router.get('/status/1', listingController.getAllListingsWithStatusOne);

// PUT update listing status
router.put('/:id/status', listingController.updateListingStatus);

// GET listings based on status
router.get('/status/:statusId', listingController.getListingsByStatus);

// stages changes

// POST reserve listing
router.post('/reserve', listingController.reserveListing);

// POST make offer on listing
router.post('/offer', listingController.offerListing);

// POST set listing as purchased
router.post('/set-purchased', listingController.setPurchased);

router.post(
  '/set-proforma-invoice-sent',
  listingController.setProformaInvoiceSent
);

// POST Payment Received transition
router.post('/set-payment-received', listingController.setPaymentReceived);

// POST Payment Sent transition
router.post('/set-payment-sent', listingController.setPaymentSent);

// POST Send Documents transition
router.post('/set-send-documents', listingController.setSendDocuments);

// POST Book Transport transition
router.post('/set-book-transport', listingController.setBookTransport);

// POST Car Picked Up transition
router.post('/set-car-picked-up', listingController.setCarPickedUp);

// POST Car Delivered transition
router.post('/set-car-delivered', listingController.setCarDelivered);

// POST Car De-registered transition
router.post('/set-car-deregistered', listingController.setCarDeregistered);

// POST Deal Done transition
router.post('/set-deal-done', listingController.setDealDone);

// POST No Deal transition
router.post('/set-no-deal', listingController.setNoDeal);

// POST Re-activate expired listing
router.post('/re-activate/:id', listingController.reactivateListing);

router.post(
  '/get-dealers-scraped-listings',
  listingController.getDealersScrapedListings
);

module.exports = router;
