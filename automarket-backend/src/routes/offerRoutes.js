const express = require('express');
const offerController = require('../controllers/offerController');

const router = express.Router();

// Get all offers
// Query parameters: page (default: 1), limit (default: 10)
router.get('/', offerController.getAllOffers);

// Update offer details
// Body: { is_approved?: boolean, counter_offer?: number }
router.put('/:id', offerController.updateOffer);

// Make counter offer
// Body: { listing_id: number, counter_offer: number }
router.post('/counter-offer', offerController.makeCounterOffer);

// Accept offer (direct acceptance without counter offer)
// Body: { offer_id: number }
router.post('/accept-offer', offerController.acceptOffer);

// Reject offer
// Body: { offer_id: number }
router.post('/reject-offer', offerController.rejectOffer);

router.get('/declined-offers', offerController.declinedOffers);
// Accept counter offer
// No body needed, offer_id is in URL params
router.get(
  '/accept-counter-offer/:offer_id',
  offerController.acceptCounterOffer
);

module.exports = router;
