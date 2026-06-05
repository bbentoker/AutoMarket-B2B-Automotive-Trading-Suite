# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# ListingSiteB Scraping Update - Replace Deprecated API with Page Rendering

## Overview
The ListingSiteB API (`extractListingSiteBContent`) is deprecated and no longer works. This update replaces API calls with Puppeteer page rendering and Cheerio HTML scraping.

## Files to Modify
- `src/controllers/listingController.js`

## Changes Required

---

## 1. Update Imports (Top of File)

### BEFORE:
```javascript
const {
  extractListingSiteBContent,
  getBearer,
  extractDataWithGPT,
} = require('../services/scrapingService');
```

### AFTER:
```javascript
const {
  extractDataWithGPT,
} = require('../services/scrapingService');
```

---

## 2. Add New Helper Function

Add this function **BEFORE** the `exports.extractListingAdvanced` function:

```javascript
// Helper function to scrape ListingSiteB page and extract data
async function scrapeListingSiteBPage(url) {
  let browser;
  let page;
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[scrapeListingSiteBPage] Attempt ${attempt}/${maxRetries} - Launching browser...`);
      
      // Get base config and modify for stability
      const browserOptions = {
        headless: 'new', // Use new headless mode for better compatibility
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-web-security',
          '--ignore-certificate-errors',
          '--window-size=1920,1080',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
        ],
        ignoreHTTPSErrors: true,
        timeout: 60000,
        protocolTimeout: 60000,
      };

      // Add executable path for Windows
      if (process.platform === 'win32') {
        const fs = require('fs');
        const windowsPaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        ];
        
        let foundBrowser = false;
        for (const chromePath of windowsPaths) {
          try {
            if (chromePath && fs.existsSync(chromePath)) {
              browserOptions.executablePath = chromePath;
              console.log(`[scrapeListingSiteBPage] Using browser: ${chromePath}`);
              foundBrowser = true;
              break;
            }
          } catch (e) {
            // Continue to next path
          }
        }
        
        if (!foundBrowser) {
          console.error('[scrapeListingSiteBPage] No browser found! Checked paths:', windowsPaths.join(', '));
          throw new Error('No Chrome or Edge browser found. Please install Google Chrome or Microsoft Edge.');
        }
      } else if (process.platform === 'linux') {
        browserOptions.executablePath = process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable';
      }

      browser = await puppeteer.launch(browserOptions);
      console.log('[scrapeListingSiteBPage] Browser launched successfully');

      // Get pages and use existing or create new
      const pages = await browser.pages();
      page = pages.length > 0 ? pages[0] : await browser.newPage();
      console.log('[scrapeListingSiteBPage] Page ready');

      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      console.log('[scrapeListingSiteBPage] Navigating to URL:', url);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

      // Wait for main content to load
      await page.waitForSelector('h1', { timeout: 15000 });
      
      // If we got here, break out of retry loop
      break;
    } catch (launchError) {
      lastError = launchError;
      console.error(`[scrapeListingSiteBPage] Attempt ${attempt} failed:`, launchError.message);
      
      // Close browser if it was opened
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore close errors
        }
        browser = null;
        page = null;
      }

      if (attempt === maxRetries) {
        throw new Error(`Failed to launch browser after ${maxRetries} attempts: ${lastError.message}`);
      }

      // Wait before retrying
      await new Promise(resolve => global.setTimeout(resolve, 2000));
    }
  }

  try {

    console.log('[scrapeListingSiteBPage] Page loaded, extracting data...');

    // Get the page HTML
    const pageContent = await page.content();
    const $ = cheerio.load(pageContent);

    // Extract images from the gallery
    const imageUrls = [];
    $('img[id^="gallery-image-"]').each((i, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        // Get the highest resolution image from srcset (1600w)
        const srcsetParts = srcset.split(',');
        const highResImage = srcsetParts.find((s) => s.includes('1600w'));
        if (highResImage) {
          const imageUrl = highResImage.trim().split(' ')[0];
          if (imageUrl && !imageUrls.includes(imageUrl)) {
            imageUrls.push(imageUrl);
          }
        }
      }
    });
    console.log('[scrapeListingSiteBPage] Found', imageUrls.length, 'images');

    // Extract title (make + model)
    const title = $('h1.t1').first().text().trim() || '';
    console.log('[scrapeListingSiteBPage] Title:', title);

    // Extract subtitle (variant info)
    const subtitle = $('h1.t1').next('p').text().trim() || '';

    // Extract price
    let priceText = '';
    let currency = 'kr';
    const priceElement = $('span.t2').first().text().trim();
    if (priceElement) {
      // Extract numeric price and currency (e.g., "259 900 kr")
      const priceMatch = priceElement.match(/([\d\s]+)\s*([a-zA-Z]+)?/);
      if (priceMatch) {
        priceText = priceMatch[1].replace(/\s/g, ''); // Remove spaces
        currency = priceMatch[2] || 'kr';
      }
    }
    console.log('[scrapeListingSiteBPage] Price:', priceText, currency);

    // Helper function to extract spec value by Swedish label
    const getSpecValue = (label) => {
      let value = '';
      // Look in the specifications section (key-info-section)
      $('section.key-info-section dl div, section dl div').each((i, el) => {
        const dt = $(el).find('dt').text().trim().toLowerCase();
        if (dt.includes(label.toLowerCase())) {
          value = $(el).find('dd').text().trim();
          return false; // break
        }
      });
      return value;
    };

    // Helper function to extract quick info value by icon name
    const getQuickInfoValue = (iconName) => {
      let value = '';
      $('div.flex.gap-16.hyphens-auto').each((i, el) => {
        const icon = $(el).find(`w-icon[name="${iconName}"]`);
        if (icon.length) {
          value = $(el).find('p.font-bold, p.m-0.font-bold').text().trim();
          return false; // break
        }
      });
      return value;
    };

    // Extract specifications from the dl section
    const brand = getSpecValue('märke') || title.split(' ')[0] || '';
    const model = getSpecValue('modell') || title.replace(brand, '').trim() || '';
    const year = getSpecValue('modellår') || getQuickInfoValue('Calendar') || '';
    const bodyType = getSpecValue('karosseri') || '';
    const fuelType = getSpecValue('drivmedel') || getQuickInfoValue('GasDiesel') || '';
    const horsepower = getSpecValue('effekt') || '';
    const engineVolume = getSpecValue('motorvolym') || '';
    const transmission = getSpecValue('växellåda') || getQuickInfoValue('GearAutomatic') || '';
    const driveType = getSpecValue('drivhjul') || '';
    const seats = getSpecValue('säten') || '';
    const color = getSpecValue('färg') || '';
    const registrationNumber = getSpecValue('registreringsnummer') || '';
    const vinNumber = getSpecValue('chassinummer') || '';
    const registrationDate = getSpecValue('registreringsdatum') || '';

    // Extract mileage
    let mileage = getSpecValue('miltal') || getQuickInfoValue('Speedometer') || '';
    // Convert Swedish "mil" to km (1 mil = 10 km)
    if (mileage) {
      const mileageMatch = mileage.match(/([\d\s]+)/);
      if (mileageMatch) {
        const milValue = parseInt(mileageMatch[1].replace(/\s/g, ''), 10);
        mileage = milValue * 10; // Convert mil to km
      }
    }
    console.log('[scrapeListingSiteBPage] Mileage (km):', mileage);

    // Extract features/equipment
    const features = [];
    $('section:has(h2:contains("Utrustning")) ul li, section:has(h2:contains("utrustning")) ul li').each((i, el) => {
      const feature = $(el).text().trim();
      if (feature && !feature.includes('Öppet ')) { // Skip opening hours
        features.push(feature);
      }
    });
    console.log('[scrapeListingSiteBPage] Found', features.length, 'features');

    // Extract description
    let description = '';
    const descSection = $('div.whitespace-pre-wrap.children\\:list-disc');
    if (descSection.length) {
      description = descSection.text().trim();
    }

    // Extract dealer info
    const dealerName = $('h3.mb-4').first().text().trim() || '';
    let dealerAddress = '';
    $('a[href*="google.com/maps"]').each((i, el) => {
      const addressText = $(el).find('span').last().text().trim();
      if (addressText && addressText.length > 5) {
        dealerAddress = addressText;
        return false;
      }
    });

    // Extract CO2 if available
    const co2 = getSpecValue('co2') || '';

    // Close browser before translation to free resources
    if (browser) {
      await browser.close();
      browser = null;
    }

    // Build the extracted data object (matching the expected format)
    const extractedData = {
      brand_name: brand,
      model: model,
      horsepower: horsepower.replace(/[^\d]/g, ''), // Extract just the number
      km_stand: typeof mileage === 'number' ? mileage : parseInt(String(mileage).replace(/[^\d]/g, ''), 10) || '',
      fuel_type: fuelType,
      transmission_type: transmission,
      first_registration: registrationDate || year,
      color: color,
      registration_number: registrationNumber,
      vin_number: vinNumber,
      internal_url: url,
      listing_price: parseInt(priceText, 10) || '',
      currency: currency,
      features: features.join(', '),
      seat: seats,
      co2: co2,
      description: description,
      dealer_name: dealerName,
      dealer_address: dealerAddress,
      body_type: bodyType,
      drive_type: driveType,
      engine_volume: engineVolume,
      year: year,
    };

    console.log('[scrapeListingSiteBPage] Extracted data:', JSON.stringify(extractedData, null, 2));

    // Translate the data to English
    console.log('[scrapeListingSiteBPage] Translating data...');
    const { translateWithGPTEnglishOnly } = require('../services/scrapingService');
    const translated = await translateWithGPTEnglishOnly(extractedData);
    translated.en.images = imageUrls;

    console.log('[scrapeListingSiteBPage] Extraction and translation completed');
    return translated;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('[scrapeListingSiteBPage] Error closing browser:', e.message);
      }
    }
  }
}
```

---

## 3. Update `extractListingAdvanced` Function

Find the ListingSiteB handling block inside `extractListingAdvanced` and replace it:

### BEFORE:
```javascript
if (urlObj.hostname.includes('listingsiteb.example.com')) {
  // Extract the ID from the end of the URL
  const match = url.match(/\/(\d+)(?:\/|$)/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid ListingSiteB URL format' });
  }

  // Extract the data using cached token functionality
  // The extractListingSiteBContent function will handle token caching and refresh automatically
  extractedData = await extractListingSiteBContent(match[1], null, url);

  if (!extractedData) {
    return res
      .status(400)
      .json({ error: 'Failed to extract data from listingsiteb.example.com' });
  }
}
```

### AFTER:
```javascript
if (urlObj.hostname.includes('listingsiteb.example.com')) {
  // Extract the ID from the end of the URL
  const match = url.match(/\/(\d+)(?:\/|$)/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid ListingSiteB URL format' });
  }

  // Use page scraping instead of deprecated API
  extractedData = await scrapeListingSiteBPage(url);

  if (!extractedData) {
    return res
      .status(400)
      .json({ error: 'Failed to extract data from listingsiteb.example.com' });
  }
}
```

---

## 4. Replace Entire `extractListingListingSiteB` Function

Replace the entire `exports.extractListingListingSiteB` function with:

```javascript
// admin panel uses this version to scrape
// Extract listing from URL (ListingSiteB only - returns extracted data without creating listing)
// Updated to use page rendering instead of deprecated API
exports.extractListingListingSiteB = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const urlObj = new URL(url);

    // Only handle ListingSiteB URLs
    if (!urlObj.hostname.includes('listingsiteb.example.com')) {
      return res.status(400).json({
        error:
          'Only ListingSiteB URLs are supported. Use the advanced endpoint for other URLs.',
      });
    }

    // Extract the ID from the end of the URL
    const match = url.match(/\/(\d+)(?:\/|$)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid ListingSiteB URL format' });
    }
    console.log('[extractListingListingSiteB] Extracting listing ID:', match[1]);

    // Use the shared helper function to scrape the page
    const extractedData = await scrapeListingSiteBPage(url);

    if (!extractedData) {
      return res
        .status(400)
        .json({ error: 'Failed to extract data from listingsiteb.example.com' });
    }

    // Return extracted data without creating listing
    return res.status(200).json({
      message: 'Data extracted successfully',
      data: extractedData,
    });
  } catch (error) {
    console.error('[extractListingListingSiteB] Error extracting listing:', error);
    return res.status(500).json({
      error: 'Failed to extract listing information',
      details: error.message,
    });
  }
};
```

---

## Data Fields Extracted

| Swedish Label | Field Name | Notes |
|--------------|------------|-------|
| Märke | brand_name | Car manufacturer |
| Modell | model | Car model |
| Modellår | year | Model year |
| Karosseri | body_type | Body type |
| Drivmedel | fuel_type | Fuel type |
| Effekt | horsepower | Engine power (numbers only) |
| Motorvolym | engine_volume | Engine volume |
| Växellåda | transmission_type | Transmission |
| Drivhjul | drive_type | Drive type |
| Säten | seat | Number of seats |
| Färg | color | Color |
| Registreringsnummer | registration_number | License plate |
| Chassinummer | vin_number | VIN number |
| Registreringsdatum | first_registration | Registration date |
| Miltal | km_stand | Mileage (converted from mil to km × 10) |
| CO2 | co2 | CO2 emissions |
| Utrustning | features | Equipment list (comma-separated) |
| Description | description | Listing description |
| Price | listing_price, currency | Price and currency |
| Images | images | Array of image URLs (1600w resolution) |
| Dealer | dealer_name, dealer_address | Dealer information |

---

## Dependencies

Make sure these are already imported at the top of the file:
- `cheerio` - For HTML parsing
- `puppeteer-core` - For page rendering
- `translateWithGPTEnglishOnly` from scrapingService - For translation

---

## How It Works

1. **Launches browser** with retry logic (3 attempts)
2. **Navigates** to the ListingSiteB listing URL
3. **Extracts data** from the rendered HTML using CSS selectors
4. **Converts** Swedish mileage (mil) to kilometers (× 10)
5. **Translates** all text fields to English using GPT
6. **Returns** translated data with image URLs

---

## Testing

Test with a ListingSiteB URL like:
```
https://www.listingsiteb.example.com/mobility/item/18995245
```

The endpoint should return translated car data with images.

