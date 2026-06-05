const fs = require('fs');
const path = require('path');

// Try to use available puppeteer package
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  try {
    puppeteer = require('puppeteer-core');
  } catch (coreError) {
    console.warn(
      '⚠️  Puppeteer not found. Please install puppeteer: npm install puppeteer'
    );
    throw new Error(
      'Puppeteer is required for PDF generation. Run: npm install puppeteer'
    );
  }
}

/**
 * Invoice Service
 * Handles invoice generation for Swedish and Belgian companies
 */
class InvoiceService {
  constructor() {
    this.companyData = {
      swedish: {
        // Header Section
        companyName: 'FOLKBILAR I SVEDALA AB',
        logoText: 'LOGO',

        // Footer Section
        footerTitle: 'Reverse Charge',
        companyFullName: 'FOLKBILAR I SVEDALA AB',
        companyAddress: 'Verkstadsgatan 10',
        companyCityCountry: '23351 Svedala, Sverige',
        companyPhone: '+46 12 92 20',
        companyEmail: 'info@automarket.example.com',
        companyWebsite: 'www.automarket.example.com',

        // Additional Details
        bankgiro: '544-9814',
        corporateId: '559419027301',
        companyVatNumber: 'SE559419027301',

        // Payment Section
        currency: 'SEK',
        iban: 'SE61 1200 0000 0123 5065 4524',
        bic: 'DABASESX',

        // Reference Information
        ourReference: 'Noor Sangin',
        penaltyInterest: '1%',
      },

      belgian: {
        // Header Section
        companyName: 'FOLKBILAR I SVEDALA AB',
        logoText: 'LOGO',

        // Footer Section
        footerTitle: 'Reverse Charge',
        companyFullName: 'FOLKBILAR I SVEDALA AB',
        companyAddress: 'Verkstadsgatan 10',
        companyCityCountry: '23351 Svedala, Sverige',
        companyPhone: '+46 12 92 20',
        companyEmail: 'info@automarket.example.com',
        companyWebsite: 'www.automarket.example.com',

        // Additional Details
        bankgiro: '544-9814',
        corporateId: '559419027301',
        companyVatNumber: 'SE559419027301',

        // Payment Section
        currency: 'SEK',
        iban: 'SE61 1200 0000 0123 5065 4524',
        bic: 'DABASESX',

        // Reference Information
        ourReference: 'Noor Sangin',
        penaltyInterest: '1%',
      },
    };
  }

  /**
   * Generate sequential invoice number
   * @returns {string} - Generated invoice number
   */
  async generateInvoiceNumber() {
    // Get the latest invoice number from database
    const Invoice = require('../models/Invoice');

    try {
      const latestInvoice = await Invoice.findOne({
        where: {
          invoice_number: {
            [require('sequelize').Op.regexp]: '^[0-9]+$', // Only numeric invoice numbers
          },
        },
        order: [['invoice_number', 'DESC']],
      });

      let nextNumber = 1001;
      if (latestInvoice && latestInvoice.invoice_number) {
        const lastNumber = parseInt(latestInvoice.invoice_number);
        nextNumber = lastNumber + 1;
      }

      return nextNumber.toString();
    } catch (error) {
      console.error('Error generating sequential invoice number:', error);
      // Fallback to timestamp-based number
      return Date.now().toString().slice(-6);
    }
  }

  /**
   * Generate sequential item number based on invoice count
   * @returns {Promise<string>} - Generated item number
   */
  async generateItemNumber() {
    const Invoice = require('../models/Invoice');
    const { Op } = require('sequelize');

    try {
      // Count total invoices before the current one
      const invoiceCount = await Invoice.count({
        where: {
          invoice_number: {
            [Op.regexp]: '^[0-9]+$', // Only numeric invoice numbers
          },
        },
      });

      // Each invoice typically has 2 items (vehicle + transport)
      // Calculate starting item number: 1001 + (invoiceCount * 2)
      const nextItemNumber = 1001 + invoiceCount * 2;

      return nextItemNumber.toString();
    } catch (error) {
      console.error('Error generating sequential item number:', error);
      // Fallback: use timestamp-based number
      return ((Date.now() % 100000) + 1001).toString();
    }
  }

