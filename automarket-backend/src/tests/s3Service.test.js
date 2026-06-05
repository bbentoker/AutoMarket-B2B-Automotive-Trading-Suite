const {
  uploadImageToS3,
  processListingImages,
} = require('../services/s3Service');
const fs = require('fs');
const path = require('path');

/**
 * Test S3 service functionality
 * This is a basic test to verify S3 integration works
 * Make sure to set your AWS credentials in .env before running
 */
const testS3Service = async () => {
  console.log('🧪 Testing S3 Service Integration...\n');

  // Check if MinIO credentials are set
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
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    console.log('1️⃣ Testing single image upload...');

    // Test single image upload
    const s3Url = await uploadImageToS3(
      testImageBuffer,
      'test-images',
      'test-single-image'
    );

    console.log(`✅ Single image uploaded successfully: ${s3Url}\n`);

    console.log('2️⃣ Testing listing images processing...');

    // Test processListingImages function
    const testListingId = 999; // Use a test listing ID
    const manualImages = [testImageBuffer, testImageBuffer]; // Two test images
    const imageUrls = []; // No URL images for this test

    const processedUrls = await processListingImages(
      imageUrls,
      manualImages,
      testListingId
    );

    console.log(`✅ Processed ${processedUrls.length} listing images:`);
    processedUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    console.log('\n🎉 All S3 tests passed successfully!');
    console.log('\n📝 Test Notes:');
    console.log('- Test images were uploaded to your S3 bucket');
    console.log('- You can check your S3 console to see the uploaded files');
    console.log(
      "- Test files are small (1x1 pixel) and won't use much storage"
    );
    console.log('- Consider deleting test files from S3 after verification');
  } catch (error) {
    console.error('❌ S3 test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');

    if (error.message.includes('AccessControlListNotSupported')) {
      console.error('📋 ACL Issue Detected:');
      console.error(
        '   - Your S3 bucket has ACLs disabled (this is normal for new buckets)'
      );
      console.error('   - The code has been updated to work without ACLs');
      console.error(
        '   - Make sure your bucket policy allows public read access'
      );
      console.error(
        '   - Check the AWS_S3_CONFIG.md file for bucket policy configuration'
      );
    } else if (error.message.includes('Access Denied')) {
      console.error('🔒 Access Denied:');
      console.error(
        '   - Check your MinIO credentials (MINIO_ROOT_USER, MINIO_ROOT_PASSWORD)'
      );
      console.error('   - Verify your IAM user has S3 permissions');
      console.error('   - Ensure the bucket exists and you have access to it');
    } else if (error.message.includes('NoSuchBucket')) {
      console.error('🪣 Bucket Not Found:');
      console.error('   - Verify MINIO_BUCKET name is correct');
      console.error('   - Check that the bucket exists in your MinIO instance');
      console.error(
        '   - Ensure MinIO server is accessible at https://s3.automarket.example.com'
      );
    } else {
      console.error('🔧 General troubleshooting:');
      console.error('1. Verify your AWS credentials are correct');
      console.error('2. Check if your S3 bucket exists and is accessible');
      console.error('3. Ensure your IAM user has the required S3 permissions');
      console.error('4. Verify the AWS region is correct');
      console.error(
        '5. Check the AWS_S3_CONFIG.md file for detailed setup instructions'
      );
    }

    console.error('\n📄 Full error details:', error);
  }
};

// Export for use as a module
module.exports = { testS3Service };

// Allow running as a standalone script
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();

  testS3Service()
    .then(() => {
      console.log('\n✨ Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}
