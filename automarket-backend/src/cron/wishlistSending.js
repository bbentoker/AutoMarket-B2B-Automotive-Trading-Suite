const cron = require('node-cron');
const { Op, Sequelize } = require('sequelize');
const UserWishlistSendingOptions = require('../models/UserWishlistSendingOptions');
const User = require('../models/User');
const WishlistEmail = require('../models/WishlistEmail');
const loginCodeService = require('../services/loginCodeService');
const emailService = require('../services/emailService');

// Configuration constants
const CRON_CONFIG = {
  SCHEDULE: '0 * * * *', // Every hour at minute 0
  TIMEZONE: 'Europe/Stockholm',
};

const DEV_CONFIG = {
  ALLOWED_USER_IDS: [2012],
  DEFAULT_LANGUAGE: 'en',
  EMAIL_RECIPIENT: 'test@example.com',
  PRODUCTION_INFO_EMAIL: 'info@automarket.example.com',
};

const SENDER_CONFIG = {
  AVAILABLE_SENDERS: [
    'Info@automarket.example.com',
    'Ayoub@automarket.example.com',
    'carl@automarket.example.com',
  ],
};

const URL_CONFIG = {
  BASE_URL: 'https://dashboard.automarket.example.com',
  WISHLIST_PATH: '/wishlist',
};

const TIME_CONFIG = {
  LOCALE: 'en-US',
  HOUR_PADDING: 2,
};

/**
 * Randomly selects a sender email from the available senders
 * @returns {string} Random sender email address
 */
function getRandomSender() {
  const randomIndex = Math.floor(
    Math.random() * SENDER_CONFIG.AVAILABLE_SENDERS.length
  );
  return SENDER_CONFIG.AVAILABLE_SENDERS[randomIndex];
}

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

  console.log('📅 Current wishlist scheduling time:', currentDay, currentHour);
  return { currentDay, currentHour };
}

/**
 * Converts time from user timezone to server timezone (Europe/Stockholm)
 * @param {string} time - Time in HH:MM format
 * @param {string} timezone - User timezone
 * @returns {string} Converted time in HH format
 */
