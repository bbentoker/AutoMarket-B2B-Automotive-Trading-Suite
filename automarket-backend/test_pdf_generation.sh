#!/bin/bash

echo "🧪 Testing PDF Generation for Proforma Invoices"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one with MinIO credentials."
    echo "Required variables:"
    echo "- MINIO_ROOT_USER (or AWS_ACCESS_KEY_ID as fallback)"
    echo "- MINIO_ROOT_PASSWORD (or AWS_SECRET_ACCESS_KEY as fallback)"
    echo "- MINIO_BUCKET"
    exit 1
fi

# Load environment variables
source .env

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to run this test."
    exit 1
fi

# Check if chromium-browser is installed (required for puppeteer)
if ! command -v chromium-browser &> /dev/null; then
    echo "⚠️  chromium-browser not found. Puppeteer might not work correctly."
    echo "On Ubuntu/Debian, install it with: sudo apt-get install chromium-browser"
    echo "Attempting to run test anyway..."
fi

echo "🚀 Running PDF generation test..."
echo ""

# Run the PDF test
node src/tests/pdfService.test.js

echo ""
echo "✅ Test completed!"
echo ""
echo "📋 Summary:"
echo "- This test generates a sample proforma invoice PDF"
echo "- It uploads the PDF to your configured MinIO bucket"
echo "- You can find the generated PDF in src/tests/test-proforma-invoice.pdf"
echo "- The PDF is also uploaded to MinIO and you'll see the URL in the output"
echo ""
echo "🔗 Integration:"
echo "- PDF generation is automatically triggered when an invoice is created"
echo "- The PDF link is saved in the invoice record's 'link' field"
echo "- Dealers can access their invoice PDFs through the dashboard" 