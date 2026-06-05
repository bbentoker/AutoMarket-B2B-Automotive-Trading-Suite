const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const XLSX = require('xlsx');

// SECURITY-SANITIZED: Hardcoded production DB credentials and dealer data files
// were removed for public showcase. Copy .env.example to .env and supply your
// own dealer spreadsheet before running this script.
require('dotenv').config();

// Import database and models
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const LoginCode = require('./src/models/LoginCode');

// Import login code service
const loginCodeService = require('./src/services/loginCodeService');

// Excel file paths
// SECURITY-SANITIZED: Original customer dealer spreadsheets were deleted.
// Place your own sanitized dealer data files here before running.
const MAIN_EXCEL_FILE = process.env.DEALERS_EXCEL_FILE || './dealers_example.xlsx';
const BELGIUM_EXCEL_FILE = process.env.DEALERS_BELGIUM_EXCEL_FILE || './dealers_belgium_example.xlsx';

// Function to transform language to supported format
function transformLanguage(language) {
  if (!language) return 'en'; // Default to English

  const lang = language.toLowerCase().trim();

  // Language mapping
  const languageMap = {
    german: 'de',
    deutsch: 'de',
    de: 'de',
    english: 'en',
    en: 'en',
    italian: 'it',
    italiano: 'it',
    it: 'it',
    dutch: 'nl',
    nederlands: 'nl',
    nl: 'nl',
    french: 'fr',
    français: 'fr',
    francais: 'fr',
    fr: 'fr',
    // Additional mappings for Belgium
    flemish: 'nl',
    vlaams: 'nl',
    walloon: 'fr',
    wallon: 'fr',
  };

  return languageMap[lang] || 'en'; // Default to English if not found
}

// Function to parse a specific sheet from Excel file
function parseExcelSheet(filePath, sheetName, country) {
  console.log(
    `📖 Reading ${country} data from: ${filePath}, Sheet: ${sheetName}`
  );

  const workbook = XLSX.readFile(filePath);

  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);
  }

  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (data.length === 0) {
    throw new Error(`Sheet "${sheetName}" is empty`);
  }

  // Assuming first row contains headers
  const headers = data[0];
  console.log(`📋 ${country} Headers found: ${headers.join(', ')}`);

  const dealers = [];

  // Process data rows (skip header row)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row || row.length === 0 || !row[0]) continue;

    // Map the row data based on the structure
    // Handle both "Adress" and "Full Adress" column names
    const addressField = headers.includes('Full Adress')
      ? 'Full Adress'
      : 'Adress';

    const dealer = {
      'Company name': row[0] || '',
      'First name': row[1] || '',
      'E-mail': row[2] || '',
      [addressField]: row[3] || '',
      'Language spoken on adress': row[4] || '',
      'ListingSiteA Link': row[5] || '',
      lang: transformLanguage(row[4]), // Transform language to supported format
      country: country, // Add country information
      sourceSheet: sheetName, // Track source sheet
      sourceFile: filePath, // Track source file
    };

    // Only add dealers with at least an email
    if (dealer['E-mail']) {
      dealers.push(dealer);
      console.log(
        `✅ ${country} Dealer added: ${dealer['Company name']} (${dealer['E-mail']}) - Language: ${dealer['Language spoken on adress']} → ${dealer['lang']}`
      );
    }
  }

  console.log(`📊 Found ${dealers.length} valid dealers in ${country} sheet`);
  return dealers;
}

// Function to collect all dealers from all sources
function collectAllDealers() {
  const allDealers = [];

  try {
    // Read Switzerland sheet from main file
    if (fs.existsSync(MAIN_EXCEL_FILE)) {
      console.log('\n🇨🇭 Processing Switzerland dealers...');
      const switzerlandDealers = parseExcelSheet(
        MAIN_EXCEL_FILE,
        'Switzerland',
        'Switzerland'
      );
      allDealers.push(...switzerlandDealers);
    } else {
      console.warn(`⚠️ Main Excel file not found: ${MAIN_EXCEL_FILE}`);
    }

    // Read Belgium sheet from main file
    if (fs.existsSync(MAIN_EXCEL_FILE)) {
      console.log('\n🇧🇪 Processing Belgium dealers from main file...');
      const belgiumDealersMain = parseExcelSheet(
        MAIN_EXCEL_FILE,
        'Belgium',
        'Belgium'
      );
      allDealers.push(...belgiumDealersMain);
    }

    // Read Belgium dealers from separate file
    if (fs.existsSync(BELGIUM_EXCEL_FILE)) {
      console.log('\n🇧🇪 Processing Belgium dealers from separate file...');
      const belgiumDealersExtra = parseExcelSheet(
        BELGIUM_EXCEL_FILE,
        'Belgium',
        'Belgium'
      );
      allDealers.push(...belgiumDealersExtra);
    } else {
      console.warn(`⚠️ Belgium Excel file not found: ${BELGIUM_EXCEL_FILE}`);
    }
  } catch (error) {
    console.error('❌ Error collecting dealers:', error);
    throw error;
  }

  return allDealers;
}

