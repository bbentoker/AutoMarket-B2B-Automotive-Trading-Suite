const InvoiceService = require('../services/invoiceService');

/**
 * Example usage of Invoice Service
 * This file demonstrates how to generate invoices for both Swedish and Belgian companies
 */

async function generateExampleInvoices() {
  console.log('🚀 Invoice Service Example\n');

  const invoiceService = new InvoiceService();

  // Example 1: Swedish company invoice for a car sale (database record format)
  const carListingDetails = {
    id: 475,
    brand_name: 'Volkswagen',
    model: 'T-ROC 1.0 TSI',
    amount_sold_for: '15000.00',
    listing_price: '14500.00',
    vin_number: 'WVGZZZA1ZNV106073',
    km_stand: 42000,
    first_registration: '2022-02-21',
    transport_cost: '530.00',
    belgium_price: '15530',
    currency: 'euro',
    deal_stage: 'Sold',
    reference_no: '8PLDZ',
    vat_or_margin: 'Excl. VAT',
    fuel_type: 'Gasoline',
    transmission_type: 'Manual',
    color: 'Blue',
    seller_company: 'Volkswagen Dealer Stockholm',
    seller_email: 'sales@vw-stockholm.se',
    telephone: '+46 8 555 123',
    seller_address: 'Bilgatan 15, Stockholm',
  };

  const customerDetails = {
    name: 'Ets Willems Sa',
    address: 'Route de Maestricht 84',
    city: '4600 Visé, Belgium',
    customerNumber: '7510084854',
    vatNumber: 'BE0440667535',
  };

  try {
    console.log('📄 Generating Swedish company invoice...');
    const swedishInvoice = await invoiceService.generateInvoice(
      'swedish',
      carListingDetails,
      customerDetails
    );

    console.log('✅ Swedish invoice generated:');
    console.log(`   - Invoice Number: ${swedishInvoice.invoiceNumber}`);
    console.log(`   - PDF Path: ${swedishInvoice.pdfPath}`);
    console.log(
      `   - Total: ${swedishInvoice.invoiceData.currency} ${swedishInvoice.invoiceData.grandTotal}\n`
    );

    console.log('📄 Generating Belgian company invoice...');
    const belgianInvoice = await invoiceService.generateInvoice(
      'belgian',
      carListingDetails,
      customerDetails,
      {
        invoiceNumber: 'BE-2025-001', // Custom invoice number
      }
    );

    console.log('✅ Belgian invoice generated:');
    console.log(`   - Invoice Number: ${belgianInvoice.invoiceNumber}`);
    console.log(`   - PDF Path: ${belgianInvoice.pdfPath}`);
    console.log(
      `   - Total: ${belgianInvoice.invoiceData.currency} ${belgianInvoice.invoiceData.grandTotal}\n`
    );

    // Example 2: Different vehicle type (luxury car)
    const luxuryCarDetails = {
      id: 478,
      brand_name: 'BMW',
      model: 'X5 M50d',
      amount_sold_for: '45000.00',
      listing_price: '44000.00',
      vin_number: 'WBAKR81080CR12345',
      km_stand: 25000,
      first_registration: '2023-05-10',
      transport_cost: '800.00',
      belgium_price: '47800',
      currency: 'euro',
      deal_stage: 'Sold',
      reference_no: 'BMW55',
      vat_or_margin: 'Incl. VAT',
      fuel_type: 'Diesel',
      transmission_type: 'Automatic',
      color: 'Black Metallic',
      horsepower: '400',
      co2: '165',
      features: 'M Performance Package, Panoramic Roof, Harman Kardon',
      seller_company: 'BMW Premium Motors',
      seller_email: 'premium@bmw-motors.se',
      telephone: '+46 8 777 888',
      seller_address: 'Luxury Car Street 1, Stockholm',
    };

    const premiumCustomer = {
      name: 'Premium Auto Dealership AB',
      address: 'Storgatan 123',
      city: '11122 Stockholm, Sweden',
      customerNumber: 'PAD2025',
      vatNumber: 'SE123456789001',
    };

    console.log('📄 Generating premium vehicle invoice...');
    const premiumInvoice = await invoiceService.generateInvoice(
      'swedish',
      luxuryCarDetails,
      premiumCustomer
    );

    console.log('✅ Premium invoice generated:');
    console.log(`   - Invoice Number: ${premiumInvoice.invoiceNumber}`);
    console.log(`   - PDF Path: ${premiumInvoice.pdfPath}`);
    console.log(
      `   - Total: ${premiumInvoice.invoiceData.currency} ${premiumInvoice.invoiceData.grandTotal}\n`
    );

    console.log('🎉 All example invoices generated successfully!');
  } catch (error) {
    console.error('❌ Error generating invoices:', error.message);

    if (error.message.includes('Puppeteer')) {
      console.log('\n💡 To fix this, run: npm install puppeteer');
    }
  }
}

// Show company information
function showCompanyInfo() {
  const invoiceService = new InvoiceService();

  console.log('\n🏢 Available Companies:\n');

  const companies = invoiceService.getAvailableCompanies();
  companies.forEach((companyKey) => {
    const info = invoiceService.getCompanyInfo(companyKey);
    console.log(`${companyKey.toUpperCase()} COMPANY:`);
    console.log(`  Name: ${info.companyName}`);
    console.log(
      `  Address: ${info.companyAddress}, ${info.companyCityCountry}`
    );
    console.log(`  VAT: ${info.companyVatNumber}`);
    console.log(`  Currency: ${info.currency}`);
    console.log(`  IBAN: ${info.iban}`);
    console.log(`  Reference: ${info.ourReference}\n`);
  });
}

// Run example if this file is executed directly
if (require.main === module) {
  (async () => {
    showCompanyInfo();
    await generateExampleInvoices();
  })();
}

module.exports = {
  generateExampleInvoices,
  showCompanyInfo,
};
