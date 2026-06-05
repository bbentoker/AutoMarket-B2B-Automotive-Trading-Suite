@echo off
echo 🧪 Testing PDF Generation for Proforma Invoices
echo ==============================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please create one with MinIO credentials.
    echo Required variables:
    echo - MINIO_ROOT_USER (or AWS_ACCESS_KEY_ID as fallback)
    echo - MINIO_ROOT_PASSWORD (or AWS_SECRET_ACCESS_KEY as fallback)
    echo - MINIO_BUCKET
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js to run this test.
    pause
    exit /b 1
)

echo 🚀 Running PDF generation test...
echo.

REM Run the PDF test
node src/tests/pdfService.test.js

echo.
echo ✅ Test completed!
echo.
echo 📋 Summary:
echo - This test generates a sample proforma invoice PDF
echo - It uploads the PDF to your configured MinIO bucket
echo - You can find the generated PDF in src/tests/test-proforma-invoice.pdf
echo - The PDF is also uploaded to MinIO and you'll see the URL in the output
echo.
echo 🔗 Integration:
echo - PDF generation is automatically triggered when an invoice is created
echo - The PDF link is saved in the invoice record's 'link' field
echo - Dealers can access their invoice PDFs through the dashboard
echo.
pause 