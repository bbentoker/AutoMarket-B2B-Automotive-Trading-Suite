# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Invoice Service Documentation

## Overview

The Invoice Service provides functionality to generate PDF invoices for car sales using predefined company templates. It supports both Swedish and Belgian company configurations and can generate professional invoices from vehicle listing details.

## Features

- ✅ Pre-configured Swedish and Belgian company data
- ✅ Dynamic invoice number generation
- ✅ PDF generation from HTML templates
- ✅ Support for multiple vehicle types and services
- ✅ Automatic calculation of totals and OCR numbers
- ✅ Professional invoice formatting

## Installation

Ensure you have the required dependencies:

```bash
npm install puppeteer
```

## Usage

### Basic Usage

```javascript
const InvoiceService = require('./src/services/invoiceService');

const invoiceService = new InvoiceService();

// Generate an invoice
const result = await invoiceService.generateInvoice(
  'swedish', // Billing company: 'swedish' or 'belgian'
  listingDetails, // Vehicle and services information
  customerDetails, // Customer billing information
  options // Optional settings (invoice number, due date, etc.)
);

console.log(`Invoice generated: ${result.pdfPath}`);
```

### Data Structures

#### Listing Details (Database Record Format)

```javascript
const listingDetails = {
  id: 475, // Listing ID
  brand_name: 'Volkswagen', // Vehicle manufacturer
  model: 'T-ROC 1.0 TSI', // Vehicle model
  amount_sold_for: '15000.00', // Final sale price (string)
  listing_price: '14500.00', // Original listing price (string)
  vin_number: 'WVGZZZA1ZNV106073', // Vehicle identification number
  km_stand: 42000, // Mileage/km (number)
  first_registration: '2022-02-21', // First registration date
  transport_cost: '530.00', // Transport cost (string, optional)
  belgium_price: '15530', // Belgium market price (string, optional)
  currency: 'euro', // Currency
  deal_stage: 'Sold', // Deal stage
  reference_no: '8PLDZ', // Reference number
  vat_or_margin: 'Excl. VAT', // VAT information
  fuel_type: 'Gasoline', // Fuel type
  transmission_type: 'Manual', // Transmission
  color: 'Blue', // Vehicle color
  seller_company: 'Dealer Name', // Seller company
  seller_email: 'sales@dealer.com', // Seller email
  // ... other database fields
};
```

#### Customer Details

```javascript
const customerDetails = {
  name: 'Customer Company Name', // Customer/company name
  address: 'Street Address', // Street address
  city: 'City, Country', // City and country
  customerNumber: 'CUST001', // Customer number (optional)
  vatNumber: 'VAT123456', // VAT number (optional)
};
```

#### Options

```javascript
const options = {
  invoiceNumber: 'INV-2025-001', // Custom invoice number (optional)
  invoiceDate: '2025-01-15', // Custom invoice date (optional)
  dueDate: '2025-02-14', // Custom due date (optional)
  outputDir: '/path/to/output', // Custom output directory (optional)
};
```

## Company Configurations

### Swedish Company (FOLKBILAR I SVEDALA AB)

- **VAT Number:** SE559419027301
- **Address:** Verkstadsgatan 10, 23351 Svedala, Sweden
- **Currency:** SEK
- **IBAN:** SE61 1200 0000 0123 5065 4524
- **SWIFT:** DABASESX
- **Reference:** Noor Sangin

### Belgian Company (FOLKBILAR BELGIUM SPRL)

- **VAT Number:** BE559419027301
- **Address:** Verkstadsgatan 10, 23351 Svedala, Belgium
- **Currency:** EUR
- **IBAN:** SE61 1200 0000 0123 5065 4524
- **SWIFT:** DABASESX
- **Reference:** Noor Sangin

## API Methods

### `generateInvoice(billingCompany, listingDetails, customerDetails, options)`

Generates a PDF invoice and returns the result.

**Parameters:**

- `billingCompany` (string): 'swedish' or 'belgian'
- `listingDetails` (object): Vehicle and services information
- `customerDetails` (object): Customer billing information
- `options` (object, optional): Additional configuration

**Returns:**

```javascript
{
  success: true,
  pdfPath: '/path/to/generated/invoice.pdf',
  invoiceNumber: 'INV-20250115-1234',
  invoiceData: { /* Complete invoice data object */ }
}
```

### `getAvailableCompanies()`

Returns an array of available company keys.

**Returns:** `['swedish', 'belgian']`

### `getCompanyInfo(companyKey)`

Returns company information for the specified key.

**Parameters:**

- `companyKey` (string): 'swedish' or 'belgian'

**Returns:** Company information object

## Examples

### Example 1: Basic Car Sale Invoice

```javascript
const invoiceService = new InvoiceService();

const carDetails = {
  id: 476,
  brand_name: 'BMW',
  model: 'X3 2.0 xDrive',
  amount_sold_for: '25000.00',
  listing_price: '24500.00',
  vin_number: 'WBAXG91050DL12345',
  km_stand: 35000,
  first_registration: '2023-01-15',
  transport_cost: '500.00',
  belgium_price: '25500',
  currency: 'euro',
  deal_stage: 'Sold',
  reference_no: 'BMW001',
  vat_or_margin: 'Excl. VAT',
  seller_company: 'BMW Dealer',
  seller_email: 'sales@bmw.com',
};

const customer = {
  name: 'ABC Motors Ltd',
  address: 'Industrial Street 42',
  city: 'Brussels, Belgium',
  vatNumber: 'BE0123456789',
};

const result = await invoiceService.generateInvoice(
  'swedish',
  carDetails,
  customer
);
```

### Example 2: Custom Invoice Number

```javascript
const result = await invoiceService.generateInvoice(
  'belgian',
  carDetails,
  customer,
  {
    invoiceNumber: 'BE-2025-001',
    outputDir: './custom-invoices',
  }
);
```

## File Structure

```
src/
├── services/
│   └── invoiceService.js          # Main service class
├── templates/
│   └── invoice-template.html      # HTML template for invoices
├── tests/
│   └── invoiceService.test.js     # Test file with examples
├── examples/
│   └── invoiceExample.js          # Usage examples
└── output/
    └── invoices/                  # Generated PDF files (auto-created)
```

## Testing

Run the test file to see the service in action:

```bash
node src/tests/invoiceService.test.js
```

Or run the examples:

```bash
node src/examples/invoiceExample.js
```

## Error Handling

The service includes comprehensive error handling:

- **Invalid company**: Throws error if company key is not 'swedish' or 'belgian'
- **Missing Puppeteer**: Provides clear installation instructions
- **File system errors**: Handles directory creation and file writing errors
- **PDF generation errors**: Catches and reports Puppeteer-related issues

## Output

Generated invoices are saved as PDF files in the following format:

- Filename: `invoice-{invoiceNumber}.pdf`
- Default location: `src/output/invoices/`
- Format: A4 with proper margins and styling

## Customization

To modify company information, edit the `companyData` object in `invoiceService.js`. To change the invoice layout, modify the HTML template in `src/templates/invoice-template.html`.

## Dependencies

- **puppeteer**: For PDF generation from HTML
- **fs**: File system operations
- **path**: Path handling

## Notes

- Invoice numbers are automatically generated using timestamp if not provided
- OCR numbers are derived from invoice numbers
- Due dates default to 30 days from invoice date
- All monetary amounts are formatted according to Swedish locale
- The service supports both full Puppeteer and Puppeteer-core installations
