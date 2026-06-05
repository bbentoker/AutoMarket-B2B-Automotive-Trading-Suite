# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# ListingSiteA Scraping Configuration

## Overview

The ListingSiteA scraping functionality has been optimized for production environments with configurable timeouts and robust error handling to prevent the navigation timeout issues experienced in production.

## Environment Variables

Configure these environment variables in your production environment to optimize scraping performance:

### Timeout Configuration

- `LISTING_SITE_A_BROWSER_TIMEOUT` (default: 180000ms / 3 minutes)

  - Controls browser launch and protocol timeout
  - Increase if browser launch is slow in production

- `LISTING_SITE_A_NAVIGATION_TIMEOUT` (default: 180000ms / 3 minutes)

  - Controls page navigation and element waiting timeout
  - Increase if pages load slowly due to network conditions

- `LISTING_SITE_A_GLOBAL_TIMEOUT` (default: 300000ms / 5 minutes)
  - Controls the overall operation timeout
  - Prevents the entire scraping operation from hanging indefinitely

### Example Configuration

For production environments with slower network or resource constraints:

```bash
export LISTING_SITE_A_BROWSER_TIMEOUT=240000    # 4 minutes
export LISTING_SITE_A_NAVIGATION_TIMEOUT=240000 # 4 minutes
export LISTING_SITE_A_GLOBAL_TIMEOUT=420000     # 7 minutes
```

For faster environments:

```bash
export LISTING_SITE_A_BROWSER_TIMEOUT=120000    # 2 minutes
export LISTING_SITE_A_NAVIGATION_TIMEOUT=120000 # 2 minutes
export LISTING_SITE_A_GLOBAL_TIMEOUT=240000     # 4 minutes
```

## Production Optimizations

The ListingSiteA scraping now includes:

1. **Production-optimized Puppeteer configuration** using `getPuppeteerConfigForScraping`
2. **Retry mechanisms** for browser launch and navigation failures
3. **Improved error handling** with specific error messages for different failure types
4. **Resource cleanup** with forced browser process termination if needed
5. **Comprehensive logging** for debugging production issues

## Troubleshooting

### Common Issues

1. **Navigation Timeout**

   - Increase `LISTING_SITE_A_NAVIGATION_TIMEOUT`
   - Check network connectivity to ListingSiteA
   - Verify Chrome/Chromium is properly installed

2. **Browser Launch Failed**

   - Verify Chrome executable path: `CHROME_EXECUTABLE_PATH=/usr/bin/chromium`
   - Check available memory and system resources
   - Ensure proper permissions for Chrome binary

3. **Protocol Errors**
   - Usually indicates resource constraints
   - Consider increasing server memory
   - Check for zombie Chrome processes

### Monitoring

The scraping function now provides detailed logging:

- Browser launch attempts and success/failure
- Navigation attempts with retry information
- Page content detection status
- Resource cleanup status
- Detailed error context for debugging

### Docker Configuration

The existing Dockerfile already includes the necessary Chrome/Chromium setup. The environment variables are automatically configured:

```dockerfile
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

## Performance Notes

- Changed from `networkidle2` to `domcontentloaded` for faster page loading
- Added selective element waiting instead of full page load
- Implemented smart retry logic with exponential backoff
- Added global timeout to prevent hanging operations

## Testing

Test the configuration with:

```bash
# Set test timeouts
export LISTING_SITE_A_BROWSER_TIMEOUT=60000
export LISTING_SITE_A_NAVIGATION_TIMEOUT=60000
export LISTING_SITE_A_GLOBAL_TIMEOUT=120000

# Test scraping
curl -X POST http://localhost:3000/api/listings/extract-listingsitea \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.listingsitea.example.com/offers/..."}'
```
