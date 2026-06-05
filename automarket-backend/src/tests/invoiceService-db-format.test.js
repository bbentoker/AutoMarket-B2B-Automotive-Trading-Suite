const InvoiceService = require('../services/invoiceService');
const path = require('path');

/**
 * Test file for Invoice Service with Database Record Format
 * Demonstrates the updated service working with actual database listing format
 */

async function testDatabaseFormatInvoice() {
  console.log('🚀 Testing Invoice Service with Database Format...\n');

  const invoiceService = new InvoiceService();

  // Sample database listing record (as provided by user)
  const databaseListing = {
    id: 475,
    seller_id: null,
    horsepower: 'Minima autem maxime',
    registration_number: '900',
    deal_stage: 'Purchased',
    first_registration: '2024-07-24',
    km_stand: 2222,
    vin_number: '392',
    internal_url: 'Voluptatem Est unde',
    co2: 'Occaecat aut enim to',
    listing_price: '469.00',
    currency: 'euro',
    status_id: 4,
    assigned_to_id: 6,
    is_deleted: false,
    brand_name: 'test',
    model: 'model',
    color: 'Perferendis error co',
    fuel_type: 'Qui cumque impe',
    transmission_type: 'Automatic',
    seat: '25',
    features: 'Et dolor illum ulla',
    vat_or_margin: 'Excl. VAT',
    zoho_id: '834734000001797002',
    proforma_invoice_number: null,
    additional_notes: null,
    tracking_code: null,
    proforma_inv_date: null,
    expected_pick_up_date: null,
    expected_delivery_date: null,
    expected_close_date: null,
    closing_date: null,
    transport_cost: '530.00',
    car_delivery_address: null,
    pick_up_address: null,
    document_sent_address: null,
    seller_email: 'delovuw@mailinator.com',
    seller_company: 'Ingram and Short Inc',
    contact_person: null,
    telephone: '+1 (498) 258-3482',
    mobile: null,
    email_address: null,
    submitted_offer_amount: null,
    amount_sold_for: '3131.00',
    grade: null,
    buyer_company_name: null,
    buyer_s_email: null,
    payment_send_date: null,
    invoice_id: null,
    expiration: 120,
    is_viewed: true,
    car_studio_processed: false,
    previous_accidents: false,
    reference_no: '8PLDZ',
    logo_filename: null,
    is_listingsiteb: false,
    seller_address: 'Est esse earum aut',
    amount_purchased: '86.00',
    belgium_price: '948',
    avg_selling_time: 91,
    listingsitea_link: 'https://www.fanugovefoduje.me',
    created_at: '2025-08-19T13:02:07.818Z',
    updated_at: '2025-08-19T13:07:14.359Z',
    photos: [
      {
        id: 5670,
        url: 'https://assets.automarket.example.com/listings/475/f23d6af7-0852-4537-a148-49624901e11f.jpg',
      },
    ],
  };

  try {
    // Test 1: Generate invoice with manual customer details
    console.log(
      '📄 Test 1: Generating invoice with manual customer details...'
    );

    const customerDetails = {
      name: 'Premium Auto Buyer BV',
      address: 'Industriestraat 123',
      city: '1000 Brussels, Belgium',
      customerNumber: 'PAB2025',
      vatNumber: 'BE0987654321',
    };

    const result1 = await invoiceService.generateInvoice(
      'swedish',
      databaseListing,
      customerDetails,
      {
        outputDir: path.join(__dirname, 'generated/invoices'),
        invoiceNumber: 'DB-TEST-001',
      }
    );

    console.log('✅ Invoice generated successfully!');
    console.log(`   📁 PDF: ${result1.pdfPath}`);
    console.log(`   🔢 Invoice: ${result1.invoiceNumber}`);
    console.log(
      `   💰 Total: ${result1.invoiceData.currency} ${result1.invoiceData.grandTotal}`
    );
    console.log(
      `   🚗 Vehicle: ${databaseListing.brand_name} ${databaseListing.model}`
    );
    console.log(`   📋 VIN: ${databaseListing.vin_number}`);
    console.log(`   📊 Items: ${result1.invoiceData.items.length}`);

    // Show invoice items breakdown
    console.log('\n   📋 Invoice Items:');
    result1.invoiceData.items.forEach((item) => {
      console.log(
        `   - ${item.designation}: ${result1.invoiceData.currency} ${item.total}`
      );
    });

    // Test 2: Generate invoice using listing data only (auto-extract customer)
    console.log(
      '\n📄 Test 2: Generating invoice with auto-extracted customer details...'
    );

    const result2 = await invoiceService.generateInvoiceFromListing(
      'belgian',
      databaseListing,
      {
        outputDir: path.join(__dirname, 'generated/invoices'),
        invoiceNumber: 'DB-AUTO-002',
      }
    );

    console.log('✅ Invoice with auto-extracted customer generated!');
    console.log(`   📁 PDF: ${result2.pdfPath}`);
    console.log(`   🔢 Invoice: ${result2.invoiceNumber}`);
    console.log(
      `   💰 Total: ${result2.invoiceData.currency} ${result2.invoiceData.grandTotal}`
    );
    console.log(`   👤 Customer: ${result2.invoiceData.billToName}`);
    console.log(`   📧 Email: ${databaseListing.seller_email}`);

    // Test 3: Different listing with more complete data
    console.log('\n📄 Test 3: Testing with enhanced listing data...');

    const enhancedListing = {
      ...databaseListing,
      id: 476,
      brand_name: 'BMW',
      model: 'X3 xDrive20d',
      amount_sold_for: '28500.00',
      listing_price: '27800.00',
      vin_number: 'WBAXG91050DL67890',
      km_stand: 45000,
      first_registration: '2022-03-15',
      transport_cost: '750.00',
      belgium_price: '29250',
      reference_no: 'BMW-X3-001',
      seller_company: 'BMW Premium Stockholm AB',
      seller_address: 'Sveavägen 123, 111 57 Stockholm, Sweden',
      seller_email: 'sales@bmw-premium.se',
      telephone: '+46 8 555 12 34',
      fuel_type: 'Diesel',
      transmission_type: 'Automatic',
      color: 'Alpine White',
      horsepower: '190',
      features: 'xDrive, Navigation, Leather Interior, Panoramic Roof',
    };

    const result3 = await invoiceService.generateInvoiceFromListing(
      'swedish',
      enhancedListing,
      {
        outputDir: path.join(__dirname, 'generated/invoices'),
      }
    );

    console.log('✅ Enhanced listing invoice generated!');
    console.log(`   📁 PDF: ${result3.pdfPath}`);
    console.log(`   🔢 Invoice: ${result3.invoiceNumber}`);
    console.log(
      `   💰 Total: ${result3.invoiceData.currency} ${result3.invoiceData.grandTotal}`
    );
    console.log(`   🏢 Company: ${result3.invoiceData.companyName}`);

    console.log('\n🎉 All database format tests completed successfully!');

    return {
      test1: result1,
      test2: result2,
      test3: result3,
    };
  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.message.includes('Puppeteer')) {
      console.log('\n💡 To fix this, run: npm install puppeteer');
    }

    throw error;
  }
}

