const axios = require('axios');

/**
 * Test listing API endpoints to ensure they return S3 URLs for photos and damaged parts
 * This test assumes you have a running server and some test data
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const testListingEndpoints = async () => {
  console.log('🧪 Testing Listing API Endpoints for S3 URL Integration...\n');

  try {
    // Test 1: Get all listings
    console.log('1️⃣ Testing GET /api/listings...');
    const allListingsResponse = await axios.get(`${BASE_URL}/api/listings`);

    if (
      allListingsResponse.data.listings &&
      allListingsResponse.data.listings.length > 0
    ) {
      const firstListing = allListingsResponse.data.listings[0];
      console.log(
        `✅ Retrieved ${allListingsResponse.data.listings.length} listings`
      );

      // Check if photos are included
      if (firstListing.photos) {
        console.log(`📸 Photos found: ${firstListing.photos.length}`);
        if (firstListing.photos.length > 0) {
          const firstPhoto = firstListing.photos[0];
          console.log(
            `   Sample photo URL: ${firstPhoto.url.substring(0, 50)}...`
          );

          // Check if it's an S3 URL
          if (
            firstPhoto.url.includes('amazonaws.com') ||
            firstPhoto.url.includes('s3.')
          ) {
            console.log('   ✅ Photo URL appears to be from S3');
          } else if (firstPhoto.url.startsWith('data:image')) {
            console.log(
              '   ⚠️  Photo URL is still base64 - migration may be needed'
            );
          } else {
            console.log('   ✅ Photo URL is a valid URL');
          }
        }
      } else {
        console.log('   ℹ️  No photos found in listing');
      }

      // Check if damaged parts are included
      if (firstListing.damagedParts) {
        console.log(
          `🔧 Damaged parts found: ${firstListing.damagedParts.length}`
        );
        if (firstListing.damagedParts.length > 0) {
          const firstDamagedPart = firstListing.damagedParts[0];
          if (firstDamagedPart.photo) {
            console.log(
              `   Sample damaged part photo URL: ${firstDamagedPart.photo.substring(0, 50)}...`
            );

            // Check if it's an S3 URL
            if (
              firstDamagedPart.photo.includes('amazonaws.com') ||
              firstDamagedPart.photo.includes('s3.')
            ) {
              console.log('   ✅ Damaged part photo URL appears to be from S3');
            } else if (firstDamagedPart.photo.startsWith('data:image')) {
              console.log(
                '   ⚠️  Damaged part photo URL is still base64 - migration may be needed'
              );
            } else {
              console.log('   ✅ Damaged part photo URL is a valid URL');
            }
          }
        }
      } else {
        console.log('   ℹ️  No damaged parts found in listing');
      }
    } else {
      console.log('   ℹ️  No listings found');
    }

    // Test 2: Get single listing (if we have at least one)
    if (
      allListingsResponse.data.listings &&
      allListingsResponse.data.listings.length > 0
    ) {
      const listingId = allListingsResponse.data.listings[0].id;
      console.log(`\n2️⃣ Testing GET /api/listings/${listingId}...`);

      const singleListingResponse = await axios.get(
        `${BASE_URL}/api/listings/${listingId}`
      );
      const listing = singleListingResponse.data;

      console.log('✅ Retrieved single listing');

      // Check photos
      if (listing.photos) {
        console.log(`📸 Photos: ${listing.photos.length}`);
      }

      // Check damaged parts
      if (listing.damagedParts) {
        console.log(`🔧 Damaged parts: ${listing.damagedParts.length}`);
      }
    }

    // Test 3: Get listings by status
    console.log('\n3️⃣ Testing GET /api/listings/status/1...');
    const statusListingsResponse = await axios.get(
      `${BASE_URL}/api/listings/status/1`
    );

    if (statusListingsResponse.data && statusListingsResponse.data.length > 0) {
      console.log(
        `✅ Retrieved ${statusListingsResponse.data.length} listings with status 1`
      );

      // Check if first listing has photos and damaged parts
      const firstStatusListing = statusListingsResponse.data[0];
      if (firstStatusListing.photos) {
        console.log(
          `📸 Status listing has ${firstStatusListing.photos.length} photos`
        );
      }
      if (firstStatusListing.damagedParts) {
        console.log(
          `🔧 Status listing has ${firstStatusListing.damagedParts.length} damaged parts`
        );
      }
    } else {
      console.log('   ℹ️  No listings with status 1 found');
    }

    console.log('\n🎉 All API tests completed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Make sure your server is running');
    console.error('2. Check if the API endpoints are accessible');
    console.error('3. Verify you have test data in your database');
    console.error('4. Check if the base URL is correct');
  }
};

// Export for use as a module
module.exports = { testListingEndpoints };

// Allow running as a standalone script
if (require.main === module) {
  testListingEndpoints()
    .then(() => {
      console.log('\n✨ API test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('API test failed:', error);
      process.exit(1);
    });
}
