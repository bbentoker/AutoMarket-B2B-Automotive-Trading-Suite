#!/usr/bin/env node

/**
 * MinIO Bucket Configuration and Management Script
 *
 * This script helps you:
 * 1. List all buckets and their access policies
 * 2. Create new buckets
 * 3. Configure bucket policies for public access
 * 4. Test bucket connectivity
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// Configure MinIO S3 client
const s3 = new AWS.S3({
  endpoint: 'https://s3.automarket.example.com', // MinIO S3 endpoint
  accessKeyId: process.env.MINIO_ROOT_USER || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:
    process.env.MINIO_ROOT_PASSWORD || process.env.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // required for MinIO
  signatureVersion: 'v4',
  region: 'us-east-1', // MinIO doesn't need this but AWS SDK requires it
});

/**
 * Check if MinIO credentials are configured
 */
function checkCredentials() {
  const hasMinIOCreds =
    process.env.MINIO_ROOT_USER && process.env.MINIO_ROOT_PASSWORD;
  const hasAWSCreds =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasMinIOCreds && !hasAWSCreds) {
    console.error('❌ MinIO credentials not configured!');
    console.error(
      'Please set the following environment variables in your .env file:'
    );
    console.error('- MINIO_ROOT_USER=your-minio-username');
    console.error('- MINIO_ROOT_PASSWORD=your-minio-password');
    console.error('\nOr use legacy AWS variables:');
    console.error('- AWS_ACCESS_KEY_ID=your-access-key');
    console.error('- AWS_SECRET_ACCESS_KEY=your-secret-key');
    process.exit(1);
  }

  console.log('✅ Credentials found');
  if (hasMinIOCreds) {
    console.log(
      `🔑 Using MinIO credentials for user: ${process.env.MINIO_ROOT_USER}`
    );
  } else {
    console.log(`🔑 Using AWS credentials (fallback)`);
  }
}

/**
 * Test connection to MinIO server
 */
async function testConnection() {
  try {
    console.log('🔗 Testing connection to MinIO server...');
    await s3.listBuckets().promise();
    console.log('✅ Successfully connected to MinIO server');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MinIO server:');
    console.error(`   Error: ${error.message}`);

    if (error.code === 'NetworkingError') {
      console.error(
        '   💡 Check if MinIO server is accessible at https://s3.automarket.example.com'
      );
    } else if (
      error.code === 'SignatureDoesNotMatch' ||
      error.code === 'InvalidAccessKeyId'
    ) {
      console.error(
        '   💡 Check your MINIO_ROOT_USER and MINIO_ROOT_PASSWORD credentials'
      );
    }

    return false;
  }
}

/**
 * Get bucket policy and determine access type
 */
async function getBucketAccessType(bucketName) {
  try {
    const policy = await s3.getBucketPolicy({ Bucket: bucketName }).promise();
    const policyDoc = JSON.parse(policy.Policy);

    // Check if there's a public read policy
    const hasPublicRead = policyDoc.Statement.some(
      (statement) =>
        statement.Effect === 'Allow' &&
        statement.Principal === '*' &&
        (statement.Action.includes('s3:GetObject') ||
          statement.Action === 's3:GetObject')
    );

    if (hasPublicRead) {
      return '🌐 Public Read';
    } else {
      return '🔒 Private';
    }
  } catch (error) {
    if (error.code === 'NoSuchBucketPolicy') {
      return '🔒 Private (No Policy)';
    } else {
      return `❓ Unknown (${error.code})`;
    }
  }
}

/**
 * List all buckets with their access types
 */
async function listBuckets() {
  try {
    console.log('\n📋 Listing all MinIO buckets...\n');

    const result = await s3.listBuckets().promise();

    if (result.Buckets.length === 0) {
      console.log('📭 No buckets found in your MinIO instance');
      return [];
    }

    console.log(
      '┌─────────────────────────────────────┬─────────────────────┬─────────────────────────┐'
    );
    console.log(
      '│ Bucket Name                         │ Created             │ Access Type             │'
    );
    console.log(
      '├─────────────────────────────────────┼─────────────────────┼─────────────────────────┤'
    );

    const buckets = [];

    for (const bucket of result.Buckets) {
      const accessType = await getBucketAccessType(bucket.Name);
      const createdDate = bucket.CreationDate.toISOString().split('T')[0];

      buckets.push({
        name: bucket.Name,
        created: createdDate,
        accessType: accessType,
      });

      console.log(
        `│ ${bucket.Name.padEnd(35)} │ ${createdDate.padEnd(19)} │ ${accessType.padEnd(23)} │`
      );
    }

    console.log(
      '└─────────────────────────────────────┴─────────────────────┴─────────────────────────┘'
    );
    console.log(`\n📊 Total buckets: ${buckets.length}`);

    return buckets;
  } catch (error) {
    console.error('❌ Failed to list buckets:');
    console.error(`   Error: ${error.message}`);
    return [];
  }
}

