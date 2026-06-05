const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

// Import database and models
const sequelize = require('./src/config/database');
const NewsletterContact = require('./src/models/NewsletterContact');

// Language to country mapping based on provided country IDs
const languageToCountryId = {
  German: 83, // Germany - DE
  French: 76, // France - FR
  Italian: 110, // Italy - IT
  Dutch: 155, // Netherlands - NL
  English: 40, // Canada - CA (default for English)
};

async function insertNewsletterContacts() {
  try {
    console.log('🔄 Starting newsletter contacts insertion...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Read the Excel file
    const filePath = path.join(__dirname, 'Spreadsheet 1.xlsx');
    const workbook = XLSX.readFile(filePath);

    let totalInserted = 0;
    let totalSkipped = 0;
    let errors = [];

    // Process Switzerland sheet
    console.log('\n📊 Processing Switzerland sheet...');
    const switzerlandSheet = workbook.Sheets['Switzerland'];
    const switzerlandData = XLSX.utils.sheet_to_json(switzerlandSheet, {
      header: 1,
    });

    // Process rows starting from row 3 (index 2) as rows 1-2 are headers/metadata
    for (let i = 2; i < switzerlandData.length; i++) {
      const row = switzerlandData[i];

      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) continue;

      const companyName = row[0]
        ?.toString()
        .trim()
        .replace(/^"(.*)"$/, '$1'); // Remove quotes
      const firstName = row[1]?.toString().trim();
      const email = row[2]?.toString().trim();
      const language = row[4]?.toString().trim() || '';

      // Skip if no email
      if (!email) {
        console.log(`⚠️  Row ${i + 1}: Skipping - no email provided`);
        totalSkipped++;
        continue;
      }

      // Determine country ID from language
      let countryId = languageToCountryId[language];
      if (!countryId) {
        const languageDisplay = language || 'undefined/empty';
        console.log(
          `⚠️  Row ${i + 1}: Unknown language '${languageDisplay}', defaulting to Germany (DE)`
        );
        countryId = 83; // Default to Germany
      }

      // Use firstName if available, otherwise use companyName
      const name = firstName || companyName;

      try {
        // Check if contact already exists
        const existingContact = await NewsletterContact.findOne({
          where: { email: email },
        });

        if (existingContact) {
          console.log(
            `⏭️  Row ${i + 1}: Contact with email '${email}' already exists, skipping`
          );
          totalSkipped++;
          continue;
        }

        // Insert new contact
        await NewsletterContact.create({
          name: name,
          company: companyName,
          email: email,
          country_id: countryId,
        });

        console.log(
          `✅ Row ${i + 1}: Inserted ${name} (${companyName}) - ${email} [${language}]`
        );
        totalInserted++;
      } catch (error) {
        const errorMsg = `Row ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
      }
    }
    // Process Belgium sheet
    console.log('\n📊 Processing Belgium sheet...');
    const belgiumSheet = workbook.Sheets['Belgium'];
    const belgiumData = XLSX.utils.sheet_to_json(belgiumSheet, { header: 1 });

    // Process rows starting from row 1 (index 0) as data starts immediately
    for (let i = 0; i < belgiumData.length; i++) {
      const row = belgiumData[i];

      // Skip empty rows or header-like rows
      if (!row || row.length === 0 || !row[0] || row[0] === 'Company name')
        continue;

      const companyName = row[0]
        ?.toString()
        .trim()
        .replace(/^"(.*)"$/, '$1'); // Remove quotes
      const firstName = row[1]?.toString().trim();
      const email = row[2]?.toString().trim();
      const language = row[4]?.toString().trim() || '';

      // Skip if no email
      if (!email) {
        console.log(`⚠️  Belgium Row ${i + 1}: Skipping - no email provided`);
        totalSkipped++;
        continue;
      }

      // Determine country ID from language
      let countryId = languageToCountryId[language];
      if (!countryId) {
        const languageDisplay = language || 'undefined/empty';
        console.log(
          `⚠️  Belgium Row ${i + 1}: Unknown language '${languageDisplay}', defaulting to Netherlands (NL)`
        );
        countryId = 155; // Default to Netherlands for Belgium (closest match)
      }

      // Use firstName if available, otherwise use companyName
      const name = firstName || companyName;

      try {
        // Check if contact already exists
        const existingContact = await NewsletterContact.findOne({
          where: { email: email },
        });

        if (existingContact) {
          console.log(
            `⏭️  Belgium Row ${i + 1}: Contact with email '${email}' already exists, skipping`
          );
          totalSkipped++;
          continue;
        }

        // Insert new contact
        await NewsletterContact.create({
          name: name,
          company: companyName,
          email: email,
          country_id: countryId,
        });

        console.log(
          `✅ Belgium Row ${i + 1}: Inserted ${name} (${companyName}) - ${email} [${language}]`
        );
        totalInserted++;
      } catch (error) {
        const errorMsg = `Belgium Row ${i + 1}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
      }
    }

    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`✅ Total contacts inserted: ${totalInserted}`);
    console.log(`⏭️  Total contacts skipped: ${totalSkipped}`);
    console.log(`❌ Total errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n🔍 ERRORS:');
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Newsletter contacts insertion completed!');
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await sequelize.close();
    console.log('📪 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  insertNewsletterContacts();
}

module.exports = insertNewsletterContacts;
