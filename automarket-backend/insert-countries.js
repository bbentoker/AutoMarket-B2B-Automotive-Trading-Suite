#!/usr/bin/env node

/**
 * Insert Countries Script
 *
 * This script reads countries from countries.json and inserts them into the database
 * using the Country model. It handles duplicates gracefully and provides detailed logging.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('./src/config/database');
const Country = require('./src/models/Country');

/**
 * Load countries from JSON file
 */
function loadCountriesFromJSON() {
  try {
    const jsonPath = path.join(__dirname, 'src', 'sql', 'countries.json');

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Countries JSON file not found at: ${jsonPath}`);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const countries = JSON.parse(jsonData);

    console.log(`📄 Loaded ${countries.length} countries from JSON file`);
    return countries;
  } catch (error) {
    console.error('❌ Error loading countries JSON:', error.message);
    throw error;
  }
}

/**
 * Validate country data
 */
function validateCountry(country, index) {
  const errors = [];

  if (
    !country.name ||
    typeof country.name !== 'string' ||
    country.name.trim() === ''
  ) {
    errors.push(`Missing or invalid name`);
  }

  if (
    !country.code ||
    typeof country.code !== 'string' ||
    country.code.trim() === ''
  ) {
    errors.push(`Missing or invalid code`);
  } else if (country.code.length !== 2) {
    errors.push(`Code must be exactly 2 characters, got: ${country.code}`);
  }

  if (errors.length > 0) {
    console.warn(
      `⚠️  Country at index ${index} has validation errors:`,
      errors
    );
    console.warn(`   Data:`, country);
    return false;
  }

  return true;
}

/**
 * Insert countries into database
 */
async function insertCountries(countries) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  console.log('\n🚀 Starting country insertion process...\n');

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];

    // Validate country data
    if (!validateCountry(country, i)) {
      errors++;
      continue;
    }

    try {
      const countryData = {
        name: country.name.trim(),
        code: country.code.trim().toUpperCase(),
      };

      // Try to find existing country by code
      const existingCountry = await Country.findOne({
        where: { code: countryData.code },
      });

      if (existingCountry) {
        // Update if name is different
        if (existingCountry.name !== countryData.name) {
          await existingCountry.update({ name: countryData.name });
          console.log(
            `📝 Updated: ${countryData.code} - ${existingCountry.name} → ${countryData.name}`
          );
          updated++;
        } else {
          console.log(`✓ Exists: ${countryData.code} - ${countryData.name}`);
          skipped++;
        }
      } else {
        // Insert new country
        await Country.create(countryData);
        console.log(`✅ Inserted: ${countryData.code} - ${countryData.name}`);
        inserted++;
      }
    } catch (error) {
      console.error(
        `❌ Error processing country ${country.code} (${country.name}):`,
        error.message
      );
      errors++;
    }
  }

  return { inserted, updated, skipped, errors };
}

/**
 * Get current country statistics
 */
async function getCountryStats() {
  try {
    const totalCount = await Country.count();
    const sampleCountries = await Country.findAll({
      limit: 5,
      order: [['name', 'ASC']],
    });

    return { totalCount, sampleCountries };
  } catch (error) {
    console.error('Error getting country stats:', error.message);
    return { totalCount: 0, sampleCountries: [] };
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Sync database models
 */
async function syncDatabase() {
  try {
    console.log('🔄 Syncing database models...');
    await sequelize.sync();
    console.log('✅ Database models synced');
    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🌍 Country Insertion Tool');
  console.log('=========================\n');

  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.log(
        '\n💡 Please check your database configuration and try again.'
      );
      process.exit(1);
    }

    // Sync database
    const synced = await syncDatabase();
    if (!synced) {
      console.log(
        '\n💡 Database sync failed. Please check your models and try again.'
      );
      process.exit(1);
    }

    // Get current stats
    console.log('\n📊 Current database state:');
    const beforeStats = await getCountryStats();
    console.log(`   Total countries in database: ${beforeStats.totalCount}`);

    if (beforeStats.sampleCountries.length > 0) {
      console.log('   Sample countries:');
      beforeStats.sampleCountries.forEach((country) => {
        console.log(`   - ${country.code}: ${country.name}`);
      });
    }

    // Load countries from JSON
    const countries = loadCountriesFromJSON();

    // Validate that we have countries to insert
    if (countries.length === 0) {
      console.log('⚠️  No countries found in JSON file');
      process.exit(0);
    }

    // Ask for confirmation if there are existing countries
    if (beforeStats.totalCount > 0) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const question = (prompt) =>
        new Promise((resolve) => rl.question(prompt, resolve));

      console.log(
        `\n⚠️  Database already contains ${beforeStats.totalCount} countries.`
      );
      console.log('This script will:');
      console.log("- Insert new countries that don't exist");
      console.log('- Update existing countries if names differ');
      console.log('- Skip countries that are identical');

      const proceed = await question('\nDo you want to continue? (y/N): ');
      rl.close();

      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('👋 Operation cancelled');
        process.exit(0);
      }
    }

    // Insert countries
    const results = await insertCountries(countries);

    // Get final stats
    console.log('\n📊 Final results:');
    console.log('==================');
    console.log(`✅ Inserted: ${results.inserted} countries`);
    console.log(`📝 Updated:  ${results.updated} countries`);
    console.log(`✓ Skipped:   ${results.skipped} countries (already exist)`);
    console.log(`❌ Errors:   ${results.errors} countries`);

    const afterStats = await getCountryStats();
    console.log(`\n📈 Total countries in database: ${afterStats.totalCount}`);

    if (results.errors > 0) {
      console.log(
        '\n⚠️  Some countries had errors. Please check the logs above.'
      );
      process.exit(1);
    } else {
      console.log('\n🎉 Country insertion completed successfully!');
    }
  } catch (error) {
    console.error('\n💥 Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await sequelize.close();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }
}

/**
 * Command line interface
 */
if (require.main === module) {
  // Handle command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Country Insertion Tool');
    console.log('======================');
    console.log('');
    console.log('Usage: node insert-countries.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --stats        Show current country statistics only');
    console.log('  --validate     Validate JSON file without inserting');
    console.log('');
    console.log('Examples:');
    console.log(
      '  node insert-countries.js              # Insert countries from JSON'
    );
    console.log(
      '  node insert-countries.js --stats      # Show current statistics'
    );
    console.log('  node insert-countries.js --validate   # Validate JSON file');
    process.exit(0);
  }

  if (args.includes('--stats')) {
    // Show stats only
    (async () => {
      try {
        await testConnection();
        const stats = await getCountryStats();
        console.log(`Total countries: ${stats.totalCount}`);
        if (stats.sampleCountries.length > 0) {
          console.log('Sample countries:');
          stats.sampleCountries.forEach((country) => {
            console.log(`- ${country.code}: ${country.name}`);
          });
        }
        await sequelize.close();
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    })();
  } else if (args.includes('--validate')) {
    // Validate JSON only
    try {
      const countries = loadCountriesFromJSON();
      let validCount = 0;
      let invalidCount = 0;

      countries.forEach((country, index) => {
        if (validateCountry(country, index)) {
          validCount++;
        } else {
          invalidCount++;
        }
      });

      console.log(`✅ Valid countries: ${validCount}`);
      console.log(`❌ Invalid countries: ${invalidCount}`);
      console.log(`📊 Total countries: ${countries.length}`);

      if (invalidCount > 0) {
        console.log(
          '\n⚠️  Some countries have validation errors. Please check the logs above.'
        );
        process.exit(1);
      } else {
        console.log('\n🎉 All countries are valid!');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } else {
    // Run main insertion
    main();
  }
}

module.exports = {
  loadCountriesFromJSON,
  insertCountries,
  validateCountry,
  getCountryStats,
};
