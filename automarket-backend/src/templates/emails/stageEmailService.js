const { carsForSaleTemplate } = require('./stages/carsForSale');
const { reservedTemplate } = require('./stages/reserved');
const { offersTemplate } = require('./stages/offers');
const { purchasedTemplate } = require('./stages/purchased');
const { proformaInvoiceSentTemplate } = require('./stages/proformaInvoiceSent');
const { paymentReceivedTemplate } = require('./stages/paymentReceived');
const { paymentSentTemplate } = require('./stages/paymentSent');
const { carDeregisteredTemplate } = require('./stages/carDeregistered');
const { dealDoneTemplate } = require('./stages/dealDone');
const { noDealTemplate } = require('./stages/noDeal');
const { carDeliveredTemplate } = require('./stages/carDelivered');
const { documentsSentTemplate } = require('./stages/documentsSent');
const { transportBookedTemplate } = require('./stages/transportBooked');
const { carPickedUpTemplate } = require('./stages/carPickedUp');
const { weeklyDealerReport } = require('./stages/weeklyDealerReport');

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
];

// Template mapping for easy access
const templateMap = {
  carsForSale: carsForSaleTemplate,
  reserved: reservedTemplate,
  offers: offersTemplate,
  purchased: purchasedTemplate,
  proformaInvoiceSent: proformaInvoiceSentTemplate,
  paymentReceived: paymentReceivedTemplate,
  paymentSent: paymentSentTemplate,
  carDeregistered: carDeregisteredTemplate,
  dealDone: dealDoneTemplate,
  noDeal: noDealTemplate,
  carDelivered: carDeliveredTemplate,
  documentsSent: documentsSentTemplate,
  transportBooked: transportBookedTemplate,
  carPickedUp: carPickedUpTemplate,
  weeklyDealerReport,
};

// Alternative naming for better readability
const stageNameMap = {
  'Cars for Sale': 'carsForSale',
  Reserved: 'reserved',
  Offers: 'offers',
  Purchased: 'purchased',
  'Proforma Invoice Sent': 'proformaInvoiceSent',
  'Payment Received': 'paymentReceived',
  'Payment Sent': 'paymentSent',
  'Car De-registered': 'carDeregistered',
  'Deal Done': 'dealDone',
  'No Deal': 'noDeal',
  'Car Delivered': 'carDelivered',
  'Documents Sent': 'documentsSent',
  'Transport Booked': 'transportBooked',
  'Car Picked Up': 'carPickedUp',
  'Weekly Dealer Report': 'weeklyDealerReport',
};

/**
 * Get email template by stage name
 * @param {string} templateName - The name of the template (e.g., 'carsForSale' or 'Cars for Sale')
 * @param {object} data - The data to pass to the template
 * @param {string} language - The language code (e.g., 'en', 'nl', 'fr', 'it', 'de')
 * @param {object} listingDetails - Optional listing details
 * @param {string} loginCode - Optional login code for URL generation
 * @returns {object} - Object containing subject and body of the email
 */
const getStageEmailTemplate = (
  templateName,
  data = {},
  language = 'en',
  listingDetails,
  loginCode = null
) => {
  // Normalize template name
  const normalizedName = stageNameMap[templateName] || templateName;

  // Get the template function
  const templateFunction = templateMap[normalizedName];

  if (!templateFunction) {
    console.error(
      `Template '${templateName}' not found. Available templates: ${Object.keys(templateMap).join(', ')}`
    );
    throw new Error(
      `Template '${templateName}' not found. Available templates: ${Object.keys(templateMap).join(', ')}`
    );
  }

  console.log('Template function found, generating content...');

  // Validate language
  const validLanguages = languages.map((lang) => lang.code);
  if (!validLanguages.includes(language)) {
    console.warn(
      `Language '${language}' not supported. Falling back to 'en'. Supported languages: ${validLanguages.join(', ')}`
    );
    language = 'en';
  }

  // Get the template content
  // For templates that need dealerName, extract it from data
  const dealerName = data?.vendorAccountName || data?.dealerName || 'Dealer';
  console.log('Dealer name extracted:', dealerName);

  // Add login code to data if provided
  const templateData = loginCode ? { ...data, loginCode } : data;
  console.log('Login code included in template data:', !!loginCode);

  // For proforma invoice template, pass invoice URL if available
  let result;
  if (normalizedName === 'proformaInvoiceSent') {
    const invoiceUrl =
      templateData?.invoiceUrl ||
      listingDetails?.proforma_invoice_s3_url ||
      null;
    console.log('Invoice URL for proforma template:', invoiceUrl);
    result = templateFunction(
      templateData,
      language,
      listingDetails,
      dealerName,
      invoiceUrl
    );
  } else {
    result = templateFunction(
      templateData,
      language,
      listingDetails,
      dealerName
    );
  }
  console.log('Template content generated successfully');

  return result;
};

/**
 * Get list of available templates
 * @returns {array} - Array of template names
 */
const getAvailableTemplates = () => {
  return Object.keys(stageNameMap);
};

/**
 * Get list of supported languages
 * @returns {array} - Array of language objects
 */
const getSupportedLanguages = () => {
  return languages;
};

module.exports = {
  getStageEmailTemplate,
  getAvailableTemplates,
  getSupportedLanguages,
  languages,
};
