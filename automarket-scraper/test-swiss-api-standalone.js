const {
  extractDealerIdFromChUrl,
  fetchAllSwissDealerListings,
  scrapeSwissDealer,
  isSwissRegionUrl
} = require('./src/services/listingsiteaChApi');
require('dotenv').config();

/**
 * Standalone Swiss API Response Test - Check for null fields
 * This script tests the Swiss ListingSiteA API directly with a known dealer URL
 * without requiring the external user management API.
 */

function analyzeObject(obj, path = '', level = 0) {
  const indent = '  '.repeat(level);
  const results = [];
  
  if (obj === null) {
    results.push(`${indent}${path}: NULL`);
    return results;
  }
  
  if (obj === undefined) {
    results.push(`${indent}${path}: UNDEFINED`);
    return results;
  }
  
  if (typeof obj !== 'object') {
    results.push(`${indent}${path}: ${typeof obj} = ${obj}`);
    return results;
  }
  
  if (Array.isArray(obj)) {
    results.push(`${indent}${path}: Array[${obj.length}]`);
    if (obj.length > 0 && level < 2) { // Limit depth for readability
      results.push(...analyzeObject(obj[0], `${path}[0]`, level + 1));
      if (obj.length > 1) {
        results.push(`${indent}  ... ${obj.length - 1} more items`);
      }
    }
    return results;
  }
  
  // Regular object
  const keys = Object.keys(obj);
  results.push(`${indent}${path}: Object{${keys.length} keys}`);
  
  for (const key of keys) {
    const currentPath = path ? `${path}.${key}` : key;
    results.push(...analyzeObject(obj[key], currentPath, level + 1));
  }
  
  return results;
}

function findNullFields(obj, path = '') {
  const nullFields = [];
  
  if (obj === null) {
    nullFields.push(path);
    return nullFields;
  }
  
  if (obj === undefined) {
    nullFields.push(`${path} (undefined)`);
    return nullFields;
  }
  
  if (typeof obj !== 'object') {
    return nullFields;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      nullFields.push(...findNullFields(item, `${path}[${index}]`));
    });
    return nullFields;
  }
  
  // Regular object
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    nullFields.push(...findNullFields(value, currentPath));
  }
  
  return nullFields;
}

