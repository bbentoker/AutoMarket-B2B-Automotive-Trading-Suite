/**
 * Enhanced Scraping Service with Chrome Process Management
 *
 * PRODUCTION ISSUE FIXES:
 * ========================
 *
 * Problem: Chrome processes accumulate over time, causing timeout errors:
 * "Timed out after 120000 ms while trying to connect to Chrome! The only Chrome revision guaranteed to work is r609904"
 *
 * Solutions Implemented:
 * 1. Process Cleanup: killZombieChrome() kills stale Chrome processes
 * 2. Resource Monitoring: checkSystemResources() monitors memory and process count
 * 3. Retry Mechanism: launchBrowserWithRetries() provides robust browser launching
 * 4. Periodic Cleanup: performPeriodicCleanup() runs every 10 minutes in production
 * 5. Better Chrome Config: Multiple executable paths and optimized flags
 * 6. Dynamic Puppeteer Import: Only import Puppeteer when needed for better resource management
 *
 * Usage:
 * - All browser launches now use launchBrowserWithRetries()
 * - Periodic cleanup runs automatically in production
 * - Manual cleanup available via killZombieChrome()
 * - Resource monitoring via checkSystemResources()
 * - Puppeteer is imported dynamically only when needed
 */

const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const logoList = require('../utils/carLogoNames');

const execAsync = promisify(exec);

// Helper function for Promise-based delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Token cache to store bearer token and its expiration
let tokenCache = {
  token: null,
  expiresAt: null,
  sourceUrl: null,
};

// Token expiration time (in milliseconds) - set to 1 hour by default
const TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

// Add process cleanup utilities
const killZombieChrome = async () => {
  try {
    console.log('[killZombieChrome] Cleaning up zombie Chrome processes...');

    if (process.platform === 'linux') {
      // Check if required commands are available
      try {
        await execAsync('which pkill');
      } catch (error) {
        console.log(
          '[killZombieChrome] Process cleanup commands not available, skipping zombie cleanup'
        );
        return;
      }

      // Kill zombie Chrome/Chromium processes
      await execAsync('pkill -f "chromium|chrome" || true');
      await execAsync('pkill -f "puppeteer" || true');
      // Clean up shared memory
      await execAsync('rm -rf /dev/shm/.org.chromium.* 2>/dev/null || true');
      await execAsync('rm -rf /tmp/.org.chromium.* 2>/dev/null || true');

      console.log('[killZombieChrome] Zombie process cleanup completed');
    } else {
      console.log(
        '[killZombieChrome] Non-Linux environment, skipping process cleanup'
      );
    }
  } catch (error) {
    console.log(
      '[killZombieChrome] Process cleanup not available:',
      error.message
    );
  }
};

// Enhanced process monitoring
const checkSystemResources = async () => {
  try {
    // Check if we're in a Linux environment first
    if (process.platform !== 'linux') {
      console.log(
        '[checkSystemResources] Non-Linux environment detected, skipping system resource checks'
      );
      return null;
    }

    // Try to check if commands are available before running them
    try {
      await execAsync('which free');
    } catch (error) {
      console.log(
        '[checkSystemResources] System commands not available, skipping resource checks'
      );
      return null;
    }

    // Check memory usage
    const { stdout: memInfo } = await execAsync('free -m');
    const memLines = memInfo.split('\n');
    const memData = memLines[1].split(/\s+/);
    const totalMem = parseInt(memData[1]);
    const usedMem = parseInt(memData[2]);
    const memUsagePercent = (usedMem / totalMem) * 100;

    // Check Chrome processes
    const { stdout: chromeProcs } = await execAsync(
      'ps aux | grep -E "(chrome|chromium)" | grep -v grep | wc -l'
    );
    const chromeProcessCount = parseInt(chromeProcs.trim());

    console.log('[checkSystemResources]', {
      memoryUsage: `${memUsagePercent.toFixed(1)}%`,
      chromeProcesses: chromeProcessCount,
      totalMemoryMB: totalMem,
      usedMemoryMB: usedMem,
    });

    // If memory usage is too high or too many Chrome processes, clean up
    if (memUsagePercent > 80 || chromeProcessCount > 10) {
      console.log(
        '[checkSystemResources] High resource usage detected, cleaning up...'
      );
      await killZombieChrome();
    }

    return {
      memoryUsage: memUsagePercent,
      chromeProcessCount,
      needsCleanup: memUsagePercent > 80 || chromeProcessCount > 10,
    };
  } catch (error) {
    console.log(
      '[checkSystemResources] System resource monitoring not available:',
      error.message
    );
    return null;
  }
};

