const cron = require('node-cron');
const { Op } = require('sequelize');
const Listing = require('../models/Listing');
const {
  validateListingSiteBUrlsBatch,
  logProcessStats,
} = require('../services/scrapingService');

// Function to validate ListingSiteB listings using batch processing
async function validateListingSiteBListings() {
  try {
    console.log('🔍 Starting ListingSiteB URL validation process...');

    // Log initial process stats
    logProcessStats();

    // Fetch all listings where is_listingsiteb is true and not already deleted
    const listingsitebListings = await Listing.findAll({
      where: {
        is_listingsiteb: true,
        is_deleted: false,
        internal_url: {
          [Op.ne]: null,
        },
      },
    });

    console.log(
      `📊 Found ${listingsitebListings.length} ListingSiteB listings to validate`
    );

    if (listingsitebListings.length === 0) {
      console.log('✅ No ListingSiteB listings to validate');
      return;
    }

    // Extract URLs for batch validation
    const urlsToValidate = listingsitebListings.map(
      (listing) => listing.internal_url
    );

    console.log('🚀 Starting batch validation with fresh browser instance...');

    // Use batch validation - fresh browser instance for each batch
    const validationResults = await validateListingSiteBUrlsBatch(urlsToValidate);

    console.log('📋 Processing validation results...');

    let validatedCount = 0;
    let invalidatedCount = 0;

    // Process results
    for (let i = 0; i < listingsitebListings.length; i++) {
      const listing = listingsitebListings[i];
      const result = validationResults[i];

      try {
        if (!result.isValid) {
          console.log(
            `❌ Listing ID ${listing.id} is invalid: ${result.reason}`
          );

          // Mark the listing as deleted
          await Listing.update(
            { is_deleted: true },
            { where: { id: listing.id } }
          );

          invalidatedCount++;
          console.log(`🗑️ Marked listing ID ${listing.id} as deleted`);
        } else {
          console.log(`✅ Listing ID ${listing.id} is valid: ${result.reason}`);
          validatedCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error processing listing ID ${listing.id}:`,
          error.message
        );
        // Continue with the next listing instead of stopping the entire process
      }
    }

    console.log(
      `🎯 Validation complete: ${validatedCount} valid, ${invalidatedCount} invalid (marked as deleted)`
    );

    // Log final process stats
    console.log('📊 Final process statistics:');
    logProcessStats();
  } catch (error) {
    console.error('❌ Error in ListingSiteB URL validation cron job:', error);

    // Log error state stats
    console.log('📊 Error state process statistics:');
    logProcessStats();
  }
}

// Schedule the cron job to run every hour (at minute 0 of every hour)
const scheduledJob = cron.schedule(
  '0 * * * *',
  () => {
    console.log('⏰ Running hourly ListingSiteB URL validation...');
    validateListingSiteBListings();
  },
  {
    scheduled: true,
    timezone: 'Europe/Stockholm', // Swedish timezone
  }
);

console.log('🚀 ListingSiteB URL validation cron job scheduled (every hour)');
console.log('🚀 Using fresh browser instances for each batch validation');

// Run initial validation
validateListingSiteBListings();

// Export for testing or manual triggering
module.exports = {
  validateListingSiteBListings,
  scheduledJob,
};
