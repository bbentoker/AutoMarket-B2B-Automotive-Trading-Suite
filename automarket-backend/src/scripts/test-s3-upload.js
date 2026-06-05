require('dotenv').config();
const { uploadImageToS3 } = require('../services/s3Service');
const fs = require('fs');
const path = require('path');

const runTest = async () => {
    console.log('Testing S3 Upload...');
    console.log('Endpoint:', 'https://s3.example.com');
    console.log('Bucket:', process.env.DO_BUCKET_NAME);

    // Create a simple text buffer that pretends to be an image (s3Service expects image but sharp handles buffers, might fail if not image, let's try)
    // Actually s3Service uses sharp to resize, so it MUST be a valid image.
    // Let's create a minimal valid JPEG buffer or use an existing image if we can find one.
    // Since I can't guarantee an image exists, I'll mock sharp or better yet, try to upload a PDF since there is uploadPdfToS3 which likely doesn't process with sharp?
    // uploadPdfToS3 is exported. Let's use that.

    const { uploadPdfToS3 } = require('../services/s3Service');
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n...', 'utf-8');

    try {
        const url = await uploadPdfToS3(pdfBuffer, 'test-uploads', 'test-file');
        console.log('Upload successful!');
        console.log('URL:', url);
    } catch (error) {
        console.error('Upload failed:', error);
    }
};

runTest();
