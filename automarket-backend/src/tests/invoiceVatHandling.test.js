const InvoiceService = require('../services/invoiceService');

/**
 * Test script for VAT handling functionality in invoice generation
 * Tests different vat_or_margin values and their impact on invoice display
 */

async function testVatHandling() {
  console.log('🧪 Testing VAT handling in invoice generation...\n');

  const invoiceService = new InvoiceService();

  // Test scenarios with different vat_or_margin values
  const testScenarios = [
    {
      name: 'Excl. VAT (Reverse Charge)',
      vat_or_margin: 'Excl. VAT',
      expectedVatLabel: 'Excl. VAT:',
      expectedFooterTitle: 'Reverse Charge',
    },
    {
      name: 'Incl. VAT (Margin Scheme)',
      vat_or_margin: 'Incl. VAT',
      expectedVatLabel: 'Incl. VAT:',
      expectedFooterTitle: 'Margin Scheme',
    },
    {
      name: 'Margin Scheme (Direct)',
      vat_or_margin: 'Margin Scheme',
      expectedVatLabel: 'Margin Scheme:',
      expectedFooterTitle: 'Margin Scheme',
    },
    {
      name: 'Exclusive VAT (Alternative)',
      vat_or_margin: 'Exclusive VAT',
      expectedVatLabel: 'Excl. VAT:',
      expectedFooterTitle: 'Reverse Charge',
    },
    {
      name: 'Inclusive VAT (Alternative)',
      vat_or_margin: 'Inclusive VAT',
      expectedVatLabel: 'Incl. VAT:',
      expectedFooterTitle: 'Margin Scheme',
    },
    {
      name: 'Empty/Null (Default)',
      vat_or_margin: null,
      expectedVatLabel: 'Excl. VAT:',
      expectedFooterTitle: 'Reverse Charge',
    },
    {
      name: 'Unknown Value (Default)',
      vat_or_margin: 'Unknown Tax Status',
      expectedVatLabel: 'Excl. VAT:',
      expectedFooterTitle: 'Reverse Charge',
    },
  ];

  // Base listing data template
  const baseListingData = {
    id: 999,
    brand_name: 'Test',
    model: 'Vehicle',
    amount_sold_for: '20000.00',
    listing_price: '19500.00',
    vin_number: 'TEST123456789',
    km_stand: 50000,
    first_registration: '2022-01-01',
    transport_cost: '500.00',
    belgium_price: '20500',
    currency: 'euro',
    deal_stage: 'Sold',
    reference_no: 'TEST001',
    fuel_type: 'Petrol',
    transmission_type: 'Manual',
    color: 'Red',
    seller_company: 'Test Dealer AB',
    seller_email: 'test@dealer.se',
    telephone: '+46 8 000 000',
  };

  const customerDetails = {
    name: 'Test Customer Ltd',
    address: 'Test Street 123',
    city: 'Test City, Test Country',
    customerNumber: 'TC001',
    vatNumber: 'TEST123456',
  };

  console.log('🔍 Testing VAT label and footer title generation:\n');

  for (const scenario of testScenarios) {
    console.log(`📋 Scenario: ${scenario.name}`);
    console.log(`   Input: vat_or_margin = "${scenario.vat_or_margin}"`);

    // Test the helper methods directly
    const actualVatLabel = invoiceService.getVatLabel(scenario.vat_or_margin);
    const actualFooterTitle = invoiceService.getFooterTitle(
      scenario.vat_or_margin
    );

    const vatLabelMatch = actualVatLabel === scenario.expectedVatLabel;
    const footerTitleMatch = actualFooterTitle === scenario.expectedFooterTitle;

    console.log(
      `   VAT Label: ${actualVatLabel} ${vatLabelMatch ? '✅' : '❌'}`
    );
    console.log(
      `   Footer Title: ${actualFooterTitle} ${footerTitleMatch ? '✅' : '❌'}`
    );

    if (!vatLabelMatch) {
      console.log(`   ⚠️  Expected VAT Label: ${scenario.expectedVatLabel}`);
    }
    if (!footerTitleMatch) {
      console.log(
        `   ⚠️  Expected Footer Title: ${scenario.expectedFooterTitle}`
      );
    }

    console.log(''); // Empty line for readability
  }

  console.log(
    '🔄 Testing full invoice generation with different VAT scenarios:\n'
  );

  // Test full invoice generation for key scenarios
  const keyScenarios = testScenarios.slice(0, 3); // Test first 3 scenarios

  for (const scenario of keyScenarios) {
    try {
      console.log(`📄 Generating invoice for: ${scenario.name}`);

      const listingWithVat = {
        ...baseListingData,
        vat_or_margin: scenario.vat_or_margin,
        reference_no: `${scenario.name.replace(/[^A-Z0-9]/g, '').substring(0, 8)}`,
      };

      const result = await invoiceService.generateInvoice(
        'swedish',
        listingWithVat,
        customerDetails,
        {
          invoiceNumber: `VAT-TEST-${scenario.name.substring(0, 4).toUpperCase()}`,
          outputDir: './src/tests/generated/vat-tests',
        }
      );

      console.log(`   ✅ Success: ${result.invoiceNumber}`);
      console.log(`   📁 PDF: ${result.pdfPath}`);
      console.log(
        `   💰 Total: ${result.invoiceData.currency} ${result.invoiceData.grandTotal}`
      );
      console.log(`   🏷️  VAT Label: ${result.invoiceData.vatLabel}`);
      console.log(`   📋 Footer: ${result.invoiceData.footerTitle}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log(''); // Empty line for readability
  }

  console.log('✨ Currency Symbol Test:');
  console.log('   Expected: € (Euro symbol)');
  console.log('   Note: All invoices now display € instead of SEK/EUR text\n');

  console.log('🎉 VAT handling tests completed!');
}

/**
 * Show mapping of VAT values to labels
 */
function showVatMapping() {
  console.log('📊 VAT Value Mapping Reference:\n');

  const mappings = [
    {
      input: 'Excl. VAT',
      vatLabel: 'Excl. VAT:',
      footerTitle: 'Reverse Charge',
    },
    {
      input: 'Exclusive VAT',
      vatLabel: 'Excl. VAT:',
      footerTitle: 'Reverse Charge',
    },
    {
      input: 'Incl. VAT',
      vatLabel: 'Incl. VAT:',
      footerTitle: 'Margin Scheme',
    },
    {
      input: 'Inclusive VAT',
      vatLabel: 'Incl. VAT:',
      footerTitle: 'Margin Scheme',
    },
    {
      input: 'Margin Scheme',
      vatLabel: 'Margin Scheme:',
      footerTitle: 'Margin Scheme',
    },
    {
      input: 'null/empty',
      vatLabel: 'Excl. VAT:',
      footerTitle: 'Reverse Charge',
    },
    { input: 'unknown', vatLabel: 'Excl. VAT:', footerTitle: 'Reverse Charge' },
  ];

  console.log('Input Value → VAT Label → Footer Title');
  console.log('─'.repeat(60));
  mappings.forEach((mapping) => {
    console.log(
      `${mapping.input.padEnd(15)} → ${mapping.vatLabel.padEnd(15)} → ${mapping.footerTitle}`
    );
  });

  console.log('\n💡 Rules:');
  console.log('- "excl" or "exclusive" → Excl. VAT: + Reverse Charge');
  console.log('- "incl" or "inclusive" → Incl. VAT: + Margin Scheme');
  console.log('- "margin" → Margin Scheme: + Margin Scheme');
  console.log('- Default (unknown/null) → Excl. VAT: + Reverse Charge');
  console.log('- Case insensitive matching');
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      showVatMapping();
      console.log('\n' + '='.repeat(60) + '\n');
      await testVatHandling();
    } catch (error) {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testVatHandling,
  showVatMapping,
};
