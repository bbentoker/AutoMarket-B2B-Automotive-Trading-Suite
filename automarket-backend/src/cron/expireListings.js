const cron = require('node-cron');
const { Op, Sequelize } = require('sequelize');
const Listing = require('../models/Listing');
const StatusUpdate = require('../models/StatusUpdate');

// Function to check and move expired listings to no deal status
async function expireListings() {
  try {
    console.log('🔍 Starting expired listings check process...');

    // Find listings that are expired and still in status 1 or 3
    // Expiration condition: created_at + (expiration hours) < NOW()
    const expiredListings = await Listing.findAll({
      where: {
        status_id: {
          [Op.in]: [1, 3], // Only check listings in status 1 (new) or 3 (offers)
        },
        is_deleted: false,
        expiration: {
          [Op.ne]: null, // Only check listings that have an expiration set
        },
        // Use raw SQL to check if listing has expired
        [Op.and]: [
          {
            [Op.where]: Sequelize.literal(
              `"created_at" + (INTERVAL '1 hour' * "expiration") < NOW()`
            ),
          },
        ],
      },
    });

    console.log(
      `📊 Found ${expiredListings.length} expired listings to move to no deal status`
    );
    if (expiredListings.length === 0) {
      console.log('✅ No expired listings found');
      return;
    }

    let processedCount = 0;
    let errorCount = 0;

    // Process each expired listing
    for (const listing of expiredListings) {
      try {
        const previousStatusId = listing.status_id;

        // Update listing to no deal status (14) without triggering Zoho
        await listing.update({
          status_id: 14, // No deal status
          is_viewed: false, // Mark as not viewed so admin sees the change
        });

        // Create a status update entry for tracking
        await StatusUpdate.create({
          listing_id: listing.id,
          previous_status_id: previousStatusId,
          current_status_id: 14,
        });

        console.log(
          `✅ Listing ID ${listing.id} (${listing.brand_name} ${listing.model} - ${listing.registration_number}) moved from status ${previousStatusId} to no deal (14) due to expiration`
        );

        processedCount++;
      } catch (error) {
        console.error(
          `❌ Error processing expired listing ID ${listing.id}:`,
          error.message
        );
        errorCount++;
        // Continue with the next listing instead of stopping the entire process
      }
    }

    console.log(
      `🎯 Expiration process complete: ${processedCount} listings moved to no deal, ${errorCount} errors`
    );
  } catch (error) {
    console.error('❌ Error in expired listings cron job:', error);
  }
}

// Schedule the cron job to run every 30 minutes (only if enabled via environment variable)
let scheduledJob = null;

// Check if expire listings cron is enabled
const isExpireListingsCronEnabled =
  process.env.ENABLE_EXPIRE_LISTINGS_CRON === 'true';

if (isExpireListingsCronEnabled) {
  scheduledJob = cron.schedule(
    '*/30 * * * *',
    () => {
      console.log('⏰ Running expired listings check...');
      expireListings();
    },
    {
      scheduled: true,
      timezone: 'Europe/Stockholm', // Swedish timezone
    }
  );

  console.log('🚀 Expired listings cron job scheduled (every 30 minutes)');
} else {
  console.log(
    '⏸️ Expired listings cron job is disabled (ENABLE_EXPIRE_LISTINGS_CRON not set to true)'
  );
}
// Export for testing or manual triggering
module.exports = {
  expireListings,
  scheduledJob,
};
