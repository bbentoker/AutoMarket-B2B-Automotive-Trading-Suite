const cron = require('node-cron');
const { Op, Sequelize } = require('sequelize');
const UserReportOptions = require('../models/UserReportOptions');
const User = require('../models/User');
const Advert = require('../models/advert');
const Listing = require('../models/Listing');
const {
  calculateReport,
  generateWeeklyReportEmailData,
} = require('../services/reportService');
const emailService = require('../services/emailService');
const loginCodeService = require('../services/loginCodeService');

// Configuration constants
const CRON_CONFIG = {
  SCHEDULE: '0 * * * *', // Every hour at minute 0
  TIMEZONE: 'Europe/Stockholm',
};

const DEV_CONFIG = {
  ALLOWED_USER_IDS: [6, 12],
  DEFAULT_LANGUAGE: 'en',
  INFO_EMAIL: 'info@automarket.example.com',
};

const TIME_CONFIG = {
  LOCALE: 'en-US',
  HOUR_PADDING: 2,
};

/**
 * Gets the current day and hour for scheduling comparison
 * @returns {Object} Object containing currentDay and currentHour
 */
function getCurrentTimeInfo() {
  const now = new Date();
  const currentDay = now
    .toLocaleDateString(TIME_CONFIG.LOCALE, {
      weekday: 'long',
    })
    .toLowerCase();
  const currentHour = now
    .getHours()
    .toString()
    .padStart(TIME_CONFIG.HOUR_PADDING, '0');

  console.log('📅 Current scheduling time:', currentDay, currentHour);
  return { currentDay, currentHour };
}

/**
 * Fetches users who have scheduled reports for the current day and hour
 * @param {string} currentDay - Current day of the week
 * @param {string} currentHour - Current hour in 24h format
 * @returns {Promise<Array>} Array of scheduled report options with user data
 */
async function getScheduledReports(currentDay, currentHour) {
  return await UserReportOptions.findAll({
    where: {
      is_sending: true,
      when_to_send: {
        [Op.and]: [
          Sequelize.literal(`when_to_send->>'day' = '${currentDay}'`),
          Sequelize.literal(`when_to_send->>'hour' = '${currentHour}'`),
        ],
      },
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'company_name', 'language'],
      },
    ],
  });
}

/**
 * Checks if user should be processed in development environment
 * @param {Object} user - User object
 * @returns {boolean} Whether user should be processed
 */
function shouldProcessUserInDev(user) {
  if (process.env.NODE_ENV !== 'dev') {
    return true;
  }

  const shouldProcess = DEV_CONFIG.ALLOWED_USER_IDS.includes(user.id);
  if (!shouldProcess) {
    console.log(`🔧 [DEV] Skipping user: ${user.company_name}`);
  }
  return shouldProcess;
}

/**
 * Generates login code for a user
 * @param {number} userId - User ID
 * @returns {Promise<string|null>} Login code or null if generation fails
 */
async function generateUserLoginCode(userId) {
  try {
    const loginCodeResult = await loginCodeService.generateCode(userId);
    const loginCode = loginCodeResult.token;
    console.log(`🔐 Generated login code for user ${userId}`);
    return loginCode;
  } catch (error) {
    console.error(
      `❌ Error generating login code for user ${userId}:`,
      error.message
    );
    return null;
  }
}

/**
 * Sends weekly report email to user and info email if not in dev mode
 * @param {Object} user - User object
 * @param {Object} emailData - Email data with login code
 */
async function sendReportEmails(user, emailData) {
  const language = user.language || DEV_CONFIG.DEFAULT_LANGUAGE;

  // Send to info email if not in dev mode
  if (process.env.NODE_ENV !== 'dev') {
    await emailService.sendWeeklyReportEmail(
      DEV_CONFIG.INFO_EMAIL,
      emailData,
      language
    );
  }

  // Send to user
  await emailService.sendWeeklyReportEmail(user.email, emailData, language);
}

