// SECURITY-SANITIZED: The following values were redacted for public showcase.
// In the real deployment they pointed to the customer's production infrastructure.
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// Configure S3-compatible storage (endpoint and bucket are env-driven placeholders)
const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACES_ENDPOINT || 'https://s3.example.com',
  accessKeyId: process.env.DO_SPACES_KEY, // The Access Key ID
  secretAccessKey: process.env.DO_SPACES_SECRET, // The Secret Key
  s3ForcePathStyle: false, // Digital Ocean supports virtual-hosted style
  signatureVersion: 'v4',
  region: process.env.DO_SPACES_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.DO_BUCKET_NAME || 'automarket-assets';

/**
 * Upload a buffer to S3 with compression and optimization
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} folder - The folder path in S3 (e.g., 'listings', 'damaged-parts')
 * @param {string} filename - Optional filename (will generate UUID if not provided)
 * @param {number} maxWidth - Maximum width for image resizing
 * @param {number} maxHeight - Maximum height for image resizing
 * @param {number} quality - JPEG quality (1-100)
 * @returns {Promise<string>} The S3 URL of the uploaded image
 */
const uploadImageToS3 = async (
  imageBuffer,
  folder = 'images',
  filename = null,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 80
) => {
  try {
    if (!BUCKET_NAME) {
      throw new Error('DO_BUCKET_NAME environment variable is not set');
    }

    // Generate unique filename if not provided
    const imageId = filename || uuidv4();
    const key = `${folder}/${imageId}.jpg`;

    // Compress and optimize the image
    const compressedBuffer = await sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: compressedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };

    const result = await s3.upload(uploadParams).promise();

    return result.Location;
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
};

/**
 * Upload multiple images to S3 in parallel
 * @param {Array<Buffer>} imageBuffers - Array of image buffers
 * @param {string} folder - The folder path in S3
 * @param {number} maxWidth - Maximum width for image resizing
 * @param {number} maxHeight - Maximum height for image resizing
 * @param {number} quality - JPEG quality (1-100)
 * @returns {Promise<Array<string>>} Array of S3 URLs
 */
const uploadMultipleImagesToS3 = async (
  imageBuffers,
  folder = 'images',
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 80
) => {
  try {
    const uploadPromises = imageBuffers.map((buffer, index) => {
      if (!buffer) return null;

      return uploadImageToS3(
        buffer,
        folder,
        null, // Let it generate UUID
        maxWidth,
        maxHeight,
        quality
      ).catch((error) => {
        console.error(`Error uploading image ${index + 1}:`, error);
        return null; // Return null for failed uploads
      });
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url) => url !== null); // Filter out failed uploads
  } catch (error) {
    console.error('Error uploading multiple images to S3:', error);
    throw new Error(`Failed to upload multiple images to S3: ${error.message}`);
  }
};

/**
 * Download image from URL and upload to S3
 * @param {string} imageUrl - The image URL to download
 * @param {string} folder - The folder path in S3
 * @param {number} timeout - Download timeout in milliseconds
 * @returns {Promise<string>} The S3 URL of the uploaded image
 */
const downloadAndUploadToS3 = async (
  imageUrl,
  folder = 'images',
  timeout = 10000
) => {
  try {
    const axios = require('axios');

    // Download the image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: timeout,
      maxContentLength: 10 * 1024 * 1024, // 10MB limit
      maxBodyLength: 10 * 1024 * 1024,
    });

    const imageBuffer = Buffer.from(response.data);

    // Upload to S3
    return await uploadImageToS3(imageBuffer, folder);
  } catch (error) {
    console.error('Error downloading and uploading image to S3:', error);
    throw new Error(`Failed to download and upload image: ${error.message}`);
  }
};

/**
 * Process and upload listing images (URLs and manual uploads) while preserving order
 * @param {Array<string>} imageUrls - Array of image URLs to download and upload
 * @param {Array<Buffer>} manualImages - Array of manual image buffers
 * @param {number} listingId - The listing ID for folder organization
 * @returns {Promise<Array<string>>} Array of S3 URLs in same order as input
 */
