const fs = require('fs');
const path = require('path');

/**
 * Setup script to configure Chromium environment variables for local development
 * This matches the Docker configuration for consistent behavior
 */

function findChromiumPath() {
  const paths = [];

  if (process.platform === 'win32') {
    paths.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    );
  } else if (process.platform === 'darwin') {
    paths.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    );
  } else {
    // Linux
    paths.push(
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable'
    );
  }

  for (const chromePath of paths) {
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }

  return null;
}

function setupEnvironment() {
  console.log(
    '🔍 Setting up Chromium environment for invoice PDF generation...\n'
  );

  const chromiumPath = findChromiumPath();

  if (chromiumPath) {
    console.log(`✅ Found Chromium at: ${chromiumPath}`);

    // Set environment variables
    process.env.PUPPETEER_EXECUTABLE_PATH = chromiumPath;
    process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
    process.env.CHROMIUM_PATH = chromiumPath;

    console.log('\n📝 Environment variables set:');
    console.log(`   PUPPETEER_EXECUTABLE_PATH=${chromiumPath}`);
    console.log(`   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`);
    console.log(`   CHROMIUM_PATH=${chromiumPath}`);

    // Create .env file for persistence
    const envContent = `# Chromium configuration for PDF generation
PUPPETEER_EXECUTABLE_PATH=${chromiumPath}
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
CHROMIUM_PATH=${chromiumPath}
`;

    try {
      fs.writeFileSync('.env.chromium', envContent);
      console.log('\n💾 Created .env.chromium file for persistence');
      console.log('   You can source this file or copy to your main .env');
    } catch (error) {
      console.warn('⚠️  Could not create .env.chromium file:', error.message);
    }
  } else {
    console.log('❌ No Chromium/Chrome installation found!');
    console.log('\n💡 Solutions:');
    console.log('1. Install Google Chrome: https://www.google.com/chrome/');
    console.log('2. Or install full Puppeteer: npm install puppeteer');
    console.log('3. Or set PUPPETEER_EXECUTABLE_PATH manually');

    process.exit(1);
  }

  console.log('\n🎉 Setup complete! You can now generate PDF invoices.');
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupEnvironment();
}

module.exports = {
  findChromiumPath,
  setupEnvironment,
};
