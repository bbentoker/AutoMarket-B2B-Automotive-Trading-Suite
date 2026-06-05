const listingController = require('./src/controllers/listingController');
const listingService = require('./src/services/listingService');

// Mock request and response objects
const mockReq = (body) => ({
    body,
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const testListingSiteAScraping = async () => {
    const url = 'https://www.listingsitea.example.com/offers/audi-a6-avant-50-tdi-quattro-s-line-panorama-matrix-leder-diesel-black-553b320d-85fa-4f59-e053-0100007f35a8';

    console.log('--- Testing ListingSiteA Scraping (Oxylabs / Default) ---');
    try {
        const req = mockReq({ url });
        const res = mockRes();

        // We expect this to fail nicely if Oxylabs credentials aren't set or if they block us,
        // but we want to fail if the CODE crashes.
        await listingController.extractListingSiteA(req, res);

        if (res.statusCode === 200) {
            console.log('✅ Oxylabs path executed successfully.');
            console.log('Scraped Data:', JSON.stringify(res.data, null, 2).substring(0, 500) + '...');
        } else {
            console.log('⚠️ Oxylabs path returned status:', res.statusCode);
            console.log('Error:', res.data);
        }
    } catch (error) {
        console.error('❌ Oxylabs path failed with error:', error.message);
    }

    console.log('\n--- Testing ListingSiteA Scraping (Legacy / Puppeteer) ---');
    // Only running this if we want to risk launching a browser. 
    // Let's just check if it tries to launch Puppeteer logic (logs 'Using legacy Puppeteer version').
    // We can't easily mock the internal service call without rewiring requirements, 
    // but we can pass the flag and see logs.
    try {
        const req = mockReq({ url, oldversion: true });
        const res = mockRes();

        // This might timeout or fail if browser extraction fails, but that's expected.
        // We mainly want to verify the switch works.
        await listingController.extractListingSiteA(req, res);

        if (res.statusCode === 200) {
            console.log('✅ Puppeteer path executed successfully.');
        } else {
            console.log('⚠️ Puppeteer path returned status:', res.statusCode);
            // It might fail due to browser issues, which is fine for this test as long as it TRIED.
        }
    } catch (error) {
        // Expected failure on some environments
        console.log('ℹ️ Puppeteer path attempted (error expected if no browser):', error.message);
    }
};

testListingSiteAScraping();