// Enhanced browser launcher with retries and cleanup
const launchBrowserWithRetries = async (puppeteer, config, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[launchBrowserWithRetries] Attempt ${attempt}/${maxRetries}`
      );

      // Check system resources before launching
      await checkSystemResources();

      // Try to launch browser with config timeout
      const browser = await puppeteer.launch(config);

      console.log('[launchBrowserWithRetries] Browser launched successfully');
      return browser;
    } catch (error) {
      console.error(
        `[launchBrowserWithRetries] Attempt ${attempt} failed:`,
        error.message
      );
      lastError = error;

      // Clean up before retry
      if (attempt < maxRetries) {
        console.log('[launchBrowserWithRetries] Cleaning up before retry...');
        await killZombieChrome();
        await delay(2000 * attempt); // Progressive delay
      }
    }
  }

  throw new Error(
    `Failed to launch browser after ${maxRetries} attempts. Last error: ${lastError.message}`
  );
};

// Add Puppeteer configuration based on environment
const getPuppeteerConfig = () => {
  console.log(
    '[getPuppeteerConfig] Starting to get puppeteer config',
    process.env.NODE_ENV
  );
  if (process.env.NODE_ENV !== 'dev') {
    return {
      // Try multiple Chrome/Chromium paths for better compatibility
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        '/usr/bin/google-chrome-stable' ||
        '/usr/bin/google-chrome' ||
        '/usr/bin/chromium-browser' ||
        '/usr/bin/chromium',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-extensions',
        '--disable-software-rasterizer',
        '--ignore-certificate-errors',
        '--window-size=1920,1080',
        '--remote-debugging-port=0',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=IsolateOrigins,site-per-process,VizDisplayCompositor,TranslateUI,ScriptStreaming,VizHitTestSurfaceLayer,BlinkGenPropertyTrees',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-domain-reliability',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--disable-blink-features=AutomationControlled',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--password-store=basic',
        '--use-mock-keychain',
        '--memory-pressure-off',
        '--max_old_space_size=4096',
        '--aggressive-cache-discard',
        '--run-all-compositor-stages-before-draw',
      ],
      ignoreHTTPSErrors: true,
      timeout: 60000, // Reduced timeout for faster failure detection
      protocolTimeout: 60000, // Reduced timeout
      waitForInitialPage: false, // Don't wait for initial page load
      pipe: false, // Use WebSocket instead of pipe for better reliability
      dumpio: false, // Disable debug output
      slowMo: 50, // Reduced delay between operations
    };
  }

  // Development configuration
  return {
    // For Windows, we'll use the installed Chrome
    executablePath:
      process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/chromium',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080',
      '--ignore-certificate-errors',
      '--allow-running-insecure-content',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-domain-reliability',
      '--disable-features=TranslateUI',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-sync',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--enable-automation',
      '--password-store=basic',
      '--use-mock-keychain',
    ],
    ignoreHTTPSErrors: true,
    timeout: 60000, // Reduced timeout
    protocolTimeout: 60000, // Reduced timeout
    waitForInitialPage: true,
  };
};

// Helper function to check if cached token is still valid
const isCachedTokenValid = (url) => {
  if (!tokenCache.token || !tokenCache.expiresAt) {
    console.log('[isCachedTokenValid] No cached token found');
    return false;
  }

  const now = Date.now();
  const isExpired = now >= tokenCache.expiresAt;
  const isSameUrl = tokenCache.sourceUrl === url;

  console.log('[isCachedTokenValid]', {
    hasToken: !!tokenCache.token,
    isExpired,
    isSameUrl,
    expiresIn: tokenCache.expiresAt - now,
  });

  return !isExpired && isSameUrl;
};

// Helper function to cache the token
const cacheToken = (token, url) => {
  const expiresAt = Date.now() + TOKEN_EXPIRATION_TIME;
  tokenCache = {
    token,
    expiresAt,
    sourceUrl: url,
  };

  console.log(
    '[cacheToken] Token cached until:',
    new Date(expiresAt).toISOString()
  );
};

// Helper function to clear the token cache
const clearTokenCache = () => {
  console.log('[clearTokenCache] Clearing token cache');
  tokenCache = {
    token: null,
    expiresAt: null,
    sourceUrl: null,
  };
};

// Batch validation function with dynamic Puppeteer import
const validateListingSiteBUrlsBatch = async (urls) => {
  let browser;
  let puppeteer;

  try {
    console.log('[validateListingSiteBUrlsBatch] Loading Puppeteer dynamically...');
    puppeteer = require('puppeteer-core');
    console.log('[validateListingSiteBUrlsBatch] Puppeteer loaded successfully');

    console.log(
      '[validateListingSiteBUrlsBatch] Launching fresh browser for batch validation...'
    );

    const puppeteerConfig = getPuppeteerConfig();
    browser = await launchBrowserWithRetries(puppeteer, puppeteerConfig);

    console.log('[validateListingSiteBUrlsBatch] Browser launched successfully');

    const results = [];

    for (const url of urls) {
      let page;
      try {
        console.log('[validateListingSiteBUrlsBatch] Validating URL:', url);

        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Set shorter timeout for individual page navigation
        await page.goto(url, {
          timeout: 45000, // Reduced timeout for individual URLs
          waitUntil: ['domcontentloaded'], // Simplified wait condition
        });

        // Wait for dynamic content with shorter timeout
        await delay(1500); // Reduced wait time

        // Look for the message button
        const buttonSelector =
          'button[data-cy="store-send-message-button"][data-testid="store-reply-ad-button"]';
        const buttonExists = (await page.$(buttonSelector)) !== null;

        if (buttonExists) {
          console.log('[validateListingSiteBUrlsBatch] URL is valid:', url);
          results.push({
            url,
            isValid: true,
            reason: 'Active listing with message button found',
          });
        } else {
          console.log('[validateListingSiteBUrlsBatch] URL is invalid:', url);

          // Get page title for diagnostics
          let pageTitle = 'Unknown';
          try {
            pageTitle = await page.title();
          } catch (titleError) {
            // Ignore title errors
          }

          results.push({
            url,
            isValid: false,
            reason: `Message button not found - listing may be inactive or removed. Page title: ${pageTitle}`,
          });
        }

        // Small delay between validations
        await setTimeout(500);
      } catch (error) {
        console.error(
          '[validateListingSiteBUrlsBatch] Error validating URL:',
          url,
          error
        );

        let errorMessage = error.message;
        if (
          error.message.includes('Navigation Timeout') ||
          error.message.includes('timeout')
        ) {
          errorMessage = `Page navigation timed out after 45 seconds. The target website may be slow or unreachable.`;
        } else if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
          errorMessage = `DNS resolution failed. The URL may be invalid or there may be network connectivity issues.`;
        } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
          errorMessage = `Connection refused. The target server may be down or blocking connections.`;
        } else if (error.message.includes('net::')) {
          errorMessage = `Network error: ${error.message}`;
        }

        results.push({
          url,
          isValid: false,
          reason: `Error during validation: ${errorMessage}`,
        });
      } finally {
        if (page) {
          try {
            await page.close();
          } catch (closeError) {
            console.error(
              '[validateListingSiteBUrlsBatch] Error closing page:',
              closeError
            );
          }
        }
      }
    }

    console.log('[validateListingSiteBUrlsBatch] Batch validation completed');
    return results;
  } catch (error) {
    console.error(
      '[validateListingSiteBUrlsBatch] Error in batch validation:',
      error
    );
    throw error;
  } finally {
    if (browser) {
      try {
        console.log('[validateListingSiteBUrlsBatch] Closing browser...');
        await browser.close();
        console.log('[validateListingSiteBUrlsBatch] Browser closed successfully');
      } catch (closeError) {
        console.error(
          '[validateListingSiteBUrlsBatch] Error closing browser:',
          closeError
        );
      }
    }

    // Force cleanup after batch validation
    try {
      console.log('[validateListingSiteBUrlsBatch] Performing cleanup...');
      await killZombieChrome();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('[validateListingSiteBUrlsBatch] Garbage collection completed');
      }
    } catch (cleanupError) {
      console.log(
        '[validateListingSiteBUrlsBatch] Cleanup error (non-fatal):',
        cleanupError.message
      );
    }
  }
};

// Helper function to validate token by making a test request
const validateToken = async (token, testId = '12345') => {
  try {
    console.log('[validateToken] Testing token validity...');
    const testUrl = `https://api.listingsiteb.example.com/search_bff/v2/content/${testId}?include=store&include=partner_placements&include=breadcrumbs&include=archived&include=car_condition&include=home_delivery&include=realestate&status=active&status=deleted&status=hidden_by_user`;

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.5',
        authorization: `Bearer ${token}`,
        priority: 'u=1, i',
        'sec-ch-ua':
          '"Chromium";v="136", "Brave";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
      },
      referrer: 'https://www.listingsiteb.example.com/',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      mode: 'cors',
      credentials: 'include',
    });

    const isValid = response.status !== 401 && response.status !== 403;
    console.log('[validateToken] Token validation result:', {
      status: response.status,
      isValid: isValid,
    });

    return isValid;
  } catch (error) {
    console.error('[validateToken] Error validating token:', error);
    return false;
  }
};

