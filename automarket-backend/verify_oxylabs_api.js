require('dotenv').config();
const { scrapeWithOxylabs } = require('./src/services/scrapingService');

async function verifyOxylabsApi() {
    console.log('Starting Oxylabs API Verification...');
    console.log(`Username exists: ${!!process.env.OXY_LABS_USERNAME}`);
    console.log(`Password exists: ${!!process.env.OXY_LABS_PASSWORD}`);

    // Test URL - simple page
    const testUrl = 'https://www.example.com';
    // More realistic target
    const realTargetUrl = 'https://www.hasznaltauto.hu/';

    try {
        console.log(`\nTesting ${testUrl}...`);
        const content = await scrapeWithOxylabs(testUrl);
        console.log(`Success! Content length: ${content.length}`);
        console.log('Preview:', content.substring(0, 200));

        console.log(`\nTesting ${realTargetUrl}...`);
        const realContent = await scrapeWithOxylabs(realTargetUrl);
        console.log(`Success! Content length: ${realContent.length}`);
        console.log('Preview:', realContent.substring(0, 200));

        console.log('\nVerification Passed!');
    } catch (error) {
        console.error('\nVerification Failed:', error.message);
        process.exit(1);
    }
}

verifyOxylabsApi();
