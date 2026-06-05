const { uploadImageToS3 } = require('../services/s3Service');
const ListingPhotos = require('../models/ListingPhotos');
const DamagedParts = require('../models/DamagedParts');

/**
 * Convert base64 string to buffer
 * @param {string} base64String - Base64 encoded image
 * @returns {Buffer} Image buffer
 */
const base64ToBuffer = (base64String) => {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

/**
 * Migrate listing photos from base64 to S3
 * @param {number} limit - Number of records to process at once
 * @returns {Promise<void>}
 */
const migrateListingPhotos = async (limit = 10) => {
  try {
    console.log('Starting migration of listing photos...');

    // Find all listing photos with base64 data
    const photos = await ListingPhotos.findAll({
      where: {
        url: {
          [require('sequelize').Op.like]: 'data:image%',
        },
      },
      limit: limit,
      include: [
        {
          model: require('../models/Listing'),
          as: 'listing',
          attributes: ['id'],
        },
      ],
    });

    if (photos.length === 0) {
      console.log('No base64 listing photos found to migrate.');
      return;
    }

    console.log(`Found ${photos.length} listing photos to migrate.`);

    let successCount = 0;
    let errorCount = 0;

    for (const photo of photos) {
      try {
        console.log(`Migrating listing photo ${photo.id}...`);

        // Convert base64 to buffer
        const imageBuffer = base64ToBuffer(photo.url);

        // Upload to S3
        const s3Url = await uploadImageToS3(
          imageBuffer,
          `listings/${photo.listing_id}`,
          `migrated-photo-${photo.id}`
        );

        // Update the record with S3 URL
        await photo.update({ url: s3Url });

        console.log(`✓ Successfully migrated photo ${photo.id}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error migrating photo ${photo.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nListing photos migration completed:`);
    console.log(`- Successful: ${successCount}`);
    console.log(`- Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error during listing photos migration:', error);
  }
};

/**
 * Migrate damaged parts photos from base64 to S3
 * @param {number} limit - Number of records to process at once
 * @returns {Promise<void>}
 */
const migrateDamagedParts = async (limit = 10) => {
  try {
    console.log('Starting migration of damaged parts photos...');

    // Find all damaged parts with base64 data
    const parts = await DamagedParts.findAll({
      where: {
        photo: {
          [require('sequelize').Op.like]: 'data:image%',
        },
      },
      limit: limit,
    });

    if (parts.length === 0) {
      console.log('No base64 damaged parts photos found to migrate.');
      return;
    }

    console.log(`Found ${parts.length} damaged parts photos to migrate.`);

    let successCount = 0;
    let errorCount = 0;

    for (const part of parts) {
      try {
        console.log(`Migrating damaged part ${part.id}...`);

        // Convert base64 to buffer
        const imageBuffer = base64ToBuffer(part.photo);

        // Upload to S3
        const s3Url = await uploadImageToS3(
          imageBuffer,
          `listings/${part.listing_id}/damaged-parts`,
          `migrated-part-${part.id}`
        );

        // Update the record with S3 URL
        await part.update({ photo: s3Url });

        console.log(`✓ Successfully migrated damaged part ${part.id}`);
        successCount++;
      } catch (error) {
        console.error(
          `✗ Error migrating damaged part ${part.id}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log(`\nDamaged parts migration completed:`);
    console.log(`- Successful: ${successCount}`);
    console.log(`- Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error during damaged parts migration:', error);
  }
};

/**
 * Run full migration
 * @param {number} batchSize - Number of records to process in each batch
 * @returns {Promise<void>}
 */
const runMigration = async (batchSize = 10) => {
  console.log('🚀 Starting S3 migration process...\n');

  // Check if MinIO credentials are configured
  if (
    (!process.env.MINIO_ROOT_USER && !process.env.AWS_ACCESS_KEY_ID) ||
    (!process.env.MINIO_ROOT_PASSWORD && !process.env.AWS_SECRET_ACCESS_KEY) ||
    !process.env.MINIO_BUCKET
  ) {
    console.error(
      '❌ MinIO credentials not configured. Please set the following environment variables:'
    );
    console.error('- MINIO_ROOT_USER (or AWS_ACCESS_KEY_ID as fallback)');
    console.error(
      '- MINIO_ROOT_PASSWORD (or AWS_SECRET_ACCESS_KEY as fallback)'
    );
    console.error('- MINIO_BUCKET');
    return;
  }

  try {
    // Migrate listing photos
    await migrateListingPhotos(batchSize);
    console.log('');

    // Migrate damaged parts
    await migrateDamagedParts(batchSize);

    console.log('\n✅ Migration process completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Export functions for use as a module
module.exports = {
  migrateListingPhotos,
  migrateDamagedParts,
  runMigration,
};

// Allow running as a standalone script
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();

  // Get batch size from command line arguments or use default
  const batchSize = parseInt(process.argv[2]) || 10;

  runMigration(batchSize)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
