/**
 * Cross-platform Puppeteer configuration utility
 * Handles browser detection and configuration for Windows, macOS, and Linux
 */

/**
 * Get cross-platform Puppeteer launch options
 * @param {Object} options - Additional options to merge with defaults
 * @returns {Object} Puppeteer launch configuration
 */
const getPuppeteerConfig = (options = {}) => {
  const baseConfig = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--ignore-certificate-errors',
      '--window-size=1920,1080',
    ],
    ignoreHTTPSErrors: true,
    timeout: 60000,
  };

  // Platform-specific executable path configuration
  if (process.platform === 'linux') {
    // Linux: Try multiple common Chrome/Chromium paths
    const linuxPaths = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];

    // Use environment variable if set, otherwise try common paths
    if (process.env.CHROME_EXECUTABLE_PATH) {
      baseConfig.executablePath = process.env.CHROME_EXECUTABLE_PATH;
    } else {
      baseConfig.executablePath = linuxPaths[0]; // Default to google-chrome-stable
    }
  } else if (process.platform === 'win32') {
    // Windows: Try common Chrome installation paths
    const windowsPaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' +
        process.env.USERNAME +
        '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ];

    const fs = require('fs');
    // Use environment variable if set, otherwise try to find Chrome
    if (process.env.CHROME_EXECUTABLE_PATH) {
      baseConfig.executablePath = process.env.CHROME_EXECUTABLE_PATH;
    } else {
      // Try to find an existing browser
      for (const path of windowsPaths) {
        try {
          if (fs.existsSync(path)) {
            baseConfig.executablePath = path;
            console.log(`Found browser at: ${path}`);
            break;
          }
        } catch (error) {
          // Continue to next path
        }
      }
    }
  } else if (process.platform === 'darwin') {
    // macOS: Let Puppeteer auto-detect Chrome installation
    // Puppeteer will automatically find Chrome in /Applications/
    // No executablePath needed - Puppeteer handles this automatically
  }

  // Merge with additional options
  return {
    ...baseConfig,
    ...options,
    args: [...baseConfig.args, ...(options.args || [])],
  };
};

/**
 * Get lightweight Puppeteer config for PDF generation
 * @param {Object} options - Additional options to merge with defaults
 * @returns {Object} Puppeteer launch configuration optimized for PDF generation
 */
const getPuppeteerConfigForPDF = (options = {}) => {
  return getPuppeteerConfig({
    // PDF-specific optimizations
    args: [
      '--disable-background-networking',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-domain-reliability',
      '--disable-features=TranslateUI',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--enable-automation',
      '--password-store=basic',
      '--use-mock-keychain',
    ],
    ...options,
  });
};

/**
 * Get robust Puppeteer config for web scraping
 * @param {Object} options - Additional options to merge with defaults
 * @returns {Object} Puppeteer launch configuration optimized for web scraping
 */
const getPuppeteerConfigForScraping = (options = {}) => {
  return getPuppeteerConfig({
    // Scraping-specific optimizations
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--single-process',
      '--no-zygote',
      '--disable-software-rasterizer',
      '--allow-running-insecure-content',
      '--disable-features=IsolateOrigins,site-per-process',
      '--remote-debugging-port=0',
      '--memory-pressure-off',
      '--max_old_space_size=4096',
      '--aggressive-cache-discard',
    ],
    timeout: 120000, // Longer timeout for scraping
    protocolTimeout: 120000,
    waitForInitialPage: true,
    ...options,
  });
};

/**
 * Log platform-specific browser information
 */
const logBrowserInfo = () => {
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Node version: ${process.version}`);

  if (process.env.CHROME_EXECUTABLE_PATH) {
    console.log(`Custom Chrome path: ${process.env.CHROME_EXECUTABLE_PATH}`);
  } else {
    console.log('Searching for Chrome/Chromium installation...');

    // Show available browsers on Windows
    if (process.platform === 'win32') {
      const fs = require('fs');
      const windowsPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Users\\' +
          process.env.USERNAME +
          '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      ];

      console.log('Checking browser installations:');
      for (const path of windowsPaths) {
        try {
          if (fs.existsSync(path)) {
            console.log(`✅ Found: ${path}`);
          } else {
            console.log(`❌ Not found: ${path}`);
          }
        } catch (error) {
          console.log(`❌ Error checking: ${path}`);
        }
      }
    }
  }
};

module.exports = {
  getPuppeteerConfig,
  getPuppeteerConfigForPDF,
  getPuppeteerConfigForScraping,
  logBrowserInfo,
};
