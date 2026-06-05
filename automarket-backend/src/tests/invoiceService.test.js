const InvoiceService = require('../services/invoiceService');
const path = require('path');

/**
 * Test file for Invoice Service
 * Demonstrates how to use the service to generate invoices
 */

async function testInvoiceGeneration() {
  const invoiceService = new InvoiceService();

  // Sample listing details (database record format)
  const sampleListingDetails = {
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

  // Sample customer details
  const sampleCustomerDetails = {
    name: 'Ets Willems Sa',
    address: 'Route de Maestricht 84',
    city: '4600 Visé, Belgium',
    customerNumber: '7510084854',
    vatNumber: 'BE0440667535',
  };

  console.log('🚀 Testing Invoice Service...\n');

  try {
    // Test 1: Generate Swedish company invoice
    console.log('📄 Generating Swedish company invoice...');
    const swedishResult = await invoiceService.generateInvoice(
      'swedish',
      sampleListingDetails,
      sampleCustomerDetails,
      {
        outputDir: path.join(__dirname, 'generated/invoices'),
      }
    );

    console.log('✅ Swedish invoice generated successfully!');
    console.log(`   📁 PDF saved to: ${swedishResult.pdfPath}`);
    console.log(`   🔢 Invoice Number: ${swedishResult.invoiceNumber}`);
    console.log(
      `   💰 Total: ${swedishResult.invoiceData.currency} ${swedishResult.invoiceData.grandTotal}\n`
    );

    // Test 2: Generate Belgian company invoice
    console.log('📄 Generating Belgian company invoice...');
    const belgianResult = await invoiceService.generateInvoice(
      'belgian',
      sampleListingDetails,
      sampleCustomerDetails,
      {
        outputDir: path.join(__dirname, 'generated/invoices'),
        invoiceNumber: 'INV-BE-2025-001',
      }
    );

    console.log('✅ Belgian invoice generated successfully!');
    console.log(`   📁 PDF saved to: ${belgianResult.pdfPath}`);
    console.log(`   🔢 Invoice Number: ${belgianResult.invoiceNumber}`);
    console.log(
      `   💰 Total: ${belgianResult.invoiceData.currency} ${belgianResult.invoiceData.grandTotal}\n`
    );

    // Test 3: Show available companies
    console.log('🏢 Available billing companies:');
    const companies = invoiceService.getAvailableCompanies();
    companies.forEach((company) => {
      const info = invoiceService.getCompanyInfo(company);
      console.log(`   - ${company}: ${info.companyName} (${info.currency})`);
    });

    console.log('\n🎉 All tests completed successfully!');

    return {
      swedish: swedishResult,
      belgian: belgianResult,
    };
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

/**
 * Test with different vehicle types
 */
async function testDifferentVehicleTypes() {
  const invoiceService = new InvoiceService();

  const vehicleTypes = [
    {
      name: 'BMW X3',
      details: {
        id: 476,
        brand_name: 'BMW',
        model: 'X3 2.0 xDrive',
        amount_sold_for: '25000.00',
        listing_price: '24500.00',
        vin_number: 'WBAXG91050DL12345',
        km_stand: 35000,
        first_registration: '2023-01-15',
        transport_cost: '800.00',
        belgium_price: '25500',
        currency: 'euro',
        deal_stage: 'Sold',
        reference_no: '9BMWX',
        fuel_type: 'Diesel',
        transmission_type: 'Automatic',
        color: 'Black',
        seller_company: 'BMW Dealer AB',
        seller_email: 'sales@bmwdealer.se',
        telephone: '+46 8 123 456',
        vat_or_margin: 'Excl. VAT', // Test Reverse Charge
      },
    },
    {
      name: 'Mercedes C-Class',
      details: {
        id: 477,
        brand_name: 'Mercedes-Benz',
        model: 'C220d AMG Line',
        amount_sold_for: '32000.00',
        listing_price: '31500.00',
        vin_number: 'WDD2050231A123456',
        km_stand: 28000,
        first_registration: '2023-06-10',
        transport_cost: '600.00',
        belgium_price: '33200',
        currency: 'euro',
        deal_stage: 'Sold',
        reference_no: '7MERC',
        vat_or_margin: 'Incl. VAT', // Test Margin Scheme
        fuel_type: 'Diesel',
        transmission_type: 'Automatic',
        color: 'Silver',
        seller_company: 'Mercedes Center Stockholm',
        seller_email: 'sales@mercedes-stockholm.se',
        telephone: '+46 8 987 654',
      },
    },
    {
      name: 'Audi A4 (Margin Scheme)',
      details: {
        id: 478,
        brand_name: 'Audi',
        model: 'A4 Avant 2.0 TDI',
        amount_sold_for: '28000.00',
        listing_price: '27500.00',
        vin_number: 'WAUZZZ8K2DA123456',
        km_stand: 55000,
        first_registration: '2021-08-20',
        transport_cost: '450.00',
        belgium_price: '28450',
        currency: 'euro',
        deal_stage: 'Sold',
        reference_no: '9AUDI',
        vat_or_margin: 'Margin Scheme', // Test Margin Scheme directly
        fuel_type: 'Diesel',
        transmission_type: 'Automatic',
        color: 'White',
        seller_company: 'Audi Center Malmö',
        seller_email: 'sales@audi-malmo.se',
        telephone: '+46 40 123 789',
      },
    },
  ];

  const customerDetails = {
    name: 'Premium Auto Import BV',
    address: 'Industrieweg 42',
    city: '1000 Brussels, Belgium',
    customerNumber: 'PAI001',
    vatNumber: 'BE0123456789',
  };

  console.log('\n🚗 Testing different vehicle types...\n');

  for (const vehicleType of vehicleTypes) {
    try {
      console.log(`📋 Processing ${vehicleType.name}...`);

      const result = await invoiceService.generateInvoice(
        'swedish',
        vehicleType.details,
        customerDetails,
        {
          outputDir: path.join(__dirname, 'generated/invoices'),
        }
      );

      console.log(
        `✅ ${vehicleType.name} invoice generated: ${result.invoiceNumber}`
      );
    } catch (error) {
      console.error(
        `❌ Failed to generate ${vehicleType.name} invoice:`,
        error.message
      );
    }
  }
}

/**
 * Show usage examples
 */
function showUsageExamples() {
  console.log('\n📖 Usage Examples:\n');

  console.log('1. Basic Usage:');
  console.log(`
const InvoiceService = require('./services/invoiceService');
const invoiceService = new InvoiceService();

const result = await invoiceService.generateInvoice(
  'swedish',        // or 'belgian'
  listingDetails,   // Vehicle and services info
  customerDetails,  // Customer billing info
  options          // Optional settings
);
`);

  console.log('2. Listing Details Structure (Database Record Format):');
  console.log(`
const listingDetails = {
  id: 475,
  brand_name: 'Volkswagen',
  model: 'Golf GTI',
  amount_sold_for: '18000.00',
  listing_price: '17500.00',
  vin_number: 'WVWZZZ1JZ...',
  km_stand: 45000,
  first_registration: '2021-03-15',
  transport_cost: '500.00',
  belgium_price: '18500',
  currency: 'euro',
  deal_stage: 'Sold',
  reference_no: 'ABC123',
  vat_or_margin: 'Excl. VAT',
  seller_company: 'Car Dealer AB',
  seller_email: 'sales@cardealer.se'
};
`);

  console.log('3. Customer Details Structure:');
  console.log(`
const customerDetails = {
  name: 'Customer Company Name',
  address: 'Street Address',
  city: 'City, Country',
  customerNumber: 'CUST001',
  vatNumber: 'VAT123456'
};
`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await testInvoiceGeneration();
      await testDifferentVehicleTypes();
      showUsageExamples();
    } catch (error) {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testInvoiceGeneration,
  testDifferentVehicleTypes,
  showUsageExamples,
};