/**
 * Show the data mapping between database and invoice
 */
function showDataMapping() {
  console.log('\n📊 Database to Invoice Data Mapping:\n');

  const mappings = [
    { db: 'brand_name', invoice: 'Vehicle Make', example: 'BMW' },
    { db: 'model', invoice: 'Vehicle Model', example: 'X3 xDrive20d' },
    { db: 'amount_sold_for', invoice: 'Primary Price', example: '28500.00' },
    { db: 'listing_price', invoice: 'Fallback Price', example: '27800.00' },
    { db: 'vin_number', invoice: 'VIN', example: 'WBAXG91050DL67890' },
    { db: 'km_stand', invoice: 'Mileage', example: '45000' },
    {
      db: 'first_registration',
      invoice: 'First Registration',
      example: '2022-03-15',
    },
    { db: 'transport_cost', invoice: 'Transport Item', example: '750.00' },
    { db: 'belgium_price', invoice: 'Belgium Adjustment', example: '29250' },
    { db: 'reference_no', invoice: 'Customer Number', example: 'BMW-X3-001' },
    {
      db: 'seller_company',
      invoice: 'Customer Name',
      example: 'BMW Premium Stockholm AB',
    },
    {
      db: 'seller_address',
      invoice: 'Customer Address',
      example: 'Sveavägen 123...',
    },
    {
      db: 'seller_email',
      invoice: 'Customer Email',
      example: 'sales@bmw-premium.se',
    },
  ];

  console.log('Database Field → Invoice Field → Example');
  console.log('─'.repeat(60));
  mappings.forEach((mapping) => {
    console.log(
      `${mapping.db.padEnd(20)} → ${mapping.invoice.padEnd(18)} → ${mapping.example}`
    );
  });

  console.log('\n📝 Notes:');
  console.log(
    '- amount_sold_for is used if available, otherwise listing_price'
  );
  console.log('- transport_cost creates a separate invoice item if > 0');
  console.log(
    '- belgium_price creates adjustment item if different from main price'
  );
  console.log('- Customer info is extracted from seller_ fields');
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      showDataMapping();
      await testDatabaseFormatInvoice();
    } catch (error) {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testDatabaseFormatInvoice,
  showDataMapping,
};
