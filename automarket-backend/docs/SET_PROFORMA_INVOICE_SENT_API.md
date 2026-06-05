# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Set Proforma Invoice Sent API

## Overview

The `setProformaInvoiceSent` endpoint has been enhanced to support automatic PDF invoice generation when transitioning a listing to the "Proforma Invoice Sent" stage.

## Endpoint

```
POST /api/listings/set-proforma-invoice-sent
```

## Request Body

| Parameter         | Type   | Required | Description                                                               |
| ----------------- | ------ | -------- | ------------------------------------------------------------------------- |
| `listing_id`      | number | Yes      | The ID of the listing to update                                           |
| `billing_company` | string | No       | Company to use for invoice generation. Must be `"swedish"` or `"belgian"` |

## Functionality

### 1. Status Update

- Updates listing status to "Proforma Invoice Sent" (status_id: 5)
- Triggers Zoho CRM transition if `zoho_id` exists
- Sends notification email to assigned dealer (if any)
- Sets `is_viewed` to `false`

### 2. Invoice Generation (New Feature)

When `billing_company` is provided:

- Generates a professional PDF invoice using the invoice service
- Supports two company configurations:
  - **Swedish**: FOLKBILAR I SVEDALA AB (SEK currency)
  - **Belgian**: FOLKBILAR BELGIUM SPRL (EUR currency)
- Updates listing with generated invoice details:
  - `proforma_invoice_number`: Generated invoice number
  - `proforma_inv_date`: Current timestamp

## Request Examples

### Generate Swedish Company Invoice

```json
{
  "listing_id": 475,
  "billing_company": "swedish"
}
```

### Generate Belgian Company Invoice

```json
{
  "listing_id": 475,
  "billing_company": "belgian"
}
```

### Status Update Only (No Invoice)

```json
{
  "listing_id": 475
}
```

## Response Format

### Success Response

```json
{
  "message": "Proforma invoice sent successfully",
  "data": {
    "listing_id": 475,
    "zoho_transition": {
      "success": true,
      "message": "Stage updated successfully"
    },
    "invoice": {
      "success": true,
      "invoiceNumber": "SWEDISH-8PLDZ",
      "pdfPath": "/path/to/generated/invoice.pdf",
      "error": null
    }
  }
}
```

### Response Without Invoice Generation

```json
{
  "message": "Proforma invoice sent successfully",
  "data": {
    "listing_id": 475,
    "zoho_transition": {
      "success": true,
      "message": "Stage updated successfully"
    },
    "invoice": null
  }
}
```

### Error Response

```json
{
  "error": "Invalid billing_company. Must be \"swedish\" or \"belgian\""
}
```

## Invoice Details

### Swedish Company (FOLKBILAR I SVEDALA AB)

- **VAT Number**: SE559419027301
- **Address**: Verkstadsgatan 10, 23351 Svedala, Sweden
- **Currency**: SEK
- **IBAN**: SE61 1200 0000 0123 5065 4524
- **SWIFT**: DABASESX
- **Reference**: Noor Sangin

### Belgian Company (FOLKBILAR BELGIUM SPRL)

- **VAT Number**: BE559419027301
- **Address**: Verkstadsgatan 10, 23351 Svedala, Belgium
- **Currency**: EUR
- **IBAN**: SE61 1200 0000 0123 5065 4524
- **SWIFT**: DABASESX
- **Reference**: Noor Sangin

## Invoice Content

The generated PDF invoice includes:

### Vehicle Information

- **Brand & Model**: From `brand_name` and `model` fields
- **VIN**: From `vin_number` field
- **Mileage**: From `km_stand` field
- **First Registration**: From `first_registration` field
- **Price**: From `amount_sold_for` (or `listing_price` as fallback)

### Additional Items

- **Transport Cost**: Added as separate line item if `transport_cost` > 0
- **Belgium Adjustment**: Added if `belgium_price` differs from main price

### Customer Information

Extracted from listing seller data:

- **Name**: From `seller_company` or `buyer_company_name`
- **Address**: From `seller_address` or `car_delivery_address`
- **Reference Number**: From `reference_no` or listing ID

## Error Handling

The endpoint uses graceful error handling:

1. **Invoice Generation Failures**:

   - Don't prevent status update
   - Return error details in response
   - Log error for debugging

2. **Email Sending Failures**:

   - Don't prevent status update
   - Log error for debugging

3. **Validation Errors**:
   - Return 400 status with error message
   - Prevent processing if validation fails

## Status Codes

| Code | Description                                        |
| ---- | -------------------------------------------------- |
| 200  | Success - Status updated (with or without invoice) |
| 400  | Bad Request - Invalid parameters                   |
| 404  | Not Found - Listing not found                      |
| 500  | Internal Server Error - Unexpected error           |

## Environment Configuration

### Optional Environment Variables

```bash
# Custom invoice output directory
INVOICE_OUTPUT_DIR=/path/to/invoices

# Puppeteer Chrome configuration (if not auto-detected)
CHROME_EXECUTABLE_PATH=/path/to/chrome
```

## Testing

Use the test script to verify functionality:

```bash
# Set environment variables
export TEST_LISTING_ID=475
export API_URL=http://localhost:3000/api

# Run test
node src/tests/setProformaInvoiceSent.test.js
```

## Integration Notes

1. **Database Updates**: The listing is automatically updated with invoice details
2. **File Storage**: PDFs are saved to the configured output directory
3. **Zoho Integration**: Maintains existing Zoho CRM synchronization
4. **Email Notifications**: Preserves existing dealer notification system
5. **Backward Compatibility**: Existing API calls without `billing_company` work unchanged

## Related Documentation

- [Invoice Service Documentation](./INVOICE_SERVICE_README.md)
- [Listing API Documentation](./listingDetails.md)
- [Email Service Documentation](./all_email_templates.txt)
