// Example code for creating a Zoho Books invoice
const { ZohoBooksClient } = require('../services/zohoBooksService');

const createZohoInvoice = async (listing) => {
  try {
    console.log('Creating Zoho Books invoice for listing:', {
      id: listing.id,
      buyer_email: listing.buyer_s_email,
      buyer_company: listing.buyer_company_name,
      amount: listing.amount_sold_for,
    });

    const booksClient = new ZohoBooksClient();
    const invoiceResponse = await booksClient.createInvoice(listing);

    console.log('Zoho Books invoice creation response:', {
      invoice_number: invoiceResponse.invoice?.invoice_number,
      status: invoiceResponse.invoice?.status,
      total: invoiceResponse.invoice?.total,
    });

    // Update listing with invoice number if available
    if (invoiceResponse.invoice && invoiceResponse.invoice.invoice_number) {
      await listing.update({
        proforma_invoice_number: invoiceResponse.invoice.invoice_number,
      });
    }

    return invoiceResponse;
  } catch (error) {
    console.error('Error creating Zoho Books invoice:', {
      error: error.message,
      details: error.response?.data,
    });
    throw error;
  }
};

module.exports = {
  createZohoInvoice,
};
