# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# MinIO S3 Configuration for Image Storage

## Required Environment Variables

Add the following environment variables to your `.env` file:

```bash
# MinIO S3 Configuration for Image Storage
MINIO_ROOT_USER=your-minio-username
MINIO_ROOT_PASSWORD=your-minio-password
AWS_REGION=us-east-1
MINIO_BUCKET=your-bucket-name

# Legacy support (fallback if MINIO_* variables not set)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## MinIO S3 Setup Instructions

1. **MinIO Server Access**

   - MinIO server is running at: https://s3.automarket.example.com
   - Contact your system administrator for access credentials

2. **Create a Bucket**

   - Access MinIO Console or use MinIO Client (mc)
   - Create a bucket with a unique name
   - Set the bucket name in `MINIO_BUCKET` environment variable
   - Ensure the bucket allows public read access for images

3. **Get Access Credentials**

   - Obtain your MinIO root user credentials
   - Set `MINIO_ROOT_USER` with your MinIO username
   - Set `MINIO_ROOT_PASSWORD` with your MinIO password
   - These credentials provide full access to your MinIO instance

4. **Configure Bucket for Public Access**
   - Access MinIO Console at https://s3.automarket.example.com
   - Navigate to your bucket settings
   - Configure bucket policy for public read access:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::your-bucket-name/*"
         }
       ]
     }
     ```
   - **Important**: Replace `your-bucket-name` with your actual MinIO bucket name

## Image Storage Structure

Images are organized in S3 with the following folder structure:

```
your-bucket-name/
├── listings/
│   ├── 1/                    # Listing ID 1
│   │   ├── uuid1.jpg         # Main listing photos
│   │   ├── uuid2.jpg
│   │   └── damaged-parts/
│   │       ├── uuid3.jpg     # Damaged parts photos
│   │       └── uuid4.jpg
│   ├── 2/                    # Listing ID 2
│   │   └── ...
│   └── ...
```

## Features

- **Automatic Image Compression**: Images are compressed and optimized using Sharp
- **UUID Filenames**: Each image gets a unique UUID filename to prevent conflicts
- **Error Handling**: Failed uploads don't break the listing creation process
- **Parallel Processing**: Multiple images are uploaded simultaneously for better performance
- **Public URLs**: Images are publicly accessible via S3 URLs

## Migration from Base64

If you have existing listings with base64 images, you may want to create a migration script to move them to MinIO. The new system stores MinIO URLs in the same `url` field in the `listing_photos` table and `photo` field in the `damaged_parts` table.

## Troubleshooting Common Issues

### 1. "AccessControlListNotSupported: The bucket does not allow ACLs"

This error occurs when your S3 bucket has ACLs disabled (default for new buckets). The fix is already implemented in the code - we don't use ACLs anymore. Instead:

- Use bucket policies for public access (see step 4 above)
- Make sure "Block all public access" is unchecked in your bucket settings

### 2. "Access Denied" when viewing images

- Verify your bucket policy is correctly configured
- Check that "Block all public access" is disabled
- Ensure the bucket policy resource ARN matches your bucket name exactly

### 3. "Credential issues"

- Double-check your MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
- Verify your MinIO credentials have the required permissions
- Make sure the AWS_REGION is set (can be any valid region for MinIO)

### 4. "Bucket does not exist"

- Verify MINIO_BUCKET name is correct
- Check that you're connected to the right MinIO server
- Ensure the bucket exists in your MinIO instance

## Cost Considerations

- MinIO storage costs are typically much lower than database storage
- Bandwidth costs may apply depending on your MinIO setup
- Consider using a CDN for better performance and potentially lower costs