  /**
   * Generate OCR number based on invoice number
   * @param {string} invoiceNumber - The invoice number
   * @returns {string} - Generated OCR number
   */
  generateOCRNumber(invoiceNumber) {
    // Simple OCR generation - in real implementation this would follow banking standards
    return invoiceNumber.replace(/[^0-9]/g, '').slice(-6);
  }

  /**
   * Calculate due date (default 2 days from invoice date)
   * @param {Date} invoiceDate - The invoice date
   * @param {number} daysToAdd - Days to add (default 2)
   * @returns {string} - Formatted due date
   */
  calculateDueDate(invoiceDate = new Date(), daysToAdd = 2) {
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Format currency amount
   * @param {number} amount - The amount to format
   * @param {string} locale - Locale for formatting (default 'sv-SE')
   * @returns {string} - Formatted amount
   */
  formatCurrency(amount, locale = 'sv-SE') {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format kilometers without decimals
   * @param {number} kilometers - The kilometers to format
   * @param {string} locale - Locale for formatting (default 'sv-SE')
   * @returns {string} - Formatted kilometers without decimals
   */
  formatKilometers(kilometers, locale = 'sv-SE') {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(kilometers);
  }

  /**
   * Process template with data
   * @param {string} template - HTML template
   * @param {object} data - Data to inject into template
   * @returns {string} - Processed HTML
   */
  processTemplate(template, data) {
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
        processedTemplate = processedTemplate.replace(regex, data[key] || '');
      }
    });

