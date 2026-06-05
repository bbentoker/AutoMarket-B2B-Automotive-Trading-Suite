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

const testListingSiteBScraping = async () => {
    const url = 'https://www.listingsiteb.example.com/annons/stockholm/volvo_xc60_b4_awd_diesel_momentum_advanced_se_panorama/100140234';
    // Note: This URL might be stale, but Oxylabs should return something (404 page or actual content).
    // Ideally use a live URL if possible, or just check if it attempts Oxylabs.
    // Given I don't have a known live URL, I'll rely on the log info to confirm loop execution.

    console.log('--- Testing ListingSiteB Scraping (Oxylabs) ---');
    try {
        const req = mockReq({ url });
        const res = mockRes();

        await listingController.extractListingListingSiteB(req, res);

        if (res.statusCode === 200) {
            console.log('✅ ListingSiteB extraction executed successfully.');
            console.log('Extracted Data:', JSON.stringify(res.data, null, 2).substring(0, 500) + '...');
        } else {
            console.log('⚠️ ListingSiteB extraction returned status:', res.statusCode);
            console.log('Error:', res.data);
        }
    } catch (error) {
        console.error('❌ ListingSiteB extract failed with error:', error.message);
    }
};

testListingSiteBScraping();
