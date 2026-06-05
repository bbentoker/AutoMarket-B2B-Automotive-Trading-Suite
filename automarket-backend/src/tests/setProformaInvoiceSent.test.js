/**
 * Test script for the updated setProformaInvoiceSent endpoint
 * This demonstrates how to use the new billing_company parameter
 */

const axios = require('axios');

// Configuration - update these for your environment
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const LISTING_ID = process.env.TEST_LISTING_ID || 475; // Replace with actual listing ID
const AUTH_TOKEN = process.env.AUTH_TOKEN; // If authentication is required

/**
 * Test the setProformaInvoiceSent endpoint with different billing companies
 */
async function testSetProformaInvoiceSent() {
  console.log(
    '🧪 Testing setProformaInvoiceSent endpoint with invoice generation...\n'
  );

  const testCases = [
    {
      name: 'Swedish Company Invoice',
      billing_company: 'swedish',
      description: 'Generate invoice with FOLKBILAR I SVEDALA AB details',
    },
    {
      name: 'Belgian Company Invoice',
      billing_company: 'belgian',
      description: 'Generate invoice with FOLKBILAR BELGIUM SPRL details',
    },
    {
      name: 'No Invoice Generation',
      billing_company: null,
      description: 'Only update status without generating invoice',
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📋 Test: ${testCase.name}`);
      console.log(`   Description: ${testCase.description}`);

      const requestData = {
        listing_id: LISTING_ID,
      };

      // Add billing_company if specified
      if (testCase.billing_company) {
        requestData.billing_company = testCase.billing_company;
      }

      console.log(`   Request data:`, requestData);

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth header if token is provided
      if (AUTH_TOKEN) {
        headers.Authorization = `Bearer ${AUTH_TOKEN}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}/listings/set-proforma-invoice-sent`,
        requestData,
        { headers }
      );

      console.log(`   ✅ Success:`, response.data);

      if (response.data.data.invoice) {
        const invoice = response.data.data.invoice;
        if (invoice.success) {
          console.log(`   📄 Invoice generated: ${invoice.invoiceNumber}`);
          console.log(`   📁 PDF saved to: ${invoice.pdfPath}`);
        } else {
          console.log(`   ❌ Invoice generation failed: ${invoice.error}`);
        }
      } else {
        console.log(
          `   ℹ️  No invoice generated (billing_company not provided)`
        );
      }
    } catch (error) {
      console.log(`   ❌ Error:`, error.response?.data || error.message);
    }

    console.log(''); // Empty line for readability
  }
}

/**
 * Test invalid billing_company values
 */
async function testInvalidBillingCompany() {
  console.log('🚫 Testing invalid billing_company values...\n');

  const invalidValues = ['german', 'french', 'invalid', ''];

  for (const invalidValue of invalidValues) {
    try {
      console.log(`📋 Testing invalid value: "${invalidValue}"`);

      const response = await axios.post(
        `${API_BASE_URL}/listings/set-proforma-invoice-sent`,
        {
          listing_id: LISTING_ID,
          billing_company: invalidValue,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      console.log(`   ❌ Unexpected success:`, response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`   ✅ Correctly rejected: ${error.response.data.error}`);
      } else {
        console.log(
          `   ❌ Unexpected error:`,
          error.response?.data || error.message
        );
      }
    }
  }
}

/**
 * Show usage examples
 */
function showUsageExamples() {
  console.log('\n📖 API Usage Examples:\n');

  console.log('1. Generate Swedish company invoice:');
  console.log(`
POST /api/listings/set-proforma-invoice-sent
Content-Type: application/json

{
  "listing_id": 475,
  "billing_company": "swedish"
}
`);

  console.log('2. Generate Belgian company invoice:');
  console.log(`
POST /api/listings/set-proforma-invoice-sent
Content-Type: application/json

{
  "listing_id": 475,
  "billing_company": "belgian"
}
`);

  console.log('3. Update status only (no invoice):');
  console.log(`
POST /api/listings/set-proforma-invoice-sent
Content-Type: application/json

{
  "listing_id": 475
}
`);

  console.log('4. Expected response structure:');
  console.log(`
{
  "message": "Proforma invoice sent successfully",
  "data": {
    "listing_id": 475,
    "zoho_transition": { ... },
    "invoice": {
      "success": true,
      "invoiceNumber": "SWEDISH-8PLDZ",
      "pdfPath": "/path/to/invoice.pdf",
      "error": null
    }
  }
}
`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      showUsageExamples();

      // Uncomment these lines to run actual API tests
      // await testSetProformaInvoiceSent();
      // await testInvalidBillingCompany();

      console.log('\n💡 To run API tests:');
      console.log('1. Set TEST_LISTING_ID environment variable');
      console.log('2. Ensure your API server is running');
      console.log('3. Uncomment the test function calls above');
    } catch (error) {
      console.error('💥 Test failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testSetProformaInvoiceSent,
  testInvalidBillingCompany,
  showUsageExamples,
};
