const {
  createAndUploadInvoicePDF,
  generateProformaInvoicePDF,
} = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

/**
 * Test PDF service functionality
 * This test verifies that the PDF generation and S3 upload works correctly
 */
const testPdfService = async () => {
  console.log('🧪 Testing PDF Service...\n');

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
    // Sample invoice data for testing
    const testInvoiceData = {
      invoice: {
        id: 999,
        invoice_number: 'TEST-INV-999',
        amount: 25000.0,
        currency: 'EUR',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        is_paid: false,
        created_at: new Date(),
        description: 'Test invoice for PDF generation',
      },
      dealer: {
        id: 999,
        name: 'Test Dealer',
        company_name: 'Test Dealer Company AB',
        email: 'testdealer@example.com',
        phone: '+46 123 456 789',
        address: 'Test Street 123, 12345 Test City, Sweden',
      },
      listing: {
        id: 999,
        brand_name: 'BMW',
        model: 'X5',
        registration_number: 'ABC123',
        vin_number: 'WBAFR1C50ED123456',
        color: 'Black',
        fuel_type: 'Diesel',
        transmission_type: 'Automatic',
        km_stand: 75000,
        first_registration: new Date('2020-03-15'),
        features: 'Navigation, Leather seats, Panoramic roof, Heated seats',
      },
      company: {
        name: 'Folkbilar i Svedala AB',
        address: 'Test Company Address, Svedala, Sweden',
        phone: '+46 xxx xxx xxx',
        email: 'info@folkbilar.se',
        website: 'www.folkbilar.se',
      },
    };

    console.log('1️⃣ Testing PDF generation locally...');

    // Test PDF generation (without S3 upload)
    const pdfBuffer = await generateProformaInvoicePDF(testInvoiceData);

    console.log(
      `✅ PDF generated successfully! Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`
    );

    // Save test PDF locally for inspection
    const testPdfPath = path.join(__dirname, 'test-proforma-invoice.pdf');
    fs.writeFileSync(testPdfPath, pdfBuffer);
    console.log(`📄 Test PDF saved locally: ${testPdfPath}\n`);

    console.log('2️⃣ Testing PDF generation and S3 upload...');

    // Test complete flow (PDF generation + S3 upload)
    const s3Url = await createAndUploadInvoicePDF(testInvoiceData);

    console.log(`✅ PDF uploaded to S3 successfully: ${s3Url}\n`);

    console.log('🎉 All PDF tests passed successfully!\n');

    console.log('📝 Test Results:');
    console.log(`- PDF generated locally and saved to: ${testPdfPath}`);
    console.log(`- PDF uploaded to S3: ${s3Url}`);
    console.log('- You can open the local PDF file to verify the content');
    console.log('- You can access the S3 URL to verify the upload');

    console.log('\n🔍 Next Steps:');
    console.log(
      '1. Open the local PDF file to verify the template looks correct'
    );
    console.log(
      '2. Test the PDF generation in a real invoice creation scenario'
    );
    console.log(
      '3. Verify that the PDF link is correctly saved to the invoice record'
    );
  } catch (error) {
    console.error('❌ PDF test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');

    if (error.message.includes('puppeteer')) {
      console.error('🤖 Puppeteer Issue:');
      console.error('   - Make sure chromium-browser is installed');
      console.error(
        '   - Verify the executablePath in pdfService.js is correct'
      );
      console.error('   - Check if the system has the required dependencies');
    } else if (error.message.includes('S3')) {
      console.error('☁️ S3 Issue:');
      console.error('   - Check your AWS credentials and permissions');
      console.error('   - Verify the S3 bucket exists and is accessible');
      console.error('   - Ensure the bucket policy allows file uploads');
    } else {
      console.error('🔧 General troubleshooting:');
      console.error('1. Check all environment variables are set correctly');
      console.error('2. Verify all required dependencies are installed');
      console.error('3. Check the error details above for specific issues');
    }

    console.error('\n📄 Full error details:', error);
  }
};

// Export for use as a module
module.exports = { testPdfService };

// Allow running as a standalone script
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();

  testPdfService()
    .then(() => {
      console.log('\n✨ Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}