const processListingImages = async (
  imageUrls = [],
  manualImages = [],
  listingId
) => {
  try {
    const s3Urls = [];
    const folder = `listings/${listingId}`;

    console.log(
      `Processing ${imageUrls.length} URL images and ${manualImages.length} manual images for listing ${listingId} in order`
    );

    // Process URL-based images first, sequentially to preserve order
    if (imageUrls && imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const s3Url = await downloadAndUploadToS3(imageUrls[i], folder);
          s3Urls.push(s3Url);
          console.log(`✅ Processed URL image ${i + 1}/${imageUrls.length}`);
        } catch (error) {
          console.error(`❌ Failed to process URL image ${i + 1}:`, error);
          // Skip failed images but continue processing to maintain order of successful ones
        }
      }
    }

    // Process manual images sequentially to preserve order
    if (manualImages && manualImages.length > 0) {
      for (let i = 0; i < manualImages.length; i++) {
        try {
          if (manualImages[i]) {
            const s3Url = await uploadImageToS3(manualImages[i], folder);
            s3Urls.push(s3Url);
            console.log(
              `✅ Processed manual image ${i + 1}/${manualImages.length}`
            );
          }
        } catch (error) {
          console.error(`❌ Failed to process manual image ${i + 1}:`, error);
          // Skip failed images but continue processing
        }
      }
    }

    console.log(
      `Successfully processed ${s3Urls.length} images in order for listing ${listingId}`
    );
    return s3Urls;
  } catch (error) {
    console.error('Error processing listing images:', error);
    throw new Error(`Failed to process listing images: ${error.message}`);
  }
};

/**
 * Process and upload damaged parts images
 * @param {Array<Object>} damagedPartsData - Array of damaged part objects with image buffers
 * @param {number} listingId - The listing ID for folder organization
 * @returns {Promise<Array<Object>>} Array of damaged parts with S3 URLs
 */
const processDamagedPartsImages = async (damagedPartsData = [], listingId) => {
  try {
    if (!damagedPartsData || damagedPartsData.length === 0) {
      return [];
    }

    console.log(
      `Processing ${damagedPartsData.length} damaged parts images for listing ${listingId}`
    );

    const folder = `listings/${listingId}/damaged-parts`;

    const processedParts = await Promise.all(
      damagedPartsData.map(async (partData, index) => {
        try {
          const { part_id, image, description } = partData;

          if (!image) {
            console.warn(`No image provided for damaged part ${index + 1}`);
            return {
              part_id,
              photo: null,
              description: description || null,
            };
          }

          // Upload image to S3
          const s3Url = await uploadImageToS3(image, folder);

          return {
            part_id,
            photo: s3Url,
            description: description || null,
          };
        } catch (error) {
          console.error(`Error processing damaged part ${index + 1}:`, error);
          return {
            part_id: partData.part_id,
            photo: null,
            description: partData.description || null,
          };
        }
      })
    );

    const successfulUploads = processedParts.filter(
      (part) => part.photo !== null
    );
    console.log(
      `Successfully processed ${successfulUploads.length}/${damagedPartsData.length} damaged parts images`
    );

    return processedParts;
  } catch (error) {
    console.error('Error processing damaged parts images:', error);
    throw new Error(`Failed to process damaged parts images: ${error.message}`);
  }
};

/**
 * Delete an image from S3
 * @param {string} s3Url - The S3 URL of the image to delete
 * @returns {Promise<boolean>} Success status
 */
const deleteImageFromS3 = async (s3Url) => {
  try {
    if (!s3Url || !s3Url.includes(BUCKET_NAME)) {
      console.warn('Invalid S3 URL provided for deletion');
      return false;
    }

    // Extract the key from the S3 URL
    const url = new URL(s3Url);
    const key = url.pathname.substring(1); // Remove leading slash

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
    console.log(`Image deleted successfully from S3: ${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return false;
  }
};

/**
 * Upload a PDF buffer to S3
 * @param {Buffer} pdfBuffer - The PDF buffer to upload
 * @param {string} folder - The folder path in S3 (e.g., 'invoices', 'documents')
 * @param {string} filename - Optional filename (will generate UUID if not provided)
 * @returns {Promise<string>} The S3 URL of the uploaded PDF
 */
const uploadPdfToS3 = async (
  pdfBuffer,
  folder = 'documents',
  filename = null
) => {
  try {
    if (!BUCKET_NAME) {
      throw new Error('DO_BUCKET_NAME environment variable is not set');
    }

    // Generate unique filename if not provided
    const pdfId = filename || uuidv4();
    const key = `${folder}/${pdfId}.pdf`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read',
    };

    const result = await s3.upload(uploadParams).promise();

    return result.Location;
  } catch (error) {
    console.error('Error uploading PDF to S3:', error);
    throw new Error(`Failed to upload PDF to S3: ${error.message}`);
  }
};

module.exports = {
  uploadImageToS3,
  uploadMultipleImagesToS3,
  downloadAndUploadToS3,
  processListingImages,
  processDamagedPartsImages,
  deleteImageFromS3,
  uploadPdfToS3,
};