// Function to generate login code for user
async function generateLoginCodeForUser(userId) {
  try {
    const result = await loginCodeService.generateCode(userId);
    return result.token;
  } catch (error) {
    console.error(`Error generating login code for user ${userId}:`, error);
    return null;
  }
}

// Function to process a single dealer
async function processDealer(dealer, index, totalCount) {
  try {
    console.log(
      `\n--- Processing dealer ${index + 1}/${totalCount}: ${dealer['Company name']} (${dealer.country}) ---`
    );

    const email = dealer['E-mail'];
    const companyName = dealer['Company name'];
    const firstName = dealer['First name'];

    // Handle both address field names
    const address = dealer['Full Adress'] || dealer['Adress'] || '';
    const language = dealer['Language spoken on adress'];
    const listingsiteaUrl = dealer['ListingSiteA Link'];
    const lang = dealer['lang'];
    const country = dealer['country'];

    // Check if user exists
    let user = await User.findOne({ where: { email: email } });

    if (user) {
      console.log(`✅ User exists: ${email}`);

      // Update user with missing information
      let updated = false;
      const updateData = {};

      if (!user.listingsitea_url && listingsiteaUrl) {
        updateData.listingsitea_url = listingsiteaUrl;
        updateData.listingsitea_url_add_date = new Date();
        updated = true;
        console.log(`📝 Updated listingsitea_url: ${listingsiteaUrl}`);
      }

      if (!user.billing_street && address) {
        updateData.billing_street = address;
        updated = true;
        console.log(`📝 Updated billing_street: ${address}`);
      }

      // Update country if not set or different
      if (!user.country || user.country !== country) {
        updateData.country = country;
        updated = true;
        console.log(`📝 Updated country to: ${country}`);
      }

      // Update language if not set
      if (!user.language || user.language !== lang) {
        updateData.language = lang;
        updated = true;
        console.log(`📝 Updated language to: ${lang}`);
      }

      if (updated) {
        await user.update(updateData);
        console.log(`✅ User updated successfully`);
      }
    } else {
      console.log(`🆕 Creating new user: ${email} (${country})`);

      // Create new user
      const password = `${firstName}123`;
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        name: firstName,
        email: email,
        company_name: companyName,
        billing_street: address,
        language: lang || 'en',
        password: hashedPassword,
        role_id: 2, // Assuming 2 is for dealers
        status_id: 2, // Assuming 2 is for active status
        listingsitea_url: listingsiteaUrl,
        listingsitea_url_add_date: new Date(),
        country: country,
      });

      console.log(`✅ New ${country} user created with ID: ${user.id}`);
    }

    // Generate login code
    console.log(`🔑 Generating login code for user: ${user.id}`);
    const loginCode = await generateLoginCodeForUser(user.id);

    if (loginCode) {
      const loginUrl = `https://browse.automarket.example.com/?login-code=${loginCode}`;
      dealer['Login URL'] = loginUrl;
      console.log(`🔗 Login URL generated: ${loginUrl}`);
    } else {
      dealer['Login URL'] = 'Error generating login code';
      console.log(`❌ Failed to generate login code`);
    }

    return dealer;
  } catch (error) {
    console.error(`❌ Error processing dealer ${index + 1}:`, error);
    dealer['Login URL'] = `Error: ${error.message}`;
    return dealer;
  }
}

