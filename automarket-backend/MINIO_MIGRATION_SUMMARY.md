# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# MinIO Migration Summary

## Overview

Successfully migrated the car sales platform from AWS S3 to MinIO S3-compatible storage. All S3 operations now use the MinIO endpoint at `https://s3.automarket.example.com`.

## Changes Made

### 1. Core S3 Service Configuration (`src/services/s3Service.js`)

- Updated S3 client configuration to use MinIO endpoint
- Added `s3ForcePathStyle: true` (required for MinIO)
- Updated environment variable references to use `MINIO_BUCKET`
- Added fallback support for legacy AWS environment variables

### 2. Environment Variables

**New Primary Variables:**

- `MINIO_ROOT_USER` - MinIO username (fallback: `AWS_ACCESS_KEY_ID`)
- `MINIO_ROOT_PASSWORD` - MinIO password (fallback: `AWS_SECRET_ACCESS_KEY`)
- `MINIO_BUCKET` - MinIO bucket name

### 3. Updated Files

- `src/services/s3Service.js` - Core S3 configuration
- `src/tests/s3Service.test.js` - Test file credentials check
- `src/tests/pdfService.test.js` - PDF test credentials check
- `src/utils/migrateImagesToS3.js` - Migration script credentials
- `test_pdf_generation.bat` - Windows test script
- `test_pdf_generation.sh` - Unix test script
- `docs/MINIO_S3_CONFIG.md` - Updated documentation (renamed from AWS_S3_CONFIG.md)

### 4. Configuration Details

```javascript
const s3 = new AWS.S3({
  endpoint: 'https://s3.automarket.example.com', // MinIO S3 endpoint
  accessKeyId: process.env.MINIO_ROOT_USER || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:
    process.env.MINIO_ROOT_PASSWORD || process.env.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // required for MinIO
  signatureVersion: 'v4',
  region: 'us-east-1', // MinIO doesn't need this but AWS SDK requires it
});
```

## Required Environment Variables

Add these to your `.env` file:

```bash
# MinIO S3 Configuration
MINIO_ROOT_USER=your-minio-username
MINIO_ROOT_PASSWORD=your-minio-password
MINIO_BUCKET=your-bucket-name

# Legacy support (optional fallback)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## Testing the Configuration

1. **Test S3 Service:**

   ```bash
   node src/tests/s3Service.test.js
   ```

2. **Test PDF Generation:**

   ```bash
   # Windows
   test_pdf_generation.bat

   # Unix/Linux/Mac
   ./test_pdf_generation.sh
   ```

## Features Preserved

- ✅ Image upload and compression
- ✅ PDF generation and upload
- ✅ Parallel image processing
- ✅ Error handling and fallbacks
- ✅ UUID-based file naming
- ✅ Public URL generation
- ✅ Damaged parts image handling

## Backward Compatibility

- Legacy AWS environment variables still work as fallbacks
- Existing S3 URLs remain functional (if migrating from AWS)
- All API endpoints and functionality unchanged

## Next Steps

1. Set up MinIO credentials in your `.env` file
2. Create the bucket in your MinIO instance
3. Configure bucket policy for public read access
4. Run tests to verify functionality
5. Deploy to production with new environment variables

## Troubleshooting

- Ensure MinIO server is accessible at `https://s3.automarket.example.com`
- Verify bucket exists and has proper permissions
- Check that credentials have read/write access to the bucket
- Confirm `s3ForcePathStyle: true` is set (required for MinIO)

## Files That Use S3/MinIO

- Image uploads for car listings
- Damaged parts photos
- PDF invoice generation and storage
- Image migration utilities
