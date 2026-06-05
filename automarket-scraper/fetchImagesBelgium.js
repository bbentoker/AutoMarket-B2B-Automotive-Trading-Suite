#!/usr/bin/env node

/**
 * Image Fetcher Script
 * 
 * This script fetches and uploads missing images for NORMAL (non-Swiss) ListingSiteA adverts.
 * It only processes listings where price_currency is NOT 'CHF'.
 * 
 * Usage:
 *   node fetchImages.js [options]
 * 
 * Options:
 *   --limit <number>     Maximum number of adverts to process (optional, no limit if not specified)
 *   --inactive          Include inactive adverts (default: only active)
 *   --ids <id1,id2>     Process specific advert IDs (comma-separated)
 *   --help              Show this help message
 * 
 * Examples:
 *   node fetchImages.js --limit 10
 *   node fetchImages.js --ids 12345,67890,11111
 *   node fetchImages.js --limit 100 --inactive
 *   node fetchImages.js (processes all normal adverts without images)
 */

const { fetchAllMissingImages, fetchImagesForSpecificAdverts } = require('./src/services/imageFetcher');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: null, // No limit by default
    onlyActive: true,
    specificIds: null,
    showHelp: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--limit':
        const limitValue = parseInt(args[++i]);
        if (limitValue && limitValue > 0) {
          options.limit = limitValue;
        } else {
          console.error(`Invalid limit value. Must be a positive number.`);
          process.exit(1);
        }
        break;
      case '--inactive':
        options.onlyActive = false;
        break;
      case '--ids':
        const ids = args[++i];
        if (ids) {
          options.specificIds = ids.split(',').map(id => id.trim()).filter(id => id);
        }
        break;
      case '--help':
      case '-h':
        options.showHelp = true;
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        console.log('Use --help for usage information');
        process.exit(1);
    }
  }
  
  return options;
}

// Show help message
function showHelp() {
  console.log(`
Image Fetcher Script

This script fetches and uploads missing images for NORMAL (non-Swiss) ListingSiteA adverts.
It only processes listings where price_currency is NOT 'CHF'.

Usage:
  node fetchImages.js [options]

Options:
  --limit <number>     Maximum number of adverts to process (optional, no limit if not specified)
  --inactive          Include inactive adverts (default: only active)
  --ids <id1,id2>     Process specific advert IDs (comma-separated)
  --help              Show this help message

Examples:
  node fetchImages.js --limit 10
  node fetchImages.js --ids 12345,67890,11111
  node fetchImages.js --limit 100 --inactive
  node fetchImages.js (processes all normal adverts without images)

Note:
  This script ONLY processes normal listings (non-Swiss).
  Swiss listings (price_currency = 'CHF') are automatically skipped.
`);
}

// Main function
async function main() {
  try {
    const options = parseArgs();
    
    if (options.showHelp) {
      showHelp();
      return;
    }
    
    console.log('🚀 Starting ListingSiteA Image Fetcher...');
    console.log('📊 Configuration:', {
      limit: options.limit || 'no limit',
      onlyActive: options.onlyActive,
      specificIds: options.specificIds ? `${options.specificIds.length} IDs` : 'none',
      processingType: 'NORMAL listings only (non-Swiss)'
    });
    
    let stats;
    
    if (options.specificIds && options.specificIds.length > 0) {
      // Process specific adverts
      console.log(`🎯 Processing specific adverts: ${options.specificIds.join(', ')}`);
      stats = await fetchImagesForSpecificAdverts(options.specificIds);
    } else {
      // Process adverts based on filters
      stats = await fetchAllMissingImages({
        limit: options.limit,
        onlyActive: options.onlyActive
      });
    }
    
    console.log('\n✅ Image fetching completed successfully!');
    console.log('📊 Final Results:');
    console.log(`   Total found: ${stats.total}`);
    console.log(`   Successfully processed: ${stats.successful}`);
    console.log(`   Failed: ${stats.failed}`);
    
    if (stats.successful > 0) {
      console.log(`\n🎉 Successfully uploaded ${stats.successful} images to MinIO!`);
    }
    
    if (stats.failed > 0) {
      console.log(`\n⚠️  ${stats.failed} adverts failed to process. Check the logs above for details.`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Process interrupted by user. Exiting gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Process terminated. Exiting gracefully...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs, showHelp };