// Get cached token or fetch a new one
const getCachedOrFreshToken = async (url) => {
  console.log('[getCachedOrFreshToken] Starting token acquisition process...');

  // First check if we have a cached token that's still valid
  if (isCachedTokenValid(url)) {
    console.log('[getCachedOrFreshToken] Found cached token, validating...');
    const isValid = await validateToken(tokenCache.token);
    if (isValid) {
      console.log('[getCachedOrFreshToken] Cached token is valid, using it');
      return tokenCache.token;
    } else {
      console.log(
        '[getCachedOrFreshToken] Cached token is invalid, clearing cache'
      );
      clearTokenCache();
    }
  }

  // No valid cached token, fetch a fresh one
  console.log('[getCachedOrFreshToken] Fetching fresh token...');
  const freshToken = await getBearer(url);
  console.log(
    '[getCachedOrFreshToken] Fresh token acquired:',
    freshToken ? 'success' : 'failed'
  );

  if (freshToken) {
    cacheToken(freshToken, url);
    return freshToken;
  } else {
    throw new Error('Failed to acquire valid token');
  }
};

const openai = new OpenAI({
  apiKey: process.env.GPT_KEY,
});

// Helper method to translate data using GPT
const translateWithGPT = async (data) => {
  try {
    // Optimized concise prompt for multi-language translation
    const translationPrompt = `Translate to EN, DE, IT, FR, NL. Return JSON: {"en": {...}, "de": {...}, "it": {...}, "fr": {...}, "nl": {...}}. Convert prices/km to numbers.

${JSON.stringify(data, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Switched to faster, cheaper model
      messages: [
        {
          role: 'system',
          content:
            'Translate car data to multiple languages. Return valid JSON only.',
        },
        {
          role: 'user',
          content: translationPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0, // More deterministic, faster responses
    });

    const translatedData = JSON.parse(completion.choices[0].message.content);
    return translatedData;
  } catch (error) {
    console.error('Error translating data with GPT:', error);
    throw error;
  }
};

// Helper method to match car brand with logo filename using GPT
const getLogoFilename = async (data) => {
  try {
    console.log('[getLogoFilename] Starting logo matching process...');

    // Logo matching prompt
    const logoMatchingPrompt = `Given this car listing data and logo list, find the exact matching logo filename for the car brand.

Car listing data:
${JSON.stringify(data, null, 2)}

Available logos:
${JSON.stringify(logoList, null, 2)}

Instructions:
1. Extract the brand name from the car listing data
2. Find the exact matching logo filename from the logo list (case-insensitive matching)
3. Return JSON: {"logo_filename": "exact_filename_from_list_or_null"}

If no exact match is found, return {"logo_filename": null}`;

    const logoMatchingCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Match car brand with logo filename. Return valid JSON only.',
        },
        {
          role: 'user',
          content: logoMatchingPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const logoMatchingData = JSON.parse(
      logoMatchingCompletion.choices[0].message.content
    );

    console.log(
      '[getLogoFilename] Logo matching completed:',
      logoMatchingData.logo_filename
    );
    return logoMatchingData.logo_filename;
  } catch (error) {
    console.error('Error in getLogoFilename:', error);
    return null;
  }
};

const translateWithGPTEnglishOnly = async (data) => {
  try {
    console.log(
      '[translateWithGPTEnglishOnly] Sending translation request to OpenAI...'
    );

    // Optimized concise prompt for translation
    const translationPrompt = `Translate to English, return JSON: {"en": {translated_data}}. Convert prices/km to numbers without separators. Keep currency unchanged.Also if the fuel is something long like Environmental Fuel/Hybrid , simplify it to one word.

${JSON.stringify(data, null, 2)}`;

    // Run only translation
    const translationCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Translate car data to English. Return valid JSON only.',
        },
        {
          role: 'user',
          content: translationPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    console.log(
      '[translateWithGPTEnglishOnly] Parsing translation response...'
    );
    const translatedData = JSON.parse(
      translationCompletion.choices[0].message.content
    );

    console.log('[translateWithGPTEnglishOnly] Translation completed.');
    return translatedData;
  } catch (error) {
    console.error('Error in translateWithGPTEnglishOnly:', error);
    throw error;
  }
};

// Helper function to validate if a ListingSiteB URL is accessible and active (single URL)
const validateListingSiteBUrl = async (url) => {
  let browser;
  let page;
  let puppeteer;

  try {
    console.log('[validateListingSiteBUrl] Loading Puppeteer dynamically...');
    puppeteer = require('puppeteer-core');
    console.log('[validateListingSiteBUrl] Puppeteer loaded successfully');

    console.log('[validateListingSiteBUrl] Starting URL validation for:', url);

    const puppeteerConfig = getPuppeteerConfig();
    browser = await launchBrowserWithRetries(puppeteer, puppeteerConfig);

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the URL with shorter timeout
    await page.goto(url, {
      timeout: 45000, // Reduced timeout
      waitUntil: ['domcontentloaded'], // Simplified wait condition
    });

    // Wait for dynamic content to load with shorter timeout
    await delay(1500); // Reduced wait time

    // Look for the message button
    const buttonSelector =
      'button[data-cy="store-send-message-button"][data-testid="store-reply-ad-button"]';
    const buttonExists = (await page.$(buttonSelector)) !== null;

    if (buttonExists) {
      console.log('[validateListingSiteBUrl] URL is valid - message button found');
      return {
        isValid: true,
        reason: 'Active listing with message button found',
      };
    } else {
      console.log(
        '[validateListingSiteBUrl] URL is invalid - message button not found'
      );

      // Get page title for diagnostics
      let pageTitle = 'Unknown';
      try {
        pageTitle = await page.title();
      } catch (titleError) {
        // Ignore title errors
      }

      return {
        isValid: false,
        reason: `Message button not found - listing may be inactive or removed. Page title: ${pageTitle}`,
      };
    }
  } catch (error) {
    console.error('[validateListingSiteBUrl] Error validating URL:', error);

    let errorMessage = error.message;
    if (
      error.message.includes('Chrome') ||
      error.message.includes('chromium')
    ) {
      errorMessage = `Browser launch failed: ${error.message}. Please check Chrome/Chromium installation.`;
    } else if (
      error.message.includes('Navigation Timeout') ||
      error.message.includes('timeout')
    ) {
      errorMessage = `Page navigation timed out after 45 seconds. The target website may be slow or unreachable.`;
    } else if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      errorMessage = `DNS resolution failed. The URL may be invalid or there may be network connectivity issues.`;
    } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      errorMessage = `Connection refused. The target server may be down or blocking connections.`;
    } else if (error.message.includes('net::')) {
      errorMessage = `Network error: ${error.message}. Please check the URL and network connectivity.`;
    }

    return {
      isValid: false,
      reason: `Error during validation: ${errorMessage}`,
    };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error('[validateListingSiteBUrl] Error closing page:', closeError);
      }
    }

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error(
          '[validateListingSiteBUrl] Error closing browser:',
          closeError
        );
      }
    }

    // Force cleanup after validation
    try {
      console.log('[validateListingSiteBUrl] Performing cleanup...');
      await killZombieChrome();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('[validateListingSiteBUrl] Garbage collection completed');
      }
    } catch (cleanupError) {
      console.log(
        '[validateListingSiteBUrl] Cleanup error (non-fatal):',
        cleanupError.message
      );
    }
  }
};

// Extract content from listingsiteb.example.com with sequential processing , main method
const extractListingSiteBContent = async (id, bearerToken = null, url = null) => {
  const maxRetries = 2;
  let retryCount = 0;
  let puppeteer;

  try {
    console.log('[extractListingSiteBContent] Loading Puppeteer dynamically...');
    puppeteer = require('puppeteer-core');
    console.log('[extractListingSiteBContent] Puppeteer loaded successfully');

    // Validate URL first if provided
    if (url) {
      console.log(
        '[extractListingSiteBContent] Validating URL before extraction...'
      );
      const urlValidation = await validateListingSiteBUrl(url);

      if (!urlValidation.isValid) {
        console.error(
          '[extractListingSiteBContent] URL validation failed:',
          urlValidation.reason
        );
        const error = new Error(`Invalid URL: ${urlValidation.reason}`);
        error.status = 404;
        error.code = 'URL_NOT_FOUND';
        throw error;
      }

      console.log(
        '[extractListingSiteBContent] URL validation passed:',
        urlValidation.reason
      );
    }

    while (retryCount <= maxRetries) {
      try {
        console.log(
          '[extractListingSiteBContent] Starting sequential data extraction...'
        );

        // SEQUENTIAL PROCESSING: First get the token and wait for it
        let currentToken;
        if (bearerToken) {
          currentToken = bearerToken;
          console.log(
            '[extractListingSiteBContent] Using provided bearer token:',
            currentToken
          );
        } else if (url) {
          console.log('[extractListingSiteBContent] Getting token from URL...');
          currentToken = await getCachedOrFreshToken(url);
          console.log('[extractListingSiteBContent] Retrieved token:', currentToken);
        } else {
          console.error('[extractListingSiteBContent] No bearer token available');
          throw new Error('No bearer token available');
        }

        // If no token, don't proceed with fetches
        if (!currentToken) {
          console.error(
            '[extractListingSiteBContent] No valid token found, aborting fetch operations'
          );
          throw new Error('No valid token found');
        }

        console.log(
          '[extractListingSiteBContent] Token acquired successfully, proceeding with motor data fetch...'
        );

        // SEQUENTIAL PROCESSING: Now fetch motor data and wait for it
        const motorUrl = `https://api.listingsiteb.example.com/motor-query-service/v1/view/${id}`;
        const motorResponse = await fetch(motorUrl, {
          method: 'GET',
          headers: {
            accept: '*/*',
            'accept-language': 'en-US,en;q=0.5',
            priority: 'u=1, i',
            'sec-ch-ua':
              '"Chromium";v="136", "Brave";v="136", "Not.A/Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'sec-gpc': '1',
          },
          referrer: 'https://www.listingsiteb.example.com/',
          referrerPolicy: 'strict-origin-when-cross-origin',
          body: null,
          mode: 'cors',
          credentials: 'omit',
        });

        let motorData = null;
        let usedFallback = false;

        if (!motorResponse.ok) {
          console.log('[extractListingSiteBContent] Motor response:', motorResponse);
          console.error(
            '[extractListingSiteBContent] Failed to fetch motor data:',
            motorResponse.status,
            motorResponse.statusText
          );

          // If motor query service returns 404, try fallback API
          if (motorResponse.status === 404) {
            console.log(
              '[extractListingSiteBContent] Motor query service returned 404, trying fallback search_bff API...'
            );

            try {
              const fallbackUrl = `https://api.listingsiteb.example.com/search_bff/v2/content/${id}?include=store&include=partner_placements&include=breadcrumbs&include=archived&include=car_condition&include=home_delivery&include=realestate&status=active&status=deleted&status=hidden_by_user`;
              const fallbackResponse = await fetch(fallbackUrl, {
                method: 'GET',
                headers: {
                  accept: '*/*',
                  'accept-language': 'en-US,en;q=0.5',
                  authorization: `Bearer ${currentToken}`,
                  origin: 'https://www.listingsiteb.example.com',
                  priority: 'u=1, i',
                  referer: 'https://www.listingsiteb.example.com/',
                  'sec-ch-ua':
                    '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
                  'sec-ch-ua-mobile': '?0',
                  'sec-ch-ua-platform': '"Windows"',
                  'sec-fetch-dest': 'empty',
                  'sec-fetch-mode': 'cors',
                  'sec-fetch-site': 'same-site',
                  'sec-gpc': '1',
                  'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                },
                referrer: 'https://www.listingsiteb.example.com/',
                referrerPolicy: 'strict-origin-when-cross-origin',
                body: null,
                mode: 'cors',
                credentials: 'include',
              });

              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                console.log(
                  '[extractListingSiteBContent] Fallback API response:',
                  JSON.stringify(fallbackData, null, 2)
                );

                // Use fallback data as motor data (we'll extract from it later)
                motorData = { fallbackData: fallbackData };
                usedFallback = true;
                console.log(
                  '[extractListingSiteBContent] Successfully used fallback API'
                );
              } else {
                console.error(
                  '[extractListingSiteBContent] Fallback API also failed:',
                  fallbackResponse.status,
                  fallbackResponse.statusText
                );
                throw new Error(
                  `Both motor query service and fallback API failed. Motor: ${motorResponse.status} ${motorResponse.statusText}, Fallback: ${fallbackResponse.status} ${fallbackResponse.statusText}`
                );
              }
            } catch (fallbackError) {
              console.error(
                '[extractListingSiteBContent] Error with fallback API:',
                fallbackError
              );
              throw new Error(
                `Failed to fetch motor data: ${motorResponse.status} ${motorResponse.statusText}. Fallback also failed: ${fallbackError.message}`
              );
            }
          } else {
            throw new Error(
              `Failed to fetch motor data: ${motorResponse.status} ${motorResponse.statusText}`
            );
          }
        } else {
          console.log(
            '[extractListingSiteBContent] Motor data fetched successfully, parsing...'
          );
          motorData = await motorResponse.json();
        }

        console.log(
          '[extractListingSiteBContent] Motor data parsed, proceeding with content data fetch...'
        );

        let contentData = null;

        // If we used fallback API, we already have the content data
        if (usedFallback) {
          console.log(
            '[extractListingSiteBContent] Using content data from fallback API...'
          );
          contentData = motorData.fallbackData;
          // Clear the fallback data wrapper since we now have it as contentData
          motorData = { usedFallback: true };
        } else {
          // SEQUENTIAL PROCESSING: Now fetch content data and wait for it
          const contentUrl = `https://api.listingsiteb.example.com/search_bff/v2/content/${id}?include=store&include=partner_placements&include=breadcrumbs&include=archived&include=car_condition&include=home_delivery&include=realestate&status=active&status=deleted&status=hidden_by_user`;
          const contentResponse = await fetch(contentUrl, {
            method: 'GET',
            headers: {
              accept: '*/*',
              'accept-language': 'en-US,en;q=0.5',
              authorization: `Bearer ${currentToken}`,
              priority: 'u=1, i',
              'sec-ch-ua':
                '"Chromium";v="136", "Brave";v="136", "Not.A/Brand";v="99"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-site',
              'sec-gpc': '1',
            },
            referrer: 'https://www.listingsiteb.example.com/',
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
          });

          if (!contentResponse.ok) {
            // Check if it's an authorization error
            if (
              contentResponse.status === 401 ||
              contentResponse.status === 403
            ) {
              console.error(
                '[extractListingSiteBContent] Authorization failed, clearing token cache and retrying...'
              );
              clearTokenCache();

              if (retryCount < maxRetries && url) {
                retryCount++;
                console.log(
                  `[extractListingSiteBContent] Retry attempt ${retryCount}/${maxRetries}`
                );
                continue; // Retry with fresh token
              }
            }

            console.error(
              '[extractListingSiteBContent] Failed to fetch content data:',
              contentResponse.status,
              contentResponse.statusText
            );
            throw new Error(
              `Failed to fetch content data: ${contentResponse.status} ${contentResponse.statusText}`
            );
          }

          console.log(
            '[extractListingSiteBContent] Content data fetched successfully, parsing...'
          );
          contentData = await contentResponse.json();
        }

        console.log(
          '[extractListingSiteBContent] Content data parsed, combining data...'
        );

        // Combine the data
        const combinedData = {
          ...motorData,
          content: contentData,
        };

        console.log(
          '[extractListingSiteBContent] Data combined, processing images...'
        );

        // SEQUENTIAL PROCESSING: Process images
        let imageUrls = [];
        if (combinedData.content.data.images) {
          combinedData.content.data.images.forEach((image) => {
            image.url = image.url + '?type=3840x2880';
          });
          imageUrls = combinedData.content.data.images.map((el) => el.url);
        }

        console.log(
          '[extractListingSiteBContent] Images processed, extracting data...'
        );

        // SEQUENTIAL PROCESSING: Extract data
        let extractedData;

        if (usedFallback) {
          console.log(
            '[extractListingSiteBContent] Extracting data from fallback API response...'
          );

          // Helper function to find parameter by key from all parameter groups
          const findParameterValue = (key) => {
            const parameterGroups =
              combinedData.content.data?.parameter_groups || [];
            for (const group of parameterGroups) {
              const param = group.parameters?.find((p) => p.id === key);
              if (param) return param.value;
            }
            return '';
          };

          // Extract data using the specific field mappings
          extractedData = {
            // Brand & Model Information (with fallback sources)
            brand_name:
              findParameterValue('cx_make') ||
              findParameterValue('car_brand') ||
              '',
            model:
              findParameterValue('cx_model') ||
              findParameterValue('level_1') ||
              '',

            // Vehicle Specifications
            horsepower: findParameterValue('cx_engine_power') || '',
            km_stand: (() => {
              const value = findParameterValue('mileage') || '';
              const numericValue = value.toString().replace(/[^\d]/g, ''); // Remove all non-numeric characters
              return numericValue ? parseInt(numericValue, 10) * 10 : ''; // Parse to int and multiply by 10
            })(), //data is in mil which is 10 km
            fuel_type: findParameterValue('fuel') || '',
            transmission_type: findParameterValue('gearbox') || '',

            // Registration & Dating (with fallback sources)
            first_registration:
              findParameterValue('regdate') ||
              findParameterValue('search_regdate') ||
              '',

            // Other fields
            color: findParameterValue('color') || '',
            registration_number: combinedData.content.data.license_plate || '',
            deal_stage: '', // Empty for now
            vin_number: '', // Empty for now
            internal_url:
              combinedData.content.data.share_url ||
              combinedData.content.data.url ||
              '',
            listing_price: combinedData.content.data.price?.value || '',
            currency: combinedData.content.data.price?.suffix || '',
            features: (() => {
              // Extract features from attributes array
              const attributes = combinedData.content.data.attributes || [];
              const equipmentAttr = attributes.find(
                (attr) => attr.id === 'car_equipment'
              );
              return equipmentAttr?.items?.join(', ') || '';
            })(),
            seat: findParameterValue('seats') || '',
            co2: findParameterValue('co2') || '',
          };

          console.log(
            '[extractListingSiteBContent] Fallback extracted data:',
            JSON.stringify(extractedData, null, 2)
          );
        } else {
          // Extract data from normal motor API response structure
          extractedData = {
            brand_name: combinedData.tsData?.[0]?.items?.[0].value || '',
            model: combinedData.tsData?.[0]?.items?.[1].value || '',
            color: combinedData.tsData?.[0]?.items?.[5].value || '',
            horsepower: combinedData.tsData?.[1]?.items?.[0].value || '',
            registration_number: combinedData.content.data.license_plate || '',
            deal_stage: '', // Empty for now
            first_registration:
              combinedData.tsData?.[0]?.items?.[4].value || '',
            km_stand: (() => {
              const value =
                combinedData.content.data.parameter_groups?.[0]?.parameters?.[2]
                  ?.value || '';
              const numericValue = value.toString().replace(/[^\d]/g, ''); // Remove all non-numeric characters
              return numericValue ? parseInt(numericValue, 10) * 10 : ''; // Parse to int and multiply by 10
            })(), //data is in mil which is 10 km
            fuel_type:
              combinedData.content.data.parameter_groups?.[0]?.parameters?.[0]
                ?.value || '',
            transmission_type: combinedData.tsData[0].items[6].value || '',
            vin_number: '', // Empty for now
            internal_url: combinedData.share_url || '',
            listing_price: combinedData.content.data.price?.value || '',
            currency: combinedData.content.data.price?.suffix || '',
            features:
              combinedData.content.data.attributes?.[0]?.items?.join(', ') ||
              '',
            seat: combinedData.tsData[0].items[7].value,
            co2: combinedData.tsData[1].items[4].value,
          };
        }

        console.log(
          '[extractListingSiteBContent] Data extracted, starting translation...'
        );

        // SEQUENTIAL PROCESSING: Translate the data
        const translated = await translateWithGPTEnglishOnly(extractedData);
        translated.en.images = imageUrls;

        // If fallback was used, append the fallback data to the response
        if (usedFallback) {
          console.log(
            '[extractListingSiteBContent] Appending fallback data to response...'
          );
          translated.fallback_used = true;
          translated.fallback_data = combinedData.content;
          translated.fallback_source = 'search_bff_api';
          console.log(
            '[extractListingSiteBContent] Fallback data appended to response'
          );
        }

        console.log(
          '[extractListingSiteBContent] Sequential processing completed successfully'
        );
        return translated;
      } catch (error) {
        console.error(
          `[extractListingSiteBContent] Attempt ${retryCount + 1} failed:`,
          error
        );

        if (retryCount >= maxRetries) {
          console.error('Error extracting ListingSiteB content:', error);
          throw error;
        }

        retryCount++;
        console.log(
          `[extractListingSiteBContent] Retrying (${retryCount}/${maxRetries})...`
        );

        // Clear token cache on error to force fresh token on retry
        if (url) {
          clearTokenCache();
        }
      }
    }
  } finally {
    // Final cleanup after content extraction
    try {
      console.log('[extractListingSiteBContent] Performing final cleanup...');
      await killZombieChrome();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('[extractListingSiteBContent] Garbage collection completed');
      }
    } catch (cleanupError) {
      console.log(
        '[extractListingSiteBContent] Cleanup error (non-fatal):',
        cleanupError.message
      );
    }
  }
};