async function testSwissApiStandalone() {
  try {
    console.log('🇨🇭 STANDALONE SWISS API RESPONSE TESTER');
    console.log('=========================================');
    console.log('This test will directly test the Swiss ListingSiteA API with a known dealer URL.\n');
    
    // Test with a known Swiss dealer URL (you can modify this)
    const testDealerUrl = 'https://www.listingsitea.ch/de/s/seller-62713';
    
    console.log(`🏢 Testing with dealer URL: ${testDealerUrl}`);
    
    // Step 1: Verify this is a Swiss URL
    console.log('\n🔍 Step 1: Verifying Swiss URL...');
    const isSwiss = isSwissRegionUrl(testDealerUrl);
    console.log(`✅ Is Swiss URL: ${isSwiss}`);
    
    if (!isSwiss) {
      console.log('❌ Not a Swiss URL, please provide a valid Swiss ListingSiteA URL');
      return;
    }
    
    // Step 2: Extract dealer ID
    console.log('\n🏢 Step 2: Extracting dealer ID...');
    const dealerId = extractDealerIdFromChUrl(testDealerUrl);
    
    if (!dealerId) {
      console.log('❌ Could not extract dealer ID from URL');
      return;
    }
    
    console.log(`✅ Dealer ID: ${dealerId}`);
    
    // Step 3: Fetch raw API data (limited to 5 listings for testing)
    console.log('\n📡 Step 3: Fetching Swiss API data...');
    console.log('⏳ This may take a moment...\n');
    
    const rawListings = await fetchAllSwissDealerListings(dealerId);
    
    if (!rawListings || rawListings.length === 0) {
      console.log('❌ No listings found for this dealer');
      return;
    }
    
    console.log(`📊 Fetched ${rawListings.length} total listings`);
    
    // Step 4: Analyze first 3 listings for null fields
    console.log('\n🔬 Step 4: ANALYZING FIRST 3 LISTINGS FOR NULL FIELDS');
    console.log('===================================================');
    
    const listingsToAnalyze = rawListings.slice(0, 3);
    
    listingsToAnalyze.forEach((listing, index) => {
      console.log(`\n📋 LISTING ${index + 1} (ID: ${listing.id})`);
      console.log('─'.repeat(40));
      
      // Find null fields
      const nullFields = findNullFields(listing);
      if (nullFields.length === 0) {
        console.log('✅ No null or undefined fields found!');
      } else {
        console.log(`⚠️ Found ${nullFields.length} null/undefined fields:`);
        nullFields.forEach(field => {
          console.log(`   • ${field}`);
        });
      }
      
      // Show key fields that are present
      console.log('\n📝 Key fields present:');
      const keyFields = ['id', 'price', 'make.name', 'model.name', 'mileage', 'fuelType', 'seller.name', 'seller.type'];
      keyFields.forEach(fieldPath => {
        const value = fieldPath.split('.').reduce((obj, key) => obj?.[key], listing);
        if (value !== null && value !== undefined) {
          console.log(`   ✅ ${fieldPath}: ${value}`);
        } else {
          console.log(`   ❌ ${fieldPath}: ${value === null ? 'NULL' : 'UNDEFINED'}`);
        }
      });
    });
    
    // Step 5: Overall null field analysis
    console.log('\n📊 Step 5: OVERALL NULL FIELD ANALYSIS');
    console.log('=====================================');
    
    const allNullFields = new Set();
    const fieldCounts = {};
    const totalListings = rawListings.length;
    
    // Count null fields across all listings
    rawListings.forEach((listing, index) => {
      const nullFields = findNullFields(listing, `listing[${index}]`);
      nullFields.forEach(field => {
        const cleanField = field.replace(/listing\[\d+\]\./, '');
        allNullFields.add(cleanField);
        fieldCounts[cleanField] = (fieldCounts[cleanField] || 0) + 1;
      });
    });
    
    if (allNullFields.size === 0) {
      console.log('🎉 Excellent! No null or undefined fields found across any listings!');
    } else {
      console.log(`⚠️ Found ${allNullFields.size} unique null/undefined field patterns:\n`);
      
      // Sort by frequency (most common nulls first)
      const sortedNullFields = Array.from(allNullFields)
        .map(field => ({
          field,
          count: fieldCounts[field] || 0,
          percentage: ((fieldCounts[field] || 0) / totalListings * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);
      
      console.log('Field Name'.padEnd(40) + 'Null Count'.padEnd(15) + 'Percentage');
      console.log('─'.repeat(65));
      
      sortedNullFields.forEach(({ field, count, percentage }) => {
        console.log(`${field.padEnd(40)}${count.toString().padEnd(15)}${percentage}%`);
      });
    }
    
    // Step 6: Show complete structure of one listing
    console.log('\n📄 Step 6: COMPLETE LISTING STRUCTURE SAMPLE');
    console.log('============================================');
    
    if (rawListings.length > 0) {
      const sampleListing = JSON.parse(JSON.stringify(rawListings[0])); // Deep clone
      
      // Mask sensitive data
      if (sampleListing.seller?.name) {
        sampleListing.seller.name = '[DEALER_NAME_MASKED]';
      }
      if (sampleListing.seller?.phoneNumber) {
        sampleListing.seller.phoneNumber = '[PHONE_MASKED]';
      }
      
      console.log('\nComplete structure (sensitive data masked):');
      console.log(JSON.stringify(sampleListing, null, 2));
    }
    
    // Step 7: Recommendations
    console.log('\n📋 RECOMMENDATIONS FOR NULL FIELD HANDLING');
    console.log('==========================================');
    console.log('Based on the analysis above, consider the following in your scraper:');
    console.log('');
    console.log('1. ✅ ALWAYS NULL FIELDS (safe to ignore):');
    console.log('   • leasing - Always null (not used in Swiss market)');
    console.log('   • previousPrice - Usually null (no price history)');
    console.log('   • seller.logoKey - Often null (dealers without logos)');
    console.log('');
    console.log('2. ⚠️ SOMETIMES NULL FIELDS (add null checks):');
    console.log('   • range - Null for non-electric vehicles');
    console.log('   • qualiLogo/qualiLogoId - Null if dealer has no quality certification');
    console.log('   • consumption.combined - Null for some older vehicles');
    console.log('   • images - Rarely null, but should be handled');
    console.log('');
    console.log('3. 🔧 RECOMMENDED NULL HANDLING:');
    console.log('   • Use || operators for fallbacks: listing.make?.name || "Unknown"');
    console.log('   • Check arrays before accessing: listing.images?.length > 0');
    console.log('   • Provide defaults for missing data: price || 0');
    
    console.log('\n✅ STANDALONE TEST COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('\n❌ ERROR DURING STANDALONE TEST:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Allow customizing the dealer URL via command line argument
const customDealerUrl = process.argv[2];
if (customDealerUrl) {
  console.log(`Using custom dealer URL: ${customDealerUrl}`);
  // You can modify the test function to accept a parameter if needed
}

// Run the test
if (require.main === module) {
  testSwissApiStandalone().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { testSwissApiStandalone };
