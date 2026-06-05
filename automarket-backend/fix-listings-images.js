const Listing = require('./src/models/Listing');
const ListingPhotos = require('./src/models/ListingPhotos');
const { sequelize } = require('./src/config/database');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

/**
 * Processes listing images through Car Studio API
 * @param {number} listingId - The ID of the listing
 * @returns {Promise<boolean>} - Returns true if processing was successful
 */
const processCarStudioImagesForListing = async (listingId) => {
  try {
    console.log(`\n🎬 Starting Car Studio processing for listing ${listingId}`);

    // Get listing with photos
    const listing = await Listing.findByPk(listingId, {
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          order: [['id', 'ASC']], // Order by ID to preserve original input order
        },
      ],
    });

    if (!listing || !listing.photos || listing.photos.length === 0) {
      console.log(`❌ No photos found for listing ${listingId}`);
      return false;
    }

    if (listing.car_studio_processed) {
      console.log(
        `🔄 Listing ${listingId} already processed by Car Studio, but reprocessing...`
      );
    }

    console.log(
      `📷 Found ${listing.photos.length} photos for listing ${listingId}`
    );

    // Check Car Studio credits
    console.log('💳 Checking Car Studio credits...');
    const creditResponse = await axios.post(
      process.env.CAR_STUDIO_CREDIT_URL,
      {},
      {
        headers: {
          apiKey: process.env.CAR_STUDIO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Car Studio credits response:', creditResponse.data);

    if (
      !creditResponse.data?.success ||
      creditResponse.data?.return?.totalCredits <= 0
    ) {
      console.log('❌ Insufficient Car Studio credits, skipping processing');
      return false;
    }

    console.log(
      `💰 Available credits: ${creditResponse.data.return.totalCredits}`
    );

    const enhancedImageUrls = [];
    const photosToUpdate = [];
    let processedCount = 0;

    // Process each image
    for (let i = 0; i < listing.photos.length; i++) {
      try {
        const photo = listing.photos[i];
        console.log(
          `  📸 Processing image ${i + 1}/${listing.photos.length}: ${photo.url}`
        );

        const formData = new FormData();
        formData.append('images[0].fileUrl', photo.url);
        formData.append(
          'plateImageUrl',
          'https://carstudio.s3.eu-west-1.amazonaws.com/userplate/carstudio/141548c0f39c0efa7879d250d46d4168eb2e36968f0411f7857977789ed49e70.jpg'
        );
        formData.append(
          'platformUrl',
          'https://carstudio.s3.eu-west-1.amazonaws.com/platforms/carstudio/9698706283de60e63e55b5140ddada77d874aade1f4fd37010ee3e9b38f35fc1.jpg'
        );

        const carStudioResponse = await axios.post(
          process.env.CAR_STUDIO_MAIN_URL,
          formData,
          {
            headers: {
              apiKey: process.env.CAR_STUDIO_API_KEY,
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 second timeout
          }
        );

        if (
          carStudioResponse.data?.success &&
          carStudioResponse.data?.return?.afterStudioImages?.length > 0
        ) {
          const enhancedImageUrl =
            carStudioResponse.data.return.afterStudioImages[0].imageUrl;
          enhancedImageUrls.push(enhancedImageUrl);
          photosToUpdate.push({ id: photo.id, url: enhancedImageUrl });
          processedCount++;
          console.log(`    ✅ Enhanced image ${i + 1}: ${enhancedImageUrl}`);
        } else {
          console.log(
            `    ⚠️  Car Studio processing failed for image ${i + 1}, keeping original URL`
          );
        }
      } catch (carStudioError) {
        console.error(
          `    ❌ Error processing image ${i + 1} through Car Studio:`,
          carStudioError.message
        );
      }
    }

    // Update photos with enhanced URLs
    if (photosToUpdate.length > 0) {
      console.log(
        `💾 Updating ${photosToUpdate.length} photos with enhanced URLs...`
      );
      for (const photoUpdate of photosToUpdate) {
        await ListingPhotos.update(
          { url: photoUpdate.url },
          { where: { id: photoUpdate.id } }
        );
      }
      console.log(
        `✅ Updated ${photosToUpdate.length} photos with enhanced URLs`
      );
    }

    // Mark listing as processed
    await listing.update({ car_studio_processed: true });
    console.log(
      `🎉 Listing ${listingId} Car Studio processing completed! Processed ${processedCount}/${listing.photos.length} images`
    );

    return true;
  } catch (error) {
    console.error(
      `❌ Error in Car Studio processing for listing ${listingId}:`,
      error.message
    );
    return false;
  }
};

/**
 * Main function to fix listings images
 * @param {number} count - Number of latest listings to process
 */
const fixListingsImages = async (count = 10) => {
  try {
    console.log(
      `🚀 Starting Car Studio image processing for latest ${count} listings...`
    );
    console.log('='.repeat(70));

    // Validate environment variables
    if (
      !process.env.CAR_STUDIO_API_KEY ||
      !process.env.CAR_STUDIO_MAIN_URL ||
      !process.env.CAR_STUDIO_CREDIT_URL
    ) {
      console.error('❌ Missing required Car Studio environment variables:');
      console.error('   - CAR_STUDIO_API_KEY');
      console.error('   - CAR_STUDIO_MAIN_URL');
      console.error('   - CAR_STUDIO_CREDIT_URL');
      process.exit(1);
    }

    // Check if Car Studio is enabled
    if (process.env.CAR_STUDIO_ENABLED !== 'true') {
      console.log('⚠️  Car Studio is disabled in environment variables');
      console.log('   Set CAR_STUDIO_ENABLED=true to enable processing');
      process.exit(0);
    }

    // Get latest listings that haven't been processed or need reprocessing
    const listings = await Listing.findAll({
      where: {
        is_deleted: false,
        id: 505,
        // car_studio_processed: false, // Only unprocessed listings - commented out to reprocess
      },
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          attributes: ['id', 'url'],
          required: true, // Only listings with photos
        },
      ],
      order: [['created_at', 'DESC']], // Latest first
      limit: count,
    });

    if (listings.length === 0) {
      console.log('✅ No unprocessed listings with photos found');
      return;
    }

    console.log(`📋 Found ${listings.length} unprocessed listings with photos`);
    console.log('='.repeat(70));

    let successCount = 0;
    let failCount = 0;

    // Process each listing
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      console.log(`\n📊 Progress: ${i + 1}/${listings.length}`);
      console.log(`🆔 Processing Listing ID: ${listing.id}`);
      console.log(
        `🚗 Vehicle: ${listing.brand_name || 'Unknown'} ${listing.model || 'Unknown'}`
      );
      console.log(`📅 Created: ${listing.created_at}`);

      const success = await processCarStudioImagesForListing(listing.id);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Add delay between listings to avoid rate limiting
      if (i < listings.length - 1) {
        console.log('⏱️  Waiting 2 seconds before next listing...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 FINAL RESULTS:');
    console.log(`✅ Successfully processed: ${successCount} listings`);
    console.log(`❌ Failed to process: ${failCount} listings`);
    console.log(
      `📊 Total processed: ${successCount + failCount}/${listings.length} listings`
    );
    console.log('='.repeat(70));
  } catch (error) {
    console.error('❌ Fatal error in fixListingsImages:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Command line interface
const main = async () => {
  const args = process.argv.slice(2);
  const countArg = args.find((arg) => arg.startsWith('--count='));
  const helpArg = args.includes('--help') || args.includes('-h');

  if (helpArg) {
    console.log(`
🎬 Car Studio Listings Image Processor

Usage: node fix-listings-images.js [options]

Options:
  --count=X    Number of latest listings to process (default: 10)
  --help, -h   Show this help message

Examples:
  node fix-listings-images.js                 # Process 10 latest listings
  node fix-listings-images.js --count=25      # Process 25 latest listings
  node fix-listings-images.js --count=1       # Process 1 latest listing

Environment Variables Required:
  CAR_STUDIO_API_KEY      - Your Car Studio API key
  CAR_STUDIO_MAIN_URL     - Car Studio main processing URL
  CAR_STUDIO_CREDIT_URL   - Car Studio credit check URL
  CAR_STUDIO_ENABLED      - Set to 'true' to enable processing

Note: Only listings that haven't been processed (car_studio_processed = false) 
and have photos will be processed.
`);
    process.exit(0);
  }

  let count = 10; // default
  if (countArg) {
    const countValue = parseInt(countArg.split('=')[1]);
    if (isNaN(countValue) || countValue <= 0) {
      console.error('❌ Invalid count value. Must be a positive integer.');
      process.exit(1);
    }
    count = countValue;
  }

  await fixListingsImages(count);
};

// Run the script if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { fixListingsImages, processCarStudioImagesForListing };