// Helper method to get bearer token from network requests
const getBearer = async (url) => {
  let browser;
  let retryCount = 0;
  const maxRetries = 3;
  let puppeteer;

  while (retryCount < maxRetries) {
    try {
      console.log('[getBearer] Loading Puppeteer dynamically...');
      puppeteer = require('puppeteer-core');
      console.log('[getBearer] Puppeteer loaded successfully');

      const puppeteerConfig = getPuppeteerConfig();
      browser = await launchBrowserWithRetries(puppeteer, puppeteerConfig);

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setRequestInterception(true);

      let bearerToken = null;
      let bearerPromiseResolve;
      const bearerPromise = new Promise((resolve) => {
        bearerPromiseResolve = resolve;
      });

      // Listen for requests
      page.on('request', (request) => {
        try {
          const requestUrl = request.url();
          if (
            requestUrl.includes('api.listingsiteb.example.com/search_bff/v2/content/') &&
            requestUrl.includes('include=store') &&
            requestUrl.includes('include=partner_placements')
          ) {
            const headers = request.headers();
            const token = headers.authorization?.split(' ')[1];
            if (token) {
              bearerToken = token;
              bearerPromiseResolve(token);
            }
          }
          request.continue();
        } catch (requestError) {
          console.error('[getBearer] Error in request handler:', requestError);
          request.continue();
        }
      });

      // Add error event listener
      page.on('error', (err) => {
        console.error('[getBearer] Page error:', err);
      });

      await page.goto(url, {
        timeout: 45000, // Reduced timeout
        waitUntil: ['domcontentloaded'], // Simplified wait condition
      });

      // Wait for either the bearer token to be found or timeout after 20 seconds
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(
          () => reject(new Error('Bearer token timeout after 20 seconds')),
          20000
        );
        return timeoutId;
      });

      bearerToken = await Promise.race([bearerPromise, timeoutPromise]);

      if (!bearerToken) {
        throw new Error('Bearer token not found in network requests');
      }

      return bearerToken;
    } catch (error) {
      console.error(`[getBearer] Attempt ${retryCount + 1} failed:`, error);

      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('[getBearer] Error closing browser:', closeError);
        }
      }

      retryCount++;

      if (retryCount >= maxRetries) {
        throw new Error(
          `Failed to get bearer token after ${maxRetries} attempts: ${error.message}`
        );
      }

      await delay(5000);
    }
  }

  // Final cleanup outside the retry loop
  try {
    console.log('[getBearer] Performing final cleanup...');
    await killZombieChrome();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('[getBearer] Garbage collection completed');
    }
  } catch (cleanupError) {
    console.log('[getBearer] Cleanup error (non-fatal):', cleanupError.message);
  }
};