    return processedTemplate;
  }

  /**
   * Generate invoice PDF
   * @param {string} billingCompany - 'swedish' or 'belgian'
   * @param {object} listingDetails - Listing information
   * @param {object} customerDetails - Customer information
   * @param {object} options - Additional options
   * @returns {Promise<string>} - Path to generated PDF file
   */
  async generateInvoice(
    billingCompany,
    listingDetails,
    customerDetails,
    options = {},
    userDetails = null
  ) {
    try {
      // Validate billing company
      if (!this.companyData[billingCompany]) {
        throw new Error(
          `Invalid billing company: ${billingCompany}. Must be 'swedish' or 'belgian'`
        );
      }

      // Get company data
      const companyInfo = this.companyData[billingCompany];

      // Generate invoice details
      const invoiceNumber =
        options.invoiceNumber || (await this.generateInvoiceNumber());
      const invoiceDate =
        options.invoiceDate || new Date().toISOString().split('T')[0];
      const dueDate = options.dueDate || this.calculateDueDate();

      // Generate invoice items first (this will handle item numbering internally)
      const invoiceItems = await this.processListingToItems(listingDetails);

      // Prepare invoice data
      const invoiceData = {
        // Header Section
        companyName: companyInfo.companyName,
        logoText: companyInfo.logoText,
        invoiceTitle: 'Pro Forma Invoice',
        pageInfo: 'Page 1(1)',

        // Invoice Details Section
        invoiceDate: invoiceDate,
        invoiceNumber: invoiceNumber,
        ocrNumber: this.generateOCRNumber(invoiceNumber),

        // Bill To Section (User's billing information)
        billToName:
          userDetails?.company_name ||
          userDetails?.name ||
          customerDetails.name,
        billToAddress:
          this.formatUserAddress(userDetails) || customerDetails.address,
        billToCity: userDetails?.billing_city || customerDetails.city,

        // Customer Information
        customerNumber: customerDetails.customerNumber || 'N/A',
        customerVatNumber: customerDetails.vatNumber || 'N/A',
        yourReference: customerDetails.yourReference || 'N/A',

        // Reference Information
        ourReference: companyInfo.ourReference,
        dueDate: dueDate,
        penaltyInterest: companyInfo.penaltyInterest,

        // Items Array
        items: invoiceItems,

        // Summary Section (calculated from items)
        subtotal: this.formatCurrency(
          this.calculateSubtotalFromItems(invoiceItems)
        ),
        grandTotal: this.formatCurrency(
          this.calculateTotalFromItems(invoiceItems)
        ),

        // VAT handling based on listing vat_or_margin field
        vatLabel: this.getVatLabel(listingDetails.vat_or_margin),

        // Payment Section
        duePaymentLabel: 'Total',
        currency: '€', // Always show Euro symbol
        iban: companyInfo.iban,
        bic: companyInfo.bic,

        // Footer Section
        footerTitle: this.getFooterTitle(listingDetails.vat_or_margin),
        companyFullName: companyInfo.companyFullName,
        companyAddress: companyInfo.companyAddress,
        companyCityCountry: companyInfo.companyCityCountry,
        companyPhone: companyInfo.companyPhone,
        companyEmail: companyInfo.companyEmail,
        companyWebsite: companyInfo.companyWebsite,

        // Additional Details
        bankgiro: companyInfo.bankgiro,
        corporateId: companyInfo.corporateId,
        companyVatNumber: companyInfo.companyVatNumber,
        taxApprovalText: companyInfo.taxApprovalText,
      };

      // Read template
      const templatePath = path.join(
        __dirname,
        '../templates/invoice-template.html'
      );
      const template = fs.readFileSync(templatePath, 'utf8');

      // Process template
      const processedHtml = this.processTemplate(template, invoiceData);

      // Generate PDF
      const pdfPath = await this.generatePDF(
        processedHtml,
        invoiceNumber,
        options.outputDir
      );

      return {
        success: true,
        pdfPath: pdfPath,
        invoiceNumber: invoiceNumber,
        invoiceData: invoiceData,
      };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }

  /**
   * Process listing details into invoice items with sequential numbering
   * @param {object} listingDetails - Listing information (database record format)
   * @param {string} startingItemNumber - Starting item number for this invoice
   * @returns {Promise<array>} - Array of invoice items with sequential numbers
   */
  async processListingToItems(listingDetails, startingItemNumber = null) {
    const items = [];

    // If no starting number provided, generate one based on invoice count
    let currentItemNumber;
    if (startingItemNumber) {
      currentItemNumber = parseInt(startingItemNumber);
    } else {
      currentItemNumber = parseInt(await this.generateItemNumber());
    }

    // Main vehicle item from database listing
    // Use amount_sold_for first, then listing_price as fallback
    const vehiclePrice = parseFloat(
      listingDetails.amount_sold_for || listingDetails.listing_price || 0
    );

    // Debug logging (can be removed in production)
    // console.log('Vehicle pricing debug:', {
    //   amount_sold_for: listingDetails.amount_sold_for,
    //   listing_price: listingDetails.listing_price,
    //   calculated_price: vehiclePrice,
    //   formatted_price: this.formatCurrency(vehiclePrice),
    // });

    items.push({
      itemNumber: currentItemNumber.toString(),
      designation: `Vehicle: ${listingDetails.brand_name || 'Unknown'} ${listingDetails.model || 'Model'}`,
      amount: '1,00',
      unit: 'pcs',
      pricePerUnit: this.formatCurrency(vehiclePrice),
      total: this.formatCurrency(vehiclePrice),
      vin: listingDetails.vin_number || null,
      kmStand: listingDetails.km_stand
        ? this.formatKilometers(listingDetails.km_stand)
        : null,
      firstReg: listingDetails.first_registration || null,
    });

    // Add transport cost if available
    if (
      listingDetails.transport_cost &&
      parseFloat(listingDetails.transport_cost) > 0
    ) {
      // Increment for next item in same invoice
      currentItemNumber++;
      items.push({
        itemNumber: currentItemNumber.toString(),
        designation: 'Transport',
        amount: '1,00',
        unit: 'service',
        pricePerUnit: this.formatCurrency(
          parseFloat(listingDetails.transport_cost)
        ),
        total: this.formatCurrency(parseFloat(listingDetails.transport_cost)),
        vin: null,
        kmStand: null,
        firstReg: null,
      });
    }

    // Add Belgium price adjustment if different from main price
    // if (
    //   listingDetails.belgium_price &&
    //   parseFloat(listingDetails.belgium_price) !== vehiclePrice
    // ) {
    //   const belgiumPrice = parseFloat(listingDetails.belgium_price);
    //   currentItemNumber++;
    //   items.push({
    //     itemNumber: currentItemNumber.toString(),
    //     designation: 'Belgium Market Adjustment',
    //     amount: '1,00',
    //     unit: '',
    //     pricePerUnit: this.formatCurrency(belgiumPrice - vehiclePrice),
    //     total: this.formatCurrency(belgiumPrice - vehiclePrice),
    //     vin: null,
    //     kmStand: null,
    //     firstReg: null,
    //   });
    // }

    return items;
  }

  /**
   * Calculate subtotal from an array of items
   * @param {array} items - Array of invoice items
   * @returns {number} - Subtotal amount
   */
  calculateSubtotalFromItems(items) {
    const subtotal = items.reduce((total, item) => {
      // Parse the total field using the currency parser
      const itemTotal = this.parseCurrencyString(item.total);
      return total + itemTotal;
    }, 0);

    return subtotal;
  }

  /**
   * Calculate subtotal from listing details
   * @param {object} listingDetails - Listing information (database record format)
   * @param {string} startingItemNumber - Starting item number for this invoice
   * @returns {Promise<number>} - Subtotal amount
   */
  async calculateSubtotal(listingDetails, startingItemNumber = null) {
    // Calculate total from the generated items to ensure consistency
    const items = await this.processListingToItems(
      listingDetails,
      startingItemNumber
    );

    return this.calculateSubtotalFromItems(items);
  }

  /**
   * Parse a formatted currency string back to a number
   * Handles Swedish format: "4 000,00" -> 4000.00
   * @param {string} currencyString - Formatted currency string
   * @returns {number} - Parsed number
   */
  parseCurrencyString(currencyString) {
    if (!currencyString || typeof currencyString !== 'string') {
      return 0;
    }

    // Swedish format uses space as thousands separator and comma as decimal separator
    // "4 000,00" should become 4000.00
    // First replace comma with dot for decimal
    // Then remove spaces (thousands separators)
    const normalized = currencyString
      .replace(/,/g, '.') // Replace comma with dot for decimal
      .replace(/\s/g, ''); // Remove spaces (thousands separators)

    const parsed = parseFloat(normalized) || 0;
    return parsed;
  }

  /**
   * Calculate total from an array of items
   * @param {array} items - Array of invoice items
   * @returns {number} - Total amount
   */
  calculateTotalFromItems(items) {
    return this.calculateSubtotalFromItems(items);
  }

  /**
   * Calculate total (same as subtotal for now, can add VAT later)
   * @param {object} listingDetails - Listing information (database record format)
   * @param {string} startingItemNumber - Starting item number for this invoice
   * @returns {Promise<number>} - Total amount
   */
  async calculateTotal(listingDetails, startingItemNumber = null) {
    return await this.calculateSubtotal(listingDetails, startingItemNumber);
  }

  /**
   * Generate PDF from HTML
   * @param {string} html - Processed HTML content
   * @param {string} invoiceNumber - Invoice number for filename
   * @param {string} outputDir - Output directory (optional)
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generatePDF(html, invoiceNumber, outputDir = null) {
    let browser;

    try {
      // Set output directory
      const defaultOutputDir = path.join(__dirname, '../output/invoices');
      const finalOutputDir = outputDir || defaultOutputDir;

      // Ensure output directory exists
      if (!fs.existsSync(finalOutputDir)) {
        fs.mkdirSync(finalOutputDir, { recursive: true });
      }

      // Use the same Puppeteer configuration as the scraping service
      const launchOptions = this.getPuppeteerConfig();

      browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();

      // Set content
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfPath = path.join(finalOutputDir, `invoice-${invoiceNumber}.pdf`);

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Get available billing companies
   * @returns {array} - Array of available company keys
   */
  getAvailableCompanies() {
    return Object.keys(this.companyData);
  }

  /**
   * Get company information
   * @param {string} companyKey - Company key ('swedish' or 'belgian')
   * @returns {object} - Company information
   */
  getCompanyInfo(companyKey) {
    return this.companyData[companyKey] || null;
  }

  /**
   * Get VAT label based on vat_or_margin field
   * @param {string} vatOrMargin - VAT or margin field from listing
   * @returns {string} - Appropriate VAT label
   */
  getVatLabel(vatOrMargin) {
    if (!vatOrMargin) {
      return 'Excl. VAT:'; // Default fallback
    }

    const normalizedValue = vatOrMargin.toLowerCase().trim();

    if (
      normalizedValue.includes('excl') ||
      normalizedValue.includes('exclusive')
    ) {
      return 'Excl. VAT:';
    } else if (
      normalizedValue.includes('incl') ||
      normalizedValue.includes('inclusive')
    ) {
      return 'Incl. VAT:';
    } else if (normalizedValue.includes('margin')) {
      return 'Margin Scheme:';
    } else {
      return 'Excl. VAT:'; // Default fallback
    }
  }

  /**
   * Get footer title based on vat_or_margin field
   * @param {string} vatOrMargin - VAT or margin field from listing
   * @returns {string} - Appropriate footer title
   */
  getFooterTitle(vatOrMargin) {
    if (!vatOrMargin) {
      return 'Reverse Charge'; // Default fallback
    }

    const normalizedValue = vatOrMargin.toLowerCase().trim();

    if (
      normalizedValue.includes('excl') ||
      normalizedValue.includes('exclusive')
    ) {
      return 'Reverse Charge';
    } else if (
      normalizedValue.includes('incl') ||
      normalizedValue.includes('inclusive')
    ) {
      return 'Margin Scheme';
    } else if (normalizedValue.includes('margin')) {
      return 'Margin Scheme';
    } else {
      return 'Reverse Charge'; // Default fallback
    }
  }

  /**
   * Get Puppeteer configuration (same as scraping service)
   * @returns {object} - Puppeteer launch options
   */
  getPuppeteerConfig() {
    console.log(
      '[getPuppeteerConfig] Starting to get puppeteer config',
      process.env.NODE_ENV
    );

    // Force development config on Windows or when NODE_ENV is not production
    const isProduction = process.env.NODE_ENV === 'production';
    const isWindows = process.platform === 'win32';
    const isMacOS = process.platform === 'darwin';
    const isLinux = process.platform === 'linux';

    // Determine Chrome executable path based on platform
    // On macOS and Windows, let Puppeteer use its bundled browser (executablePath = undefined)
    // On Linux production, we need to specify the system Chrome path
    let executablePath;
    if (process.env.CHROME_EXECUTABLE_PATH) {
      executablePath = process.env.CHROME_EXECUTABLE_PATH;
    } else if (isLinux && isProduction) {
      // Only set explicit path on Linux production servers
      const linuxPaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
      ];
      for (const chromePath of linuxPaths) {
        if (fs.existsSync(chromePath)) {
          executablePath = chromePath;
          break;
        }
      }
      executablePath = executablePath || '/usr/bin/google-chrome-stable';
    }
    // For macOS and Windows (or non-production Linux), executablePath is undefined
    // This lets Puppeteer use its bundled Chrome from ~/.cache/puppeteer

    if (isProduction && !isWindows && !isMacOS) {
      return {
        // Use the determined executable path
        executablePath,
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
          '--disable-extensions',
          '--disable-software-rasterizer',
          '--ignore-certificate-errors',
          '--window-size=1920,1080',
          '--remote-debugging-port=0',
          '--disable-web-security',
          '--allow-running-insecure-content',
          '--disable-features=IsolateOrigins,site-per-process,VizDisplayCompositor,TranslateUI,ScriptStreaming,VizHitTestSurfaceLayer,BlinkGenPropertyTrees',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-default-apps',
          '--disable-domain-reliability',
          '--disable-hang-monitor',
          '--disable-ipc-flooding-protection',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-renderer-backgrounding',
          '--disable-sync',
          '--disable-blink-features=AutomationControlled',
          '--force-color-profile=srgb',
          '--metrics-recording-only',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--enable-automation',
          '--password-store=basic',
          '--use-mock-keychain',
          '--memory-pressure-off',
          '--max_old_space_size=4096',
          '--aggressive-cache-discard',
          '--run-all-compositor-stages-before-draw',
        ],
        ignoreHTTPSErrors: true,
        timeout: 60000, // Reduced timeout for faster failure detection
        protocolTimeout: 60000, // Reduced timeout
        waitForInitialPage: false, // Don't wait for initial page load
        pipe: false, // Use WebSocket instead of pipe for better reliability
        dumpio: false, // Disable debug output
        slowMo: 50, // Reduced delay between operations
      };
    }

    // For Windows in development, try to find system Chrome if bundled one isn't available
    // For macOS and Linux dev, let Puppeteer use its bundled browser (executablePath remains undefined)

    return {
      executablePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
        '--ignore-certificate-errors',
        '--allow-running-insecure-content',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-domain-reliability',
        '--disable-features=TranslateUI',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--password-store=basic',
        '--use-mock-keychain',
      ],
      ignoreHTTPSErrors: true,
      timeout: 60000, // Reduced timeout
      protocolTimeout: 60000, // Reduced timeout
      waitForInitialPage: true,
    };
  }

  /**
   * Format user's billing address for invoice
   * @param {object} userDetails - User information from database
   * @returns {string} - Formatted address string
   */
  formatUserAddress(userDetails) {
    if (!userDetails) return null;

    const addressParts = [];

    if (userDetails.billing_street)
      addressParts.push(userDetails.billing_street);
    if (userDetails.billing_city) addressParts.push(userDetails.billing_city);
    if (userDetails.billing_state) addressParts.push(userDetails.billing_state);
    if (userDetails.billing_code) addressParts.push(userDetails.billing_code);
    if (userDetails.billing_country)
      addressParts.push(userDetails.billing_country);

    return addressParts.length > 0 ? addressParts.join(', ') : null;
  }

  /**
   * Extract customer details from listing data with user information
   * @param {object} listingDetails - Database listing record
   * @param {object} userDetails - User information from database
   * @returns {object} - Customer details for invoice
   */
  extractCustomerFromListing(listingDetails, userDetails = null) {
    return {
      name:
        listingDetails.seller_company ||
        listingDetails.buyer_company_name ||
        'Unknown Customer',
      address:
        listingDetails.seller_address ||
        listingDetails.car_delivery_address ||
        'Address not provided',
      city: 'City not provided', // Could be extracted from address if needed
      customerNumber:
        listingDetails.reference_no || listingDetails.id?.toString() || 'N/A',
      vatNumber: userDetails?.vat_number || 'N/A',
      yourReference: userDetails?.name || 'N/A',
      email:
        listingDetails.seller_email || listingDetails.buyer_s_email || null,
      phone: listingDetails.telephone || listingDetails.mobile || null,
    };
  }

  /**
   * Generate invoice using only listing data (extracts customer info from listing)
   * @param {string} billingCompany - 'swedish' or 'belgian'
   * @param {object} listingDetails - Database listing record
   * @param {object} options - Additional options
   * @returns {Promise<object>} - Invoice generation result
   */
  async generateInvoiceFromListing(
    billingCompany,
    listingDetails,
    options = {}
  ) {
    console.log('----------------------------------');
    console.log(listingDetails);
    console.log('----------------------------------');

    // Get user details if assigned_to_id is available
    let userDetails = null;
    if (listingDetails.assigned_to_id) {
      try {
        const User = require('../models/User');
        userDetails = await User.findByPk(listingDetails.assigned_to_id, {
          attributes: [
            'name',
            'vat_number',
            'company_name',
            'billing_street',
            'billing_city',
            'billing_state',
            'billing_country',
            'billing_code',
          ],
        });
      } catch (error) {
        console.error('Error fetching user details for invoice:', error);
      }
    }

    const customerDetails = this.extractCustomerFromListing(
      listingDetails,
      userDetails
    );
    return this.generateInvoice(
      billingCompany,
      listingDetails,
      customerDetails,
      options,
      userDetails
    );
  }
}

module.exports = InvoiceService;
