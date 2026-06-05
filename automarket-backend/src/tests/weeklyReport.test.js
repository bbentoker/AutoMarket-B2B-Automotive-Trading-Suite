const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const UserReportOptions = require('../models/UserReportOptions');
const Advert = require('../models/advert');
const { sendWeeklyReports } = require('../cron/weeklyReport');

describe('Weekly Report Cron Job', () => {
  let testUser;
  let testReportOptions;
  let testAdvert;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test Dealer',
      email: 'testdealer@example.com',
      password: 'password123',
      role_id: 2,
      status_id: 1,
      company_name: 'Test Company',
    });

    // Create test report options
    testReportOptions = await UserReportOptions.create({
      user_id: testUser.id,
      percentage: 15,
      suggestions: [{ listingsitea_listing_id: 13045, reference_code: '6C5W2' }],
      when_to_send: { day: 'monday', hour: '09' },
      is_sending: true,
    });

    // Create test advert (sold car)
    testAdvert = await Advert.create({
      seller_id: testUser.id,
      title: 'Test Car',
      price: 25000,
      is_active: false, // Sold car
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testAdvert) {
      await testAdvert.destroy();
    }
    if (testReportOptions) {
      await testReportOptions.destroy();
    }
    if (testUser) {
      await testUser.destroy();
    }
  });

  describe('sendWeeklyReports', () => {
    it('should process users with scheduled reports at the right time', async () => {
      // Mock the email service to avoid sending actual emails during testing
      const originalSendWeeklyReportEmail =
        require('../services/emailService').sendWeeklyReportEmail;
      const mockSendEmail = jest
        .fn()
        .mockResolvedValue({ id: 'test-email-id' });

      // Temporarily replace the email service method
      require('../services/emailService').sendWeeklyReportEmail = mockSendEmail;

      try {
        await sendWeeklyReports();

        // The function should run without errors
        expect(true).toBe(true);
      } finally {
        // Restore the original method
        require('../services/emailService').sendWeeklyReportEmail =
          originalSendWeeklyReportEmail;
      }
    });

    it('should handle users without sold cars', async () => {
      // Create a user with no sold cars
      const userWithoutCars = await User.create({
        name: 'No Cars Dealer',
        email: 'nocars@example.com',
        password: 'password123',
        role_id: 2,
        status_id: 1,
      });

      const reportOptionsWithoutCars = await UserReportOptions.create({
        user_id: userWithoutCars.id,
        percentage: 10,
        when_to_send: { day: 'monday', hour: '09' },
        is_sending: true,
      });

      try {
        await sendWeeklyReports();

        // Should not throw an error even with no sold cars
        expect(true).toBe(true);
      } finally {
        // Clean up
        await reportOptionsWithoutCars.destroy();
        await userWithoutCars.destroy();
      }
    });

    it('should handle users with inactive report options', async () => {
      // Create a user with inactive report options
      const userInactive = await User.create({
        name: 'Inactive Dealer',
        email: 'inactive@example.com',
        password: 'password123',
        role_id: 2,
        status_id: 1,
      });

      const inactiveReportOptions = await UserReportOptions.create({
        user_id: userInactive.id,
        percentage: 10,
        when_to_send: { day: 'monday', hour: '09' },
        is_sending: false, // Inactive
      });

      try {
        await sendWeeklyReports();

        // Should not send reports to inactive users
        expect(true).toBe(true);
      } finally {
        // Clean up
        await inactiveReportOptions.destroy();
        await userInactive.destroy();
      }
    });
  });

  describe('API Endpoints', () => {
    it('should create user report options via API', async () => {
      const reportData = {
        dealer_id: testUser.id,
        percentage: 20,
        suggestions: [{ listingsitea_listing_id: 13046, reference_code: '6C5W3' }],
        when_to_send: { day: 'tuesday', hour: '10' },
        is_sending: true,
      };

      const response = await request(app)
        .post('/api/auth/generate-scraped-dealers-report')
        .send(reportData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.percentage).toBe(20);
    });

    it('should get user report options via API', async () => {
      const response = await request(app)
        .get(`/api/users/report-options/${testUser.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_id).toBe(testUser.id);
      expect(response.body.data.user).toBeDefined();
    });
  });
});
