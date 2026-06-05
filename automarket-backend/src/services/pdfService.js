const puppeteer = require('puppeteer-core');
const { uploadPdfToS3 } = require('./s3Service');
const {
  getPuppeteerConfigForPDF,
  logBrowserInfo,
} = require('../utils/puppeteerConfig');

/**
 * Generate HTML template for proforma invoice
 * @param {Object} invoiceData - Invoice data including dealer, listing, and invoice details
 * @returns {string} HTML template string
 */
const generateInvoiceHTML = (invoiceData) => {
  const {
    invoice,
    dealer,
    listing,
    company = {
      name: 'Folkbilar i Svedala AB',
      address: 'Company Address',
      phone: '+46 xxx xxx xxx',
      email: 'info@folkbilar.se',
      website: 'www.folkbilar.se',
    },
  } = invoiceData;

  // Format currency display
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proforma Invoice - ${invoice.invoice_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .company-info, .client-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        
        .info-title {
            font-size: 1.1em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-item {
            margin-bottom: 8px;
            color: #555;
        }
        
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        
        .vehicle-details {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .vehicle-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #856404;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .vehicle-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .vehicle-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0c674;
        }
        
        .vehicle-item:last-child {
            border-bottom: none;
        }
        
        .vehicle-label {
            font-weight: bold;
            color: #856404;
        }
        
        .vehicle-value {
            color: #533f03;
        }
        
        .invoice-details {
            background: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 6px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .invoice-details-title {
            font-size: 1.2em;
            font-weight: bold;
            color: #155724;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .invoice-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }
        
        .invoice-item {
            text-align: center;
        }
        
        .invoice-item-label {
            font-weight: bold;
            color: #155724;
            font-size: 0.9em;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .invoice-item-value {
            font-size: 1.1em;
            color: #0f4f23;
        }
        
        .amount-section {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
            border: 2px solid #dee2e6;
        }
        
        .amount-title {
            font-size: 1.1em;
            color: #6c757d;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .amount-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 10px;
        }
        
        .amount-currency {
            font-size: 1em;
            color: #6c757d;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #dee2e6;
            margin-top: 30px;
        }
        
        .footer-text {
            color: #6c757d;
            font-size: 0.9em;
            line-height: 1.8;
        }
        
        .features-section {
            margin: 20px 0;
        }
        
        .features-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 10px;
        }
        
        .features-text {
            color: #533f03;
            font-style: italic;
            line-height: 1.6;
        }
        
        @media print {
            body {
                padding: 0;
            }
            .container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PROFORMA INVOICE</h1>
            <div class="subtitle">${invoice.invoice_number}</div>
        </div>
        
        <div class="content">
            <div class="invoice-meta">
                <div class="company-info">
                    <div class="info-title">From</div>
                    <div class="info-item">
                        <span class="info-label">Company:</span>
                        ${company.name}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Address:</span>
                        ${company.address}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        ${company.phone}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        ${company.email}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Website:</span>
                        ${company.website}
                    </div>
                </div>
                
                <div class="client-info">
                    <div class="info-title">Bill To</div>
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        ${dealer.name || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Company:</span>
                        ${dealer.company_name || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        ${dealer.email || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        ${dealer.phone || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Address:</span>
                        ${dealer.address || 'N/A'}
                    </div>
                </div>
            </div>
            
            <div class="vehicle-details">
                <div class="vehicle-title">🚗 Vehicle Information</div>
                <div class="vehicle-grid">
                    <div class="vehicle-item">
                        <span class="vehicle-label">Brand & Model:</span>
                        <span class="vehicle-value">${listing.brand_name} ${listing.model}</span>
                    </div>
                    <div class="vehicle-item">
                        <span class="vehicle-label">Registration:</span>
                        <span class="vehicle-value">${listing.registration_number || 'N/A'}</span>
                    </div>
                    <div class="vehicle-item">
                        <span class="vehicle-label">VIN Number:</span>
                        <span class="vehicle-value">${listing.vin_number || 'N/A'}</span>
                    </div>
                    <div class="vehicle-item">
                        <span class="vehicle-label">Color:</span>
                        <span class="vehicle-value">${listing.color || 'N/A'}</span>
                    </div>
                    <div class="vehicle-item">
                        <span class="vehicle-label">Fuel Type:</span>
                        <span class="vehicle-value">${listing.fuel_type || 'N/A'}</span>
                    </div>
                    <div class="vehicle-item">
                        <span class="vehicle-label">Transmission:</span>
                        <span class="vehicle-value">${listing.transmission_type || 'N/A'}</span>
                    </div>
                    <div class="vehicle-item">
                        <span class="vehicle-label">Mileage:</span>
                        <span class="vehicle-value">${listing.km_stand ? listing.km_stand.toLocaleString() + ' km' : 'N/A'}</span>
                    </div>
                    <div class="vehicle-item">
                        <span class="vehicle-label">First Registration:</span>
                        <span class="vehicle-value">${listing.first_registration ? formatDate(listing.first_registration) : 'N/A'}</span>
                    </div>
                </div>
                
                ${
                  listing.features
                    ? `
                <div class="features-section">
                    <div class="features-title">Features & Equipment:</div>
                    <div class="features-text">${listing.features}</div>
                </div>
                `
                    : ''
                }
            </div>
            
            <div class="invoice-details">
                <div class="invoice-details-title">📋 Invoice Details</div>
                <div class="invoice-grid">
                    <div class="invoice-item">
                        <div class="invoice-item-label">Invoice Date</div>
                        <div class="invoice-item-value">${formatDate(invoice.created_at)}</div>
                    </div>
                    <div class="invoice-item">
                        <div class="invoice-item-label">Due Date</div>
                        <div class="invoice-item-value">${formatDate(invoice.due_date)}</div>
                    </div>
                    <div class="invoice-item">
                        <div class="invoice-item-label">Payment Status</div>
                        <div class="invoice-item-value">${invoice.is_paid ? 'PAID' : 'PENDING'}</div>
                    </div>
                </div>
            </div>
            
            <div class="amount-section">
                <div class="amount-title">Total Amount</div>
                <div class="amount-value">${formatCurrency(invoice.amount, invoice.currency)}</div>
                <div class="amount-currency">${invoice.currency.toUpperCase()}</div>
            </div>
            
            ${
              invoice.description
                ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <div style="font-weight: bold; color: #6c757d; margin-bottom: 10px;">Description:</div>
                <div style="color: #495057;">${invoice.description}</div>
            </div>
            `
                : ''
            }
        </div>
        
        <div class="footer">
            <div class="footer-text">
                This is a proforma invoice for the above vehicle purchase.<br>
                Please make payment within the specified due date.<br>
                For any questions, please contact us at ${company.email}<br><br>
                <strong>Thank you for your business!</strong>
            </div>
        </div>
    </div>
</body>
</html>`;
};

/**
 * Generate proforma invoice PDF
 * @param {Object} invoiceData - Complete invoice data including dealer, listing, and invoice details
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateProformaInvoicePDF = async (invoiceData) => {
  let browser;
  try {
    console.log('Generating proforma invoice PDF...');

    // Generate HTML template
    const html = generateInvoiceHTML(invoiceData);

    // Launch puppeteer browser with optimized PDF generation config
    logBrowserInfo();
    const browserOptions = getPuppeteerConfigForPDF();
    browser = await puppeteer.launch(browserOptions);

    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    console.log('PDF generated successfully');
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(
      `Failed to generate proforma invoice PDF: ${error.message}`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Create and upload proforma invoice PDF to S3
 * @param {Object} invoiceData - Complete invoice data including dealer, listing, and invoice details
 * @returns {Promise<string>} S3 URL of the uploaded PDF
 */
const createAndUploadInvoicePDF = async (invoiceData) => {
  try {
    console.log(
      `Creating proforma invoice PDF for invoice ${invoiceData.invoice.invoice_number}...`
    );

    // Generate PDF buffer
    const pdfBuffer = await generateProformaInvoicePDF(invoiceData);

    // Create filename
    const filename = `proforma-invoice-${invoiceData.invoice.invoice_number}`;

    // Upload to S3
    const s3Url = await uploadPdfToS3(pdfBuffer, 'invoices', filename);

    console.log(`Proforma invoice PDF uploaded successfully: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error('Error creating and uploading invoice PDF:', error);
    throw new Error(
      `Failed to create and upload invoice PDF: ${error.message}`
    );
  }
};

module.exports = {
  generateInvoiceHTML,
  generateProformaInvoicePDF,
  createAndUploadInvoicePDF,
};
