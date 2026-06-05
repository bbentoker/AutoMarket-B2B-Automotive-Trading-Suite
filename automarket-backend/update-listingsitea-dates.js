const bcrypt = require('bcrypt');

// SECURITY-SANITIZED: Hardcoded production DB credentials were removed.
// Copy .env.example to .env and configure your local database.
require('dotenv').config();

// Import database and models
const sequelize = require('./src/config/database');
const User = require('./src/models/User');

// Main function to update listingsitea_url_add_date to null
async function updateListingSiteADates() {
  try {
    console.log('🚀 Starting listingsitea date update...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Find all users with listingsitea_url_add_date not null
    const usersToUpdate = await User.findAll({
      where: {
        listingsitea_url_add_date: {
          [sequelize.Sequelize.Op.ne]: null,
        },
      },
      attributes: ['id', 'email', 'company_name', 'listingsitea_url_add_date'],
    });

    console.log(
      `📊 Found ${usersToUpdate.length} users with listingsitea_url_add_date set`
    );

    if (usersToUpdate.length === 0) {
      console.log('ℹ️ No users found with listingsitea_url_add_date set');
      return;
    }

    // Show users that will be updated
    console.log('\n📋 Users to be updated:');
    usersToUpdate.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.company_name} (${user.email}) - Current date: ${user.listingsitea_url_add_date}`
      );
    });

    // Update all users
    console.log('\n🔄 Updating users...');

    const updateResult = await User.update(
      { listingsitea_url_add_date: null },
      {
        where: {
          listingsitea_url_add_date: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      }
    );

    console.log(`✅ Successfully updated ${updateResult[0]} users`);

    // Verify the update
    const updatedUsers = await User.findAll({
      where: {
        listingsitea_url_add_date: {
          [sequelize.Sequelize.Op.ne]: null,
        },
      },
      attributes: ['id', 'email', 'company_name', 'listingsitea_url_add_date'],
    });

    if (updatedUsers.length === 0) {
      console.log(
        '✅ Verification successful: All listingsitea_url_add_date fields are now null'
      );
    } else {
      console.log(
        `⚠️ Warning: ${updatedUsers.length} users still have listingsitea_url_add_date set`
      );
      updatedUsers.forEach((user) => {
        console.log(
          `   - ${user.company_name} (${user.email}): ${user.listingsitea_url_add_date}`
        );
      });
    }

    console.log('\n🎯 Update completed successfully!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Alternative function to update specific users by email list
async function updateSpecificUsers() {
  try {
    console.log('🚀 Starting specific user listingsitea date update...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Read the CSV to get email list
    const fs = require('fs');
    const csvContent = fs.readFileSync('./CH DEALERS - Sheet1.csv', 'utf8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map((header) => header.trim());

    const emails = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((val) => val.trim());
      const emailIndex = headers.findIndex((h) => h === 'E-mail');
      if (emailIndex !== -1 && values[emailIndex]) {
        emails.push(values[emailIndex]);
      }
    }

    console.log(`📊 Found ${emails.length} emails in CSV`);

    // Update specific users by email
    let updatedCount = 0;
    for (const email of emails) {
      try {
        const user = await User.findOne({ where: { email: email } });
        if (user) {
          await user.update({ listingsitea_url_add_date: null });
          updatedCount++;
          console.log(`✅ Updated: ${user.company_name} (${email})`);
        } else {
          console.log(`⚠️ User not found: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Error updating user ${email}:`, error.message);
      }
    }

    console.log(`\n🎯 Successfully updated ${updatedCount} users`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Function to show current listingsitea_url_add_date values
async function showCurrentDates() {
  try {
    console.log('🔍 Checking current listingsitea_url_add_date values...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const users = await User.findAll({
      where: {
        listingsitea_url_add_date: {
          [sequelize.Sequelize.Op.ne]: null,
        },
      },
      attributes: ['id', 'email', 'company_name', 'listingsitea_url_add_date'],
      order: [['company_name', 'ASC']],
    });

    if (users.length === 0) {
      console.log('ℹ️ No users found with listingsitea_url_add_date set');
    } else {
      console.log(
        `\n📋 Found ${users.length} users with listingsitea_url_add_date set:`
      );
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.company_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Date: ${user.listingsitea_url_add_date}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--show')) {
    await showCurrentDates();
  } else if (args.includes('--specific')) {
    await updateSpecificUsers();
  } else {
    await updateListingSiteADates();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  updateListingSiteADates,
  updateSpecificUsers,
  showCurrentDates,
};

