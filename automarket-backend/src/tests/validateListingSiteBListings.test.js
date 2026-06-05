const { validateListingSiteBListings } = require('../cron/validateListingSiteBListings');
const Listing = require('../models/Listing');
const { validateListingSiteBUrl } = require('../services/scrapingService');

// Mock the dependencies for testing
jest.mock('../models/Listing');
jest.mock('../services/scrapingService');

describe('validateListingSiteBListings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log to avoid noise in tests
    console.error = jest.fn(); // Mock console.error
  });

  test('should process valid ListingSiteB listings correctly', async () => {
    // Mock data
    const mockListings = [
      {
        id: 1,
        internal_url: 'https://www.listingsiteb.example.com/annons/valid-listing',
        is_listingsiteb: true,
        is_deleted: false,
      },
      {
        id: 2,
        internal_url: 'https://www.listingsiteb.example.com/annons/invalid-listing',
        is_listingsiteb: true,
        is_deleted: false,
      },
    ];

    // Mock Listing.findAll to return our test data
    Listing.findAll.mockResolvedValue(mockListings);

    // Mock Listing.update
    Listing.update.mockResolvedValue([1]);

    // Mock validateListingSiteBUrl responses
    validateListingSiteBUrl
      .mockResolvedValueOnce({ isValid: true, reason: 'Active listing found' })
      .mockResolvedValueOnce({ isValid: false, reason: 'Listing not found' });

    // Run the function
    await validateListingSiteBListings();

    // Verify that findAll was called with correct parameters
    expect(Listing.findAll).toHaveBeenCalledWith({
      where: {
        is_listingsiteb: true,
        is_deleted: false,
        internal_url: {
          [require('sequelize').Op.ne]: null,
        },
      },
    });

    // Verify that validateListingSiteBUrl was called for each listing
    expect(validateListingSiteBUrl).toHaveBeenCalledTimes(2);
    expect(validateListingSiteBUrl).toHaveBeenCalledWith(
      'https://www.listingsiteb.example.com/annons/valid-listing'
    );
    expect(validateListingSiteBUrl).toHaveBeenCalledWith(
      'https://www.listingsiteb.example.com/annons/invalid-listing'
    );

    // Verify that only the invalid listing was marked as deleted
    expect(Listing.update).toHaveBeenCalledTimes(1);
    expect(Listing.update).toHaveBeenCalledWith(
      { is_deleted: true },
      { where: { id: 2 } }
    );
  });

  test('should handle empty listings array', async () => {
    // Mock empty result
    Listing.findAll.mockResolvedValue([]);

    await validateListingSiteBListings();

    expect(validateListingSiteBUrl).not.toHaveBeenCalled();
    expect(Listing.update).not.toHaveBeenCalled();
  });

  test('should handle errors gracefully', async () => {
    const mockListings = [
      {
        id: 1,
        internal_url: 'https://www.listingsiteb.example.com/annons/error-listing',
        is_listingsiteb: true,
        is_deleted: false,
      },
    ];

    Listing.findAll.mockResolvedValue(mockListings);
    validateListingSiteBUrl.mockRejectedValue(new Error('Network error'));

    // Should not throw an error
    await expect(validateListingSiteBListings()).resolves.not.toThrow();

    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
  });
});
