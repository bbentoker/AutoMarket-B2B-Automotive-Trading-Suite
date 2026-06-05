// SECURITY-SANITIZED: Production URLs, credentials, and infrastructure identifiers
// in this project were replaced with fictional AutoMarket placeholders.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
const listingRoutes = require('./src/routes/listingRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const offerRoutes = require('./src/routes/offerRoutes');

const userDashboardRoutes = require('./src/routes/userDashboard');
const blogRoutes = require('./src/routes/blogRoutes');
const axios = require('axios');

const Newsletter = require('./src/models/Newsletter');
const UserActivity = require('./src/models/userActivity');
const Listing = require('./src/models/Listing');
const WeeklyReportEmail = require('./src/models/WeeklyReportEmail');
const WishlistEmail = require('./src/models/WishlistEmail');
const { performPeriodicCleanup } = require('./src/services/scrapingService');

// Import cron jobs
require('./src/cron/followUp');

// Conditionally import expire listings cron based on environment variable
if (process.env.ENABLE_EXPIRE_LISTINGS_CRON === 'true') {
  console.log(
    '******************************************************************'
  );
  console.log('🔧 Expire listings cron enabled');
  console.log(
    '******************************************************************'
  );
  require('./src/cron/expireListings');
}

// Conditionally import weekly report cron based on environment variable
if (process.env.ENABLE_WEEKLY_REPORT_CRON === 'true') {
  console.log(
    '******************************************************************'
  );
  console.log('🔧 Weekly report cron enabled');
  console.log(
    '******************************************************************'
  );
  require('./src/cron/weeklyReport');
}

// Conditionally import wishlist sending cron based on environment variable
if (process.env.ENABLE_WISHLIST_SENDING_CRON === 'true') {
  console.log(
    '******************************************************************'
  );
  console.log('🔧 Wishlist sending cron enabled');
  console.log(
    '******************************************************************'
  );
  require('./src/cron/wishlistSending');
}

// needs fixing , on prod deletes all listings, reason unknown???
// require('./src/cron/validateListingSiteBListings');

// Import model associations
require('./src/models/associations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Configure body parser to handle both JSON and urlencoded data
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Routes , do not change
app.use('/api/listings', listingRoutes);
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offerRoutes);

// User dashboard routes
app.use('/api/dashboard', userDashboardRoutes);
// Blog routes
app.use('/api/blogs', blogRoutes);

app.post('/api/mailgun', async (req, res) => {
  const event = req.body;
  console.log('📧 Mailgun webhook received:', {
    event: event['event-data']?.event,
    timestamp: event['event-data']?.timestamp,
    recipient: event['event-data']?.recipient,
  });

  try {
    const data = event['event-data'];

    if (!data) {
      console.warn('❌ No event data found in webhook');
      return res.sendStatus(400);
    }

    const eventType = data.event;
    const email = data.recipient;
    const timestamp = data.timestamp;
    const messageId = data.message?.headers?.['message-id'];

    // Extract tracking variables
    const newsletterId = data.user_variables?.newsletter_id;
    const emailType = data.user_variables?.email_type;
    const stageName = data.user_variables?.stage_name;
    const testVar = data.user_variables?.test;

    console.log('📊 Event details:', {
      eventType,
      email,
      newsletterId,
      emailType,
      stageName,
      testVar,
      messageId,
      timestamp: new Date(timestamp * 1000).toISOString(),
    });

    // Debug: Log all user variables
    console.log('🔍 All user variables:', data.user_variables);

    // Handle different event types
    switch (eventType) {
      case 'opened':
        await handleEmailOpened(
          newsletterId,
          email,
          timestamp,
          emailType,
          stageName,
          messageId
        );
        break;

      case 'delivered':
        await handleEmailDelivered(newsletterId, email, timestamp, messageId);
        break;

      case 'clicked':
        await handleEmailClicked(newsletterId, email, timestamp, data.url);
        break;

      case 'bounced':
      case 'dropped':
      case 'complained':
        await handleEmailFailed(
          newsletterId,
          email,
          timestamp,
          eventType,
          data.reason
        );
        break;

      default:
        console.log(`📧 Unhandled event type: ${eventType}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error handling Mailgun webhook:', error);
    res.sendStatus(500);
  }
});

// Helper function to handle email opened events
async function handleEmailOpened(
  newsletterId,
  email,
  timestamp,
  emailType,
  stageName,
  messageId
) {
  try {
    console.log(`✅ Email opened by ${email}`);
    console.log(`📧 Email Type: ${emailType}`);
    console.log(`📅 Opened at: ${new Date(timestamp * 1000).toISOString()}`);
    console.log(`📧 Message ID: ${messageId}`);

    // Since Mailgun doesn't always provide email type, check both tables by message ID
    const cleanMessageId = messageId
      ? messageId.replace(/^<|>$/g, '')
      : messageId;

    // Check if it's a weekly report email
    const weeklyReportEmail = await WeeklyReportEmail.findOne({
      where: { mailgun_message_id: cleanMessageId },
    });

    if (weeklyReportEmail) {
      console.log(
        `📊 Found weekly report email with message ID: ${cleanMessageId}`
      );
      await handleWeeklyReportOpened(email, timestamp, messageId);
      return;
    }

    // Check if it's a wishlist email
    const wishlistEmail = await WishlistEmail.findOne({
      where: { mailgun_message_id: cleanMessageId },
    });

    if (wishlistEmail) {
      console.log(`📋 Found wishlist email with message ID: ${cleanMessageId}`);
      await handleWishlistEmailOpened(email, timestamp, messageId);
      return;
    }

    // If emailType is provided in user variables, use the old logic as fallback
    if (emailType === 'weekly_report') {
      await handleWeeklyReportOpened(email, timestamp, messageId);
      return;
    }

    if (emailType === 'wishlistNotification') {
      await handleWishlistEmailOpened(email, timestamp, messageId);
      return;
    }

    // Handle regular newsletter emails
    if (!newsletterId) {
      console.warn(`⚠️ No newsletter ID found for opened email: ${email}`);
      return;
    }

    console.log(`📰 Newsletter ID: ${newsletterId}`);

    // Update newsletter record
    const newsletter = await Newsletter.findOne({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      console.error(`❌ No newsletter found with ID: ${newsletterId}`);
      return;
    }

    // Update newsletter with open tracking
    await Newsletter.update(
      {
        is_opened: true,
        opened_at: new Date(timestamp * 1000),
      },
      { where: { id: newsletterId } }
    );

    // Create user activity record
    if (newsletter.listing_id) {
      const activity = await UserActivity.create({
        listing_id: newsletter.listing_id,
        user_id: newsletter.newsletter_contact_id,
        activity_date: new Date(timestamp * 1000),
        type: `email opened - ${emailType || 'unknown'}`,
        details: JSON.stringify({
          email_type: emailType,
          stage_name: stageName,
          newsletter_id: newsletterId,
          recipient_email: email,
        }),
      });
      console.log(`📊 Activity created with ID: ${activity.id}`);
    }

    console.log(
      `✅ Email open tracking completed for newsletter ID: ${newsletterId}`
    );
  } catch (error) {
    console.error('❌ Error handling email opened event:', error);
  }
}

// Helper function to handle weekly report email opened events
async function handleWeeklyReportOpened(email, timestamp, messageId) {
  try {
    console.log(`📊 Processing weekly report email opened: ${email}`);

    // Clean the message ID by removing angle brackets if present
    const cleanMessageId = messageId
      ? messageId.replace(/^<|>$/g, '')
      : messageId;
    console.log(`📧 Cleaned Message ID: ${cleanMessageId}`);

    // Find the weekly report email record
    const weeklyReportEmail = await WeeklyReportEmail.findOne({
      where: { mailgun_message_id: cleanMessageId },
    });

    if (!weeklyReportEmail) {
      console.warn(
        `⚠️ No weekly report email found with message ID: ${cleanMessageId}`
      );
      return;
    }

    console.log(
      `📊 Found weekly report email record ID: ${weeklyReportEmail.id}`
    );

    // Update the weekly report email record as opened
    await WeeklyReportEmail.update(
      {
        is_opened: true,
        opened_at: new Date(timestamp * 1000),
      },
      { where: { mailgun_message_id: cleanMessageId } }
    );

    console.log(
      `✅ Weekly report email marked as opened for user ${weeklyReportEmail.user_id}`
    );
  } catch (error) {
    console.error('❌ Error handling weekly report email opened event:', error);
  }
}

// Helper function to handle wishlist email opened events
async function handleWishlistEmailOpened(email, timestamp, messageId) {
  try {
    console.log(`📋 Processing wishlist email opened: ${email}`);

    // Clean the message ID by removing angle brackets if present
    const cleanMessageId = messageId
      ? messageId.replace(/^<|>$/g, '')
      : messageId;
    console.log(`📧 Cleaned Message ID: ${cleanMessageId}`);

    // Find the wishlist email record
    const wishlistEmail = await WishlistEmail.findOne({
      where: { mailgun_message_id: cleanMessageId },
    });

    if (!wishlistEmail) {
      console.warn(
        `⚠️ No wishlist email found with message ID: ${cleanMessageId}`
      );
      return;
    }

    console.log(
      `📋 Found wishlist email record ID: ${wishlistEmail.id} for user ${wishlistEmail.user_id}`
    );

    // Update the wishlist email record as opened
    await WishlistEmail.update(
      {
        is_opened: true,
        when_opened: new Date(timestamp * 1000),
      },
      { where: { mailgun_message_id: cleanMessageId } }
    );

    console.log(
      `✅ Wishlist email marked as opened for user ${wishlistEmail.user_id}`
    );
  } catch (error) {
    console.error('❌ Error handling wishlist email opened event:', error);
  }
}

// Helper function to handle email delivered events
async function handleEmailDelivered(newsletterId, email, timestamp, messageId) {
  try {
    if (!newsletterId) {
      console.log(`📧 Email delivered to ${email} (no newsletter ID)`);
      return;
    }

    console.log(`📨 Email delivered to ${email}`);
    console.log(`📰 Newsletter ID: ${newsletterId}`);
    console.log(`📧 Message ID: ${messageId}`);

    // Update newsletter with delivery info
    await Newsletter.update(
      {
        sent_at: new Date(timestamp * 1000),
        mailgun_message_id: messageId,
      },
      { where: { id: newsletterId } }
    );

    console.log(
      `✅ Email delivery tracking completed for newsletter ID: ${newsletterId}`
    );
  } catch (error) {
    console.error('❌ Error handling email delivered event:', error);
  }
}

// Helper function to handle email clicked events
async function handleEmailClicked(newsletterId, email, timestamp, url) {
  try {
    if (!newsletterId) {
      console.log(`🔗 Email clicked by ${email} (no newsletter ID)`);
      return;
    }

    console.log(`🔗 Email clicked by ${email}`);
    console.log(`📰 Newsletter ID: ${newsletterId}`);
    console.log(`🔗 URL: ${url}`);

    // Create user activity for click
    const newsletter = await Newsletter.findOne({
      where: { id: newsletterId },
    });

    if (newsletter && newsletter.listing_id) {
      const activity = await UserActivity.create({
        listing_id: newsletter.listing_id,
        user_id: newsletter.newsletter_contact_id,
        activity_date: new Date(timestamp * 1000),
        type: 'email clicked',
        details: JSON.stringify({
          newsletter_id: newsletterId,
          recipient_email: email,
          clicked_url: url,
        }),
      });
      console.log(`📊 Click activity created with ID: ${activity.id}`);
    }

    console.log(
      `✅ Email click tracking completed for newsletter ID: ${newsletterId}`
    );
  } catch (error) {
    console.error('❌ Error handling email clicked event:', error);
  }
}

// Helper function to handle email failure events
async function handleEmailFailed(
  newsletterId,
  email,
  timestamp,
  failureType,
  reason
) {
  try {
    console.log(`❌ Email ${failureType} for ${email}`);
    console.log(`📰 Newsletter ID: ${newsletterId}`);
    console.log(`📝 Reason: ${reason}`);

    if (newsletterId) {
      // Update newsletter with failure info
      await Newsletter.update(
        {
          opened_at: null, // Reset open tracking
        },
        { where: { id: newsletterId } }
      );

      // Create user activity for failure
      const newsletter = await Newsletter.findOne({
        where: { id: newsletterId },
      });

      if (newsletter && newsletter.listing_id) {
        const activity = await UserActivity.create({
          listing_id: newsletter.listing_id,
          user_id: newsletter.newsletter_contact_id,
          activity_date: new Date(timestamp * 1000),
          type: `email ${failureType}`,
          details: JSON.stringify({
            newsletter_id: newsletterId,
            recipient_email: email,
            failure_type: failureType,
            reason: reason,
          }),
        });
        console.log(`📊 Failure activity created with ID: ${activity.id}`);
      }
    }

    console.log(`✅ Email failure tracking completed`);
  } catch (error) {
    console.error('❌ Error handling email failure event:', error);
  }
}

testConnection();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Car Sales Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start periodic cleanup for Chrome processes (every 10 minutes)
  if (process.env.NODE_ENV !== 'dev') {
    console.log('🧹 Starting periodic Chrome cleanup service...');
    setInterval(
      async () => {
        try {
          await performPeriodicCleanup();
        } catch (error) {
          console.error('❌ Error in periodic cleanup:', error);
        }
      },
      10 * 60 * 1000
    ); // Every 10 minutes
  }
});
// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
