const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.post('/admin/login', authController.loginAdmin);
router.post('/admin/add', authController.addAdmin);

// Dealer routes
router.post('/dealer/login', authController.loginDealer);
router.post('/dealer/login-code', authController.validateLoginCode);
router.post('/dealer/register', authController.registerDealer);
router.post('/dealer/register-complete', authController.registerDealerComplete);
router.post('/dealer/register-scraped', authController.registerScrapedDealer);
router.post('/dealer/status', authController.updateDealerStatus);

// forgot and reset password routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/dealers', authController.getAllDealers);
router.get('/dealer/:id', authController.getDealer);
router.put('/dealer/:id', authController.updateDealer);

router.get('/activities', userController.getAllUserActivities);

// scraped dealer routes
router.get(
  '/listingsitea-scraper-user-infos',
  userController.listingsiteaScraperUserInfos
);

// scraped dealers page route
router.get('/weekly-dealer-report', userController.weeklyDealerReport);

router.get('/dealers-sold-cars-scraped/:id', userController.getDealersSoldCars);

// edit report option
router.post(
  '/generate-scraped-dealers-report',
  userController.generateScrapedDealersReport
);

// Scraping analysis route
router.get('/scraping-analysis', userController.scrapingAnalysis);

router.get(
  '/scraping-analysis-overview',
  userController.scrapingAnalysisOverview
);

module.exports = router;