/**
 * Processes a single scheduled report
 * @param {Object} reportOption - Report option with user data
 * @returns {Promise<boolean>} Success status
 */
async function processSingleReport(reportOption) {
  const user = reportOption.user;

  if (!user) {
    console.error(
      `❌ User not found for scheduled report ID ${reportOption.id}`
    );
    return false;
  }

  if (!shouldProcessUserInDev(user)) {
    return true; // Skip but don't count as error
  }

  console.log(
    `📧 Processing scheduled report for: ${user.name} (${user.email})`
  );

  try {
    // Generate login code
    const loginCode = await generateUserLoginCode(user.id);

    // Check if user is Swedish based on listingsitea_url
    const isSwedish =
      user.listingsitea_url && user.listingsitea_url.includes('listingsitea.ch');

    // Generate email data
    const result = await generateWeeklyReportEmailData(
      reportOption.id,
      isSwedish
    );

    if (!result.success) {
      console.error(
        `❌ Error generating email data for report ID ${reportOption.id}:`,
        result.error
      );
      return false;
    }

    // Prepare email data with login code
    const emailDataWithLoginCode = {
      ...result.emailData,
      loginCode: loginCode,
      user_id: user.id,
    };

    // Send emails
    await sendReportEmails(user, emailDataWithLoginCode);

    // Update report status
    reportOption.is_sending = false;
    await reportOption.save();

    console.log(`✅ Scheduled report sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error processing report for user ${user.id}:`,
      error.message
    );
    return false;
  }
}

/**
 * Main function to send weekly reports based on user scheduling preferences
 */
async function sendWeeklyReports() {
  try {
    console.log('⏰ Checking scheduled weekly reports...');

    const { currentDay, currentHour } = getCurrentTimeInfo();
    const scheduledReports = await getScheduledReports(currentDay, currentHour);
    console.log(
      `📊 Found ${scheduledReports.length} scheduled reports for ${currentDay} at ${currentHour}:00`
    );

    if (scheduledReports.length === 0) {
      console.log('✅ No scheduled reports for current time');
      return;
    }

    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each scheduled report
    for (const reportOption of scheduledReports) {
      const success = await processSingleReport(reportOption);

      if (success === true) {
        processedCount++;
      } else if (success === false) {
        errorCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(
      `🎯 Report process complete: ${processedCount} sent, ${errorCount} errors${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`
    );
  } catch (error) {
    console.error('❌ Error in scheduled report check:', error);
  }
}

/**
 * Schedule the cron job to run every hour (only if enabled via environment variable)
 */
let weeklyReportJob = null;

// Check if weekly report cron is enabled
const isWeeklyReportCronEnabled =
  process.env.ENABLE_WEEKLY_REPORT_CRON === 'true';

if (isWeeklyReportCronEnabled) {
  weeklyReportJob = cron.schedule(
    CRON_CONFIG.SCHEDULE,
    () => {
      console.log('📊 Running scheduled weekly reports check...');
      sendWeeklyReports();
    },
    {
      scheduled: true,
      timezone: CRON_CONFIG.TIMEZONE,
    }
  );

  console.log(
    `🚀 Weekly report cron job scheduled (${CRON_CONFIG.SCHEDULE} in ${CRON_CONFIG.TIMEZONE})`
  );

  // Run initial check on startup
  sendWeeklyReports().catch((error) => {
    console.error('❌ Error in initial weekly reports check:', error.message);
  });
} else {
  console.log(
    '⏸️ Weekly report cron job is disabled (ENABLE_WEEKLY_REPORT_CRON not set to true)'
  );
}

/**
 * Export for testing or manual triggering
 */
module.exports = {
  sendWeeklyReports,
  weeklyReportJob,
  // Export utility functions for testing
  getCurrentTimeInfo,
  getScheduledReports,
  processSingleReport,
};
