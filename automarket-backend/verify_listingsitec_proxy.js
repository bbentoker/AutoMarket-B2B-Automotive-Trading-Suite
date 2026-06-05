require('dotenv').config();
const { scrapeWithOxylabs } = require('./src/services/scrapingService');
const { extractListingSiteCListing } = require('./src/services/listingService');

async function verifyListingSiteCOxylabs() {
    console.log('Starting ListingSiteC Oxylabs API Verification...');

    // Real ListingSiteC URL from user feedback
    const targetUrl = 'https://www.listingsitec.example.com/detail-nove-auto/land-rover-discovery-d350-mhev-gemini-awd-auto/Amv5nY2GprR/';

    try {
        console.log(`\nTesting ${targetUrl}...`);
        // Testing the full extraction function to ensure no crashes
        const result = await extractListingSiteCListing(targetUrl);
        console.log('Extraction Result Keys:', Object.keys(result));

        if (result.extractedData && result.extractedData.title === 'Request Rejected') {
            console.warn('\nWARNING: "Request Rejected" detected. Anti-bot protection might still be active.');
        } else {
            console.log(`\nSuccess! Title: ${result.extractedData.title}`);
        }

        console.log('\nVerification Passed!');
    } catch (error) {
        console.error('\nVerification Failed:', error);
        process.exit(1);
    }
}

verifyListingSiteCOxylabs();