// Extract data using GPT for non-ListingSiteB URLs
const extractDataWithGPT = async (page) => {
  await page.waitForSelector('#skip-tabbar', { timeout: 10000 });
  const relevantContent = await page.evaluate(() => {
    const element = document.querySelector('#skip-tabbar');
    return element ? element.outerHTML : null;
  });

  if (!relevantContent) {
    throw new Error('Required content section not found in the page');
  }

  // Prompt template for GPT to extract listing information
  const EXTRACTION_PROMPT = `Please analyze the following HTML content and extract car listing information.

Return the data in JSON format with the following fields. Field names must remain in English. Field **values** must be translated and returned in lowercase.

Return the data in the following structure:

{
  "seller_email": "...",
  "seller_phone_number": "...",
  "brand_name": "...",
  "model": "...",
  "color": "...",
  "horsepower": ...,
  "registration_number": "...",
  "first_registration": "YYYY-MM-DD",
  "km_stand": ...,
  "fuel_type": "...",
  "transmission_type": "...",
  "country": "...",
  "equipment_package": "...",
  "co2_emissions": ...,
  "vin_number": "...",
  "estimated_price": ...,
  "features": "comma-separated, lowercase features"
}

Important notes:
- All field names must remain in English.
- All values must be translated and returned in lowercase.
- If an equipment section is present in the HTML, extract bullet points or list items and join them into a single lowercase comma-separated string under "features".

HTML Content:
`;

  // Call GPT API to extract information
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Switched to faster, cheaper model
    messages: [
      {
        role: 'system',
        content: 'Extract car listing data from HTML. Return valid JSON only.',
      },
      {
        role: 'user',
        content: EXTRACTION_PROMPT + relevantContent,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0, // More deterministic, faster responses
  });

  return JSON.parse(completion.choices[0].message.content);
};