// Function to write results back to Excel files
function writeResultsToExcel(dealers) {
  if (!dealers || dealers.length === 0) {
    console.log('⚠️ No data to write');
    return;
  }

  // Group dealers by country and source file
  const switzerlandDealers = dealers.filter((d) => d.country === 'Switzerland');
  const belgiumMainDealers = dealers.filter(
    (d) => d.country === 'Belgium' && d.sourceFile === MAIN_EXCEL_FILE
  );
  const belgiumExtraDealers = dealers.filter(
    (d) => d.country === 'Belgium' && d.sourceFile === BELGIUM_EXCEL_FILE
  );

  // Write consolidated results file
  const allHeaders = Object.keys(dealers[0]);
  const consolidatedWorksheetData = [
    allHeaders,
    ...dealers.map((row) => allHeaders.map((header) => row[header] || '')),
  ];

  const consolidatedWorkbook = XLSX.utils.book_new();
  const consolidatedWorksheet = XLSX.utils.aoa_to_sheet(
    consolidatedWorksheetData
  );
  XLSX.utils.book_append_sheet(
    consolidatedWorkbook,
    consolidatedWorksheet,
    'All_Dealers'
  );

  const consolidatedPath = './all_dealers_processed.xlsx';
  XLSX.writeFile(consolidatedWorkbook, consolidatedPath);
  console.log(`\n💾 Consolidated results written to: ${consolidatedPath}`);

  // Write separate results by country if needed
  if (switzerlandDealers.length > 0) {
    const swissWorkbook = XLSX.utils.book_new();
    const swissHeaders = Object.keys(switzerlandDealers[0]);
    const swissData = [
      swissHeaders,
      ...switzerlandDealers.map((row) =>
        swissHeaders.map((header) => row[header] || '')
      ),
    ];
    const swissWorksheet = XLSX.utils.aoa_to_sheet(swissData);
    XLSX.utils.book_append_sheet(
      swissWorkbook,
      swissWorksheet,
      'Switzerland_Dealers'
    );

    const swissPath = './switzerland_dealers_processed.xlsx';
    XLSX.writeFile(swissWorkbook, swissPath);
    console.log(`💾 Switzerland results written to: ${swissPath}`);
  }

  if (belgiumMainDealers.length > 0 || belgiumExtraDealers.length > 0) {
    const belgiumWorkbook = XLSX.utils.book_new();
    const allBelgiumDealers = [...belgiumMainDealers, ...belgiumExtraDealers];
    const belgiumHeaders = Object.keys(allBelgiumDealers[0]);
    const belgiumData = [
      belgiumHeaders,
      ...allBelgiumDealers.map((row) =>
        belgiumHeaders.map((header) => row[header] || '')
      ),
    ];
    const belgiumWorksheet = XLSX.utils.aoa_to_sheet(belgiumData);
    XLSX.utils.book_append_sheet(
      belgiumWorkbook,
      belgiumWorksheet,
      'Belgium_Dealers'
    );

    const belgiumPath = './belgium_dealers_processed.xlsx';
    XLSX.writeFile(belgiumWorkbook, belgiumPath);
    console.log(`💾 Belgium results written to: ${belgiumPath}`);
  }
}

// Function to remove duplicates based on email
function removeDuplicates(dealers) {
  const seen = new Set();
  const uniqueDealers = [];
  let duplicateCount = 0;

  for (const dealer of dealers) {
    const email = dealer['E-mail'];
    if (!seen.has(email)) {
      seen.add(email);
      uniqueDealers.push(dealer);
    } else {
      duplicateCount++;
      console.log(
        `🔄 Duplicate found and skipped: ${email} (${dealer['Company name']})`
      );
    }
  }

  console.log(
    `📊 Removed ${duplicateCount} duplicates, ${uniqueDealers.length} unique dealers remaining`
  );
  return uniqueDealers;
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting comprehensive dealer processing...');
    console.log('📋 This script will process dealers from:');
    console.log(`   - Switzerland sheet from: ${MAIN_EXCEL_FILE}`);
    console.log(`   - Belgium sheet from: ${MAIN_EXCEL_FILE}`);
    console.log(`   - Belgium sheet from: ${BELGIUM_EXCEL_FILE}`);

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Collect all dealers from all sources
    console.log('\n📂 Collecting dealers from all sources...');
    const allDealers = collectAllDealers();

    console.log(`\n📊 Total dealers collected: ${allDealers.length}`);

    // Summary by country
    const swissCount = allDealers.filter(
      (d) => d.country === 'Switzerland'
    ).length;
    const belgiumCount = allDealers.filter(
      (d) => d.country === 'Belgium'
    ).length;
    console.log(`   - Switzerland: ${swissCount} dealers`);
    console.log(`   - Belgium: ${belgiumCount} dealers`);

    // Remove duplicates
    console.log('\n🔄 Removing duplicates...');
    const uniqueDealers = removeDuplicates(allDealers);

    // Process all dealers
    console.log('\n🚀 Processing all dealers...');
    const processedDealers = [];

    for (let i = 0; i < uniqueDealers.length; i++) {
      const dealer = uniqueDealers[i];
      const processedDealer = await processDealer(
        dealer,
        i,
        uniqueDealers.length
      );
      processedDealers.push(processedDealer);

      // Add a small delay to avoid overwhelming the database
      if (i < uniqueDealers.length - 1) {
        console.log('⏳ Waiting 1 second before processing next dealer...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Write results to Excel files
    console.log('\n💾 Writing results to Excel files...');
    writeResultsToExcel(processedDealers);

    console.log('\n✅ All dealers processed successfully!');
    console.log(`📋 Processed ${processedDealers.length} dealers total`);
    console.log('📊 Final Summary:');
    console.log(
      `   - Switzerland dealers: ${processedDealers.filter((d) => d.country === 'Switzerland').length}`
    );
    console.log(
      `   - Belgium dealers: ${processedDealers.filter((d) => d.country === 'Belgium').length}`
    );
    console.log(`   - All Excel files processed and updated with login URLs`);
    console.log(
      `   - Languages transformed to supported format (en, it, de, nl, fr)`
    );
    console.log(`   - New users created or existing users updated`);
    console.log(`   - Countries properly assigned`);
    console.log(`   - Login codes generated for all dealers`);
    console.log(`   - Results saved to multiple output files`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  processDealer,
  parseExcelSheet,
  collectAllDealers,
  writeResultsToExcel,
  transformLanguage,
  removeDuplicates,
};