/**
 * Create a new bucket
 */
async function createBucket(bucketName) {
  try {
    console.log(`\n🪣 Creating bucket: ${bucketName}`);

    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`✅ Successfully created bucket: ${bucketName}`);

    return true;
  } catch (error) {
    if (error.code === 'BucketAlreadyExists') {
      console.log(`ℹ️  Bucket ${bucketName} already exists`);
      return true;
    } else {
      console.error(`❌ Failed to create bucket ${bucketName}:`);
      console.error(`   Error: ${error.message}`);
      return false;
    }
  }
}

/**
 * Set public read policy for a bucket
 */
async function setPublicReadPolicy(bucketName) {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucketName}/*`,
      },
    ],
  };

  try {
    console.log(`\n🌐 Setting public read policy for bucket: ${bucketName}`);

    await s3
      .putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
      .promise();

    console.log(`✅ Successfully set public read policy for: ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to set policy for bucket ${bucketName}:`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Interactive menu
 */
async function showMenu() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    console.log('\n🛠️  MinIO Bucket Management');
    console.log('═══════════════════════════');
    console.log('1. List all buckets');
    console.log('2. Create new bucket');
    console.log('3. Set bucket to public read');
    console.log('4. Test connection');
    console.log('5. Exit');
    console.log('');

    const choice = await question('Select an option (1-5): ');

    switch (choice.trim()) {
      case '1':
        await listBuckets();
        break;

      case '2':
        const newBucketName = await question('Enter bucket name: ');
        if (newBucketName.trim()) {
          const created = await createBucket(newBucketName.trim());
          if (created) {
            const makePublic = await question(
              'Make this bucket publicly readable? (y/N): '
            );
            if (
              makePublic.toLowerCase() === 'y' ||
              makePublic.toLowerCase() === 'yes'
            ) {
              await setPublicReadPolicy(newBucketName.trim());
            }
          }
        }
        break;

      case '3':
        const bucketName = await question('Enter bucket name to make public: ');
        if (bucketName.trim()) {
          await setPublicReadPolicy(bucketName.trim());
        }
        break;

      case '4':
        await testConnection();
        break;

      case '5':
        console.log('👋 Goodbye!');
        rl.close();
        return;

      default:
        console.log('❌ Invalid option. Please select 1-5.');
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 MinIO Bucket Configuration Tool');
  console.log('==================================\n');

  // Check credentials
  checkCredentials();

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n💡 Fix the connection issue and try again.');
    process.exit(1);
  }

  // Check if running with arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Interactive mode
    await showMenu();
  } else {
    // Command line mode
    const command = args[0];

    switch (command) {
      case 'list':
        await listBuckets();
        break;

      case 'create':
        if (args[1]) {
          const created = await createBucket(args[1]);
          if (created && args[2] === '--public') {
            await setPublicReadPolicy(args[1]);
          }
        } else {
          console.log(
            'Usage: node configure-minio-bucket.js create <bucket-name> [--public]'
          );
        }
        break;

      case 'public':
        if (args[1]) {
          await setPublicReadPolicy(args[1]);
        } else {
          console.log(
            'Usage: node configure-minio-bucket.js public <bucket-name>'
          );
        }
        break;

      default:
        console.log('Available commands:');
        console.log('  list                           - List all buckets');
        console.log(
          '  create <name> [--public]       - Create bucket (optionally public)'
        );
        console.log(
          '  public <name>                  - Make bucket publicly readable'
        );
        console.log('  (no arguments)                 - Interactive mode');
    }
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  testConnection,
  listBuckets,
  createBucket,
  setPublicReadPolicy,
};