// Process monitoring function
const logProcessStats = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  console.log('[ProcessMonitor] Memory Usage:', {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
  });

  console.log('[ProcessMonitor] CPU Usage:', {
    user: `${Math.round(cpuUsage.user / 1000)} ms`,
    system: `${Math.round(cpuUsage.system / 1000)} ms`,
  });

  console.log(
    '[ProcessMonitor] Uptime:',
    `${Math.round(process.uptime())} seconds`
  );
};

// Periodic cleanup function to maintain system health
const performPeriodicCleanup = async () => {
  try {
    console.log('[performPeriodicCleanup] Starting periodic cleanup...');

    // Check system resources if available
    const resources = await checkSystemResources();

    if (resources && resources.needsCleanup) {
      console.log(
        '[performPeriodicCleanup] System needs cleanup, performing...'
      );
      await killZombieChrome();
    } else if (resources === null) {
      console.log(
        '[performPeriodicCleanup] System resource monitoring not available, skipping resource-based cleanup'
      );
    } else {
      console.log(
        '[performPeriodicCleanup] System resources are healthy, no cleanup needed'
      );
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('[performPeriodicCleanup] Garbage collection forced');
    } else {
      console.log('[performPeriodicCleanup] Garbage collection not available');
    }

    console.log('[performPeriodicCleanup] Periodic cleanup completed');
  } catch (error) {
    console.log(
      '[performPeriodicCleanup] Error during periodic cleanup (non-fatal):',
      error.message
    );
  }
};

