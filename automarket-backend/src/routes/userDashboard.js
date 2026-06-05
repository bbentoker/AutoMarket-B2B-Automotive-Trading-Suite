const express = require('express');
const router = express.Router();
const { verifyDealerToken } = require('../middleware/authMiddleware');
const userDashboardController = require('../controllers/userDashboardController');

// general info
router.get('/overview', verifyDealerToken, userDashboardController.getOverview);

router.get(
  '/reserved-cars',
  verifyDealerToken,
  userDashboardController.getReservedCars
);

router.get('/offers', verifyDealerToken, userDashboardController.getOffers);

router.get(
  '/purchased-cars',
  verifyDealerToken,
  userDashboardController.getPurchasedCars
);
router.get(
  '/track-purchased-cars',
  verifyDealerToken,
  userDashboardController.getTrackPurchasedCars
);

router.get(
  '/saved-cars',
  verifyDealerToken,
  userDashboardController.getSavedCars
);
router.post(
  '/unsave-car',
  verifyDealerToken,
  userDashboardController.unsaveCar
);
router.get('/profile', verifyDealerToken, userDashboardController.getProfile);

router.put(
  '/profile',
  verifyDealerToken,
  userDashboardController.updateProfile
);

router.post(
  '/profile/change-password',
  verifyDealerToken,
  userDashboardController.changePassword
);

router.post(
  '/remove-reserved',
  verifyDealerToken,
  userDashboardController.removeReserved
);

router.post(
  '/process-offer',
  verifyDealerToken,
  userDashboardController.processOffer
);

router.get('/invoices', verifyDealerToken, userDashboardController.getInvoices);
module.exports = router;