function convertTimeToServerTimezone(time, timezone) {
  if (!time || !timezone) {
    return time ? time.split(':')[0].padStart(2, '0') : null;
  }

  // If timezone is the same as server timezone, no conversion needed
  if (timezone === CRON_CONFIG.TIMEZONE) {
    const hour = time.split(':')[0].padStart(2, '0');
    return hour;
  }

  try {
    // Create a date object for today with the user's time
    const today = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    // Create date in user timezone - need to be more precise with timezone handling
    const userDateTime = new Date();
    userDateTime.setHours(hours, minutes || 0, 0, 0);

    // Format the time in user timezone first
    const userTimeString = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(userDateTime);

    // Then get what that time would be in server timezone
    const serverTime = new Intl.DateTimeFormat('sv-SE', {
      timeZone: CRON_CONFIG.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(userDateTime);

    const serverHour = serverTime.split(':')[0];
    return serverHour;
  } catch (error) {
    console.error('❌ Error converting timezone:', error.message);
    // Fallback to original time
    const fallbackHour = time.split(':')[0].padStart(2, '0');
    return fallbackHour;
  }
}

/**
 * Checks if the current time matches the user's scheduled time
 * @param {Object} whenToSend - User's scheduling configuration
 * @param {string} currentDay - Current day of the week
 * @param {string} currentHour - Current hour in 24h format
 * @returns {boolean} Whether current time matches schedule
 */
function isTimeToSend(whenToSend, currentDay, currentHour) {
  if (!whenToSend) {
    return false;
  }

  const { days, time, frequency, timezone } = whenToSend;

  // Check if current day is in the scheduled days
  if (days && Array.isArray(days)) {
    const isDayMatch = days.includes(currentDay);
    if (!isDayMatch) {
      return false;
    }
  }

  // Convert user time to server timezone and check hour
  if (time) {
    const scheduledHour = convertTimeToServerTimezone(time, timezone);
    if (scheduledHour !== currentHour) {
      return false;
    }
  }

  // Check frequency (for now we support 'weekly', can be extended)
  if (frequency && frequency !== 'weekly') {
    console.log(`⚠️ Unsupported frequency: ${frequency}, treating as weekly`);
  }

  return true;
}

/**
 * Fetches users who have scheduled wishlist notifications for the current day and hour
 * @param {string} currentDay - Current day of the week
 * @param {string} currentHour - Current hour in 24h format
 * @returns {Promise<Array>} Array of scheduled wishlist options with user data
 */
async function getScheduledWishlistNotifications(currentDay, currentHour) {
  const allWishlistOptions = await UserWishlistSendingOptions.findAll({
    where: {
      is_sending: true,
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'company_name', 'language'],
      },
    ],
  });
  // Filter based on complex scheduling logic
  const scheduledOptions = allWishlistOptions.filter((option) => {
    return isTimeToSend(option.when_to_send, currentDay, currentHour);
  });

  return scheduledOptions;
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
 * Generates wishlist URL with login token
 * @param {string} loginToken - User's login token
 * @returns {string} Complete wishlist URL
 */
function generateWishlistUrl(loginToken) {
  return `${URL_CONFIG.BASE_URL}${URL_CONFIG.WISHLIST_PATH}?login_token=${loginToken}`;
}

/**
 * Sends wishlist notification email to user and info email
 * @param {Object} user - User object
 * @param {string} wishlistUrl - Generated wishlist URL
 * @returns {Promise<boolean>} Success status
 */
async function sendWishlistNotificationEmail(user, wishlistUrl) {
  try {
    const language = user.language || DEV_CONFIG.DEFAULT_LANGUAGE;

    // Extract first name from full name (take first word)
    const firstName = user.name ? user.name.split(' ')[0] : 'User';
    const dealerName = user.company_name || 'Your Dealership';

    // Get random sender email for each email
    const randomSender = getRandomSender();
    console.log(`📧 Using random sender: ${randomSender}`);

    const emailData = {
      firstName,
      dealerName,
      wishlistUrl,
      language,
    };

    let emailsSent = 0;
    let totalEmails = 0;
    let userEmailResponse = null;

    // In development, send only to test email
    if (process.env.NODE_ENV === 'dev') {
      userEmailResponse = await emailService.sendEmail(
        'wishlistNotification',
        DEV_CONFIG.EMAIL_RECIPIENT,
        emailData,
        randomSender
      );
      emailsSent++;
      totalEmails = 1;
      console.log(
        `📧 [DEV] Wishlist email sent to ${DEV_CONFIG.EMAIL_RECIPIENT} for ${user.name} from ${randomSender}`
      );
    } else {
      // In production, send to both user email and info@automarket.example.com
      totalEmails = 2;

      try {
        userEmailResponse = await emailService.sendEmail(
          'wishlistNotification',
          user.email,
          emailData,
          randomSender
        );
        emailsSent++;
        console.log(
          `📧 Wishlist email sent to user: ${user.email} from ${randomSender}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to send to user ${user.email}:`,
          error.message
        );
      }

      try {
        await emailService.sendEmail(
          'wishlistNotification',
          DEV_CONFIG.PRODUCTION_INFO_EMAIL,
          emailData,
          randomSender
        );
        emailsSent++;
        console.log(
          `📧 Wishlist email sent to info: ${DEV_CONFIG.PRODUCTION_INFO_EMAIL} from ${randomSender}`
        );
      } catch (error) {
        console.error(`❌ Failed to send to info email:`, error.message);
      }
    }

    // Create WishlistEmail record if user email was sent successfully
    if (userEmailResponse && emailsSent > 0) {
      try {
        // Extract the Mailgun message ID from the response
        const messageId = userEmailResponse.id || userEmailResponse.data?.id;
        console.log('*************User Email Response exists *************');
        console.log('Message ID:', messageId);
        if (messageId) {
          // Clean the message ID by removing angle brackets if present
          const cleanMessageId = messageId.replace(/^<|>$/g, '');

          await WishlistEmail.create({
            user_id: user.id,
            mailgun_message_id: cleanMessageId,
            is_opened: false,
            sent_at: new Date(),
          });
          console.log(
            '*************WishlistEmail record created *************'
          );
          console.log(
            `✅ WishlistEmail record created for user ${user.id} with message ID: ${cleanMessageId}`
          );
        } else {
          console.warn(
            `⚠️ No message ID found in email response for user ${user.id}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error creating WishlistEmail record for user ${user.id}:`,
          error.message
        );
        // Don't fail the entire operation if record creation fails
      }
    }

    return emailsSent === totalEmails;
  } catch (error) {
    console.error(
      `❌ Error sending wishlist notification email for user ${user.id}:`,
      error.message
    );
    return false;
  }
}

/**
 * Processes a single scheduled wishlist notification
 * @param {Object} wishlistOption - Wishlist option with user data
 * @returns {Promise<boolean>} Success status
 */
async function processSingleWishlistNotification(wishlistOption) {
  const user = wishlistOption.user;

  if (!user) {
    console.error(
      `❌ User not found for wishlist sending option ID ${wishlistOption.id}`
    );
    return false;
  }

  if (!shouldProcessUserInDev(user)) {
    return true; // Skip but don't count as error
  }

  console.log(
    `📧 Processing wishlist notification for: ${user.name} (${user.email})`
  );

  try {
    // Generate login code
    const loginCode = await generateUserLoginCode(user.id);

    if (!loginCode) {
      console.error(`❌ Failed to generate login code for user ${user.id}`);
      return false;
    }

    // Generate wishlist URL
    const wishlistUrl = generateWishlistUrl(loginCode);

    // Send wishlist notification email
    const emailSent = await sendWishlistNotificationEmail(user, wishlistUrl);

    if (!emailSent) {
      console.error(`❌ Failed to send email for user ${user.id}`);
      return false;
    }

    // Set is_sending to false after successful email sending
    wishlistOption.is_sending = false;
    await wishlistOption.save();

    console.log(
      `✅ Wishlist notification sent for ${user.name} (${user.email})`
    );

    return true;
  } catch (error) {
    console.error(
      `❌ Error processing wishlist notification for user ${user.id}:`,
      error.message
    );
    return false;
  }
}

/**
 * Main function to send wishlist notifications based on user scheduling preferences
 */
async function sendWishlistNotifications() {
  try {
    console.log('⏰ Checking scheduled wishlist notifications...');

    const { currentDay, currentHour } = getCurrentTimeInfo();
    const scheduledNotifications = await getScheduledWishlistNotifications(
      currentDay,
      currentHour
    );

    console.log(
      `📋 Found ${scheduledNotifications.length} scheduled wishlist notifications for ${currentDay} at ${currentHour}:00`
    );

    if (scheduledNotifications.length === 0) {
      console.log('✅ No scheduled wishlist notifications for current time');
      return;
    }

    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each scheduled notification
    for (const wishlistOption of scheduledNotifications) {
      const success = await processSingleWishlistNotification(wishlistOption);

      if (success === true) {
        processedCount++;
      } else if (success === false) {
        errorCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(
      `🎯 Wishlist notification process complete: ${processedCount} processed, ${errorCount} errors${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`
    );
  } catch (error) {
    console.error('❌ Error in scheduled wishlist notification check:', error);
  }
}

/**
 * Schedule the cron job to run every hour (only if enabled via environment variable)
 */
let wishlistSendingJob = null;

// Check if wishlist sending cron is enabled
const isWishlistSendingCronEnabled =
  process.env.ENABLE_WISHLIST_SENDING_CRON === 'true';

if (isWishlistSendingCronEnabled) {
  wishlistSendingJob = cron.schedule(
    CRON_CONFIG.SCHEDULE,
    () => {
      console.log('📋 Running scheduled wishlist notifications check...');
      sendWishlistNotifications();
    },
    {
      scheduled: true,
      timezone: CRON_CONFIG.TIMEZONE,
    }
  );

  console.log(
    `🚀 Wishlist sending cron job scheduled (${CRON_CONFIG.SCHEDULE} in ${CRON_CONFIG.TIMEZONE})`
  );

  // Run initial check on startup
  sendWishlistNotifications().catch((error) => {
    console.error(
      '❌ Error in initial wishlist notifications check:',
      error.message
    );
  });
} else {
  console.log(
    '⏸️ Wishlist sending cron job is disabled (ENABLE_WISHLIST_SENDING_CRON not set to true)'
  );
}

/**
 * Export for testing or manual triggering
 */
module.exports = {
  sendWishlistNotifications,
  wishlistSendingJob,
  // Export utility functions for testing
  getCurrentTimeInfo,
  getScheduledWishlistNotifications,
  processSingleWishlistNotification,
  isTimeToSend,
  convertTimeToServerTimezone,
  generateWishlistUrl,
  sendWishlistNotificationEmail,
  getRandomSender,
};