const scrapeWithOxylabs = async (url) => {
  try {
    const username = process.env.OXY_LABS_USERNAME;
    const password = process.env.OXY_LABS_PASSWORD;

    if (!username || !password) {
      throw new Error('Oxylabs credentials not set in environment variables');
    }

    const body = {
      source: 'universal',
      url: url,
      render: 'html',
    };

    console.log(`[scrapeWithOxylabs] Scraping URL: ${url}`);

    const response = await axios.post(
      'https://realtime.oxylabs.io/v1/queries',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
        },
        timeout: 180000, // 3 minutes timeout
      }
    );

    console.log(`[scrapeWithOxylabs] Status: ${response.status}`);

    // Check for results array structure typical of Oxylabs Real-time Scraper
    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0 &&
      response.data.results[0].content
    ) {
      return response.data.results[0].content;
    }

    // Fallback if structure is different
    if (typeof response.data === 'string') {
      return response.data;
    }

    throw new Error('Unexpected response structure from Oxylabs API');
  } catch (error) {
    console.error('[scrapeWithOxylabs] Error:', error.message);
    if (error.response) {
      console.error(
        '[scrapeWithOxylabs] Response data:',
        JSON.stringify(error.response.data)
      );
    }
    throw error;
  }
};

module.exports = {
  scrapeWithOxylabs,
  extractListingSiteBContent,
  getBearer,
  extractDataWithGPT,
  translateWithGPT,
  translateWithGPTEnglishOnly,
  getLogoFilename,
  getCachedOrFreshToken,
  clearTokenCache,
  validateListingSiteBUrl,
  validateListingSiteBUrlsBatch,
  logProcessStats,
  killZombieChrome,
  checkSystemResources,
  performPeriodicCleanup,
  launchBrowserWithRetries,
};
