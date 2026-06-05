const fs = require('fs');
const path = require('path');

/**
 * Test data for AutoMarket Invoice Template
 * This file contains all the variables extracted from the original HTML template
 */
const invoiceData = {
  // Header Section
  companyName: 'FOLKBILAR I SVEDALA AB',
  logoText: 'LOGO',
  invoiceTitle: 'Proforma Invoice',
  pageInfo: 'Page 1(1)',

  // Invoice Details Section
  invoiceDate: '2025-06-30',
  invoiceNumber: '5526',
  ocrNumber: '552661',

  // Bill To Section
  billToName: 'Ets Willems Sa',
  billToAddress: 'Route de Maestricht 84',
  billToCity: '4600 Visé, Belgium',

  // Customer Information
  customerNumber: '7510084854',
  customerVatNumber: 'BE0440667535',

  // Reference Information
  ourReference: 'Noor Sangin',
  dueDate: '2025-07-02',
  penaltyInterest: '10%',

  // Items Array - Sequential numbering starting from 1001
  items: [
    {
      itemNumber: '1001',
      designation: 'Volkswagen T-ROC 1.0 TSI',
      amount: '1,00',
      unit: 'st',
      pricePerUnit: '15 000,00',
      total: '15 000,00',
      vin: 'WVGZZZA1ZNV106073',
      kmStand: '42 000',
      firstReg: '2022-02-21',
    },
    {
      itemNumber: '1002',
      designation: 'Transport EU',
      amount: '1,00',
      unit: '',
      pricePerUnit: '530,00',
      total: '530,00',
      vin: null,
      kmStand: null,
      firstReg: null,
    },
  ],

  // Summary Section
  subtotal: '15 530,00',
  grandTotal: '15 530,00',

  // Payment Section
  duePaymentLabel: 'DUE PAYMENT',
  currency: 'SEK',
  iban: 'SE61 1200 0000 0123 5065 4524',
  bic: 'DABASESX',

  // Footer Section
  footerTitle: 'Reverse Charge',
  companyFullName: 'FOLKBILAR I SVEDALA AB',
  companyAddress: 'Verkstadsgatan 10',
  companyCityCountry: '23351 Svedala, Sweden',
  companyPhone: '0737002449',
  companyEmail: 'info@folkbilar.se',
  companyWebsite: 'https://folkbilar.se/',

  // Additional Details
  bankgiro: '544-9814',
  corporateId: '559419027301',
  companyVatNumber: 'SE559419027301',
  taxApprovalText: 'Approved for f-tax',
};

/**
 * Simple template engine function to replace placeholders with actual values
 * Supports basic variable replacement and simple iteration
 * @param {string} template - The HTML template with placeholders
 * @param {object} data - The data object containing values to replace
 * @returns {string} - The processed HTML with values filled in
 */
function processTemplate(template, data) {
  let processedTemplate = template;

  // Handle array iteration for items
  const itemsRegex = /\{\{#each items\}\}([\s\S]*?)\{\{\/each\}\}/g;
  processedTemplate = processedTemplate.replace(
    itemsRegex,
    (match, itemTemplate) => {
      return data.items
        .map((item) => {
          let itemHtml = itemTemplate;

          // Replace conditional blocks
          itemHtml = itemHtml.replace(
            /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
            (match, condition, content) => {
              return item[condition]
                ? content.replace(`{{${condition}}}`, item[condition])
                : '';
            }
          );

          // Replace regular variables
          Object.keys(item).forEach((key) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            itemHtml = itemHtml.replace(regex, item[key] || '');
          });

          return itemHtml;
        })
        .join('');
    }
  );

  // Replace all other variables
  Object.keys(data).forEach((key) => {
    if (key !== 'items') {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedTemplate = processedTemplate.replace(regex, data[key]);
    }
  });

  return processedTemplate;
}

/**
 * Test function to generate invoice HTML
 */
function generateInvoice() {
  try {
    // Read the template file
    const templatePath = path.join(
      __dirname,
      '../templates/invoice-template.html'
    );
    const template = fs.readFileSync(templatePath, 'utf8');

    // Process the template with test data
    const processedHtml = processTemplate(template, invoiceData);

    // Save the generated invoice
    const outputPath = path.join(__dirname, 'generated/test-invoice.html');

    // Ensure the generated directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, processedHtml);

    console.log('✅ Invoice generated successfully!');
    console.log(`📄 Output file: ${outputPath}`);
    console.log('\n📊 Invoice Data Summary:');
    console.log(`- Company: ${invoiceData.companyName}`);
    console.log(`- Invoice #: ${invoiceData.invoiceNumber}`);
    console.log(`- Date: ${invoiceData.invoiceDate}`);
    console.log(`- Customer: ${invoiceData.billToName}`);
    console.log(`- Total: ${invoiceData.currency} ${invoiceData.grandTotal}`);
    console.log(`- Items: ${invoiceData.items.length}`);

    return outputPath;
  } catch (error) {
    console.error('❌ Error generating invoice:', error.message);
    throw error;
  }
}

/**
 * Test function to validate all variables are properly replaced
 */
function validateTemplate() {
  try {
    const templatePath = path.join(
      __dirname,
      '../templates/invoice-template.html'
    );
    const template = fs.readFileSync(templatePath, 'utf8');

    // Check for unreplaced placeholders
    const placeholderRegex = /\{\{[^}]+\}\}/g;
    const processedHtml = processTemplate(template, invoiceData);
    const unreplaced = processedHtml.match(placeholderRegex);

    if (unreplaced && unreplaced.length > 0) {
      console.warn('⚠️  Warning: Found unreplaced placeholders:', unreplaced);
      return false;
    } else {
      console.log('✅ All placeholders successfully replaced!');
      return true;
    }
  } catch (error) {
    console.error('❌ Error validating template:', error.message);
    return false;
  }
}

/**
 * Alternative test data for different scenarios
 */
const alternativeInvoiceData = {
  ...invoiceData,
  companyName: 'AutoMarket Solutions',
  invoiceNumber: 'INV-2025-001',
  billToName: 'Alternative Customer Ltd',
  billToAddress: '123 Main Street',
  billToCity: 'Stockholm, Sweden',
  items: [
    {
      itemNumber: '1011', // Example of sequential numbering for subsequent invoices
      designation: 'BMW X3 2.0 xDrive',
      amount: '1,00',
      unit: 'st',
      pricePerUnit: '25 000,00',
      total: '25 000,00',
      vin: 'WBAXG91050DL12345',
      kmStand: '35 000',
      firstReg: '2023-01-15',
    },
  ],
  subtotal: '25 000,00',
  grandTotal: '25 000,00',
};

// Export functions and data for use in other files
module.exports = {
  invoiceData,
  alternativeInvoiceData,
  processTemplate,
  generateInvoice,
  validateTemplate,
};

// If this file is run directly, execute the test
if (require.main === module) {
  console.log('🚀 Running Invoice Template Test...\n');

  try {
    // Generate invoice with test data
    const outputPath = generateInvoice();

    // Validate template processing
    validateTemplate();

    console.log('\n🎉 Test completed successfully!');
    console.log(`You can open the generated file at: ${outputPath}`);
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}
