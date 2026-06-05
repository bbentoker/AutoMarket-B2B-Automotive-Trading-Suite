const cron = require('node-cron');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const { Sequelize } = require('sequelize');
const Newsletter = require('../models/Newsletter');
const NewsletterContact = require('../models/NewsletterContact');
const Listing = require('../models/Listing');
const ListingPhotos = require('../models/ListingPhotos');
const Country = require('../models/Country');
require('../models/associations'); // Import model associations
const autoMarketNewsletterTemplate = require('../templates/emails/newsLetterEmail');
const Bottleneck = require('bottleneck');
const emailRateLimiter = require('../utils/rateLimiter');

// Validate Mailgun API key
const MAILGUN_KEY = process.env.MAILGUN_KEY;
if (!MAILGUN_KEY) {
  console.error('❌ MAILGUN_KEY environment variable is not set');
  process.exit(1);
}

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: MAILGUN_KEY,
  url: 'https://api.eu.mailgun.net', // Use EU region
});

// Configuration for batch processing - configurable via environment variables
const BATCH_SIZE = parseInt(process.env.NEWSLETTER_BATCH_SIZE) || 10; // Number of emails to send in parallel
const BATCH_DELAY = parseInt(process.env.NEWSLETTER_BATCH_DELAY) || 1000; // Delay between batches (milliseconds)
const MAX_RETRIES = parseInt(process.env.NEWSLETTER_MAX_RETRIES) || 3; // Maximum retry attempts
const RETRY_DELAY = parseInt(process.env.NEWSLETTER_RETRY_DELAY) || 2000; // Delay before retry (milliseconds)

// Debug mode configuration
const IS_DEBUG = process.env.DEBUG === 'true';
const DEBUG_EMAILS = ['info@automarket.example.com', 'test@example.com'];
const DEBUG_LANGUAGES = ['en', 'de', 'fr', 'it', 'nl']; // All supported languages

console.log(`📧 Newsletter configuration:
  - Batch size: ${BATCH_SIZE} emails per batch
  - Batch delay: ${BATCH_DELAY}ms between batches
  - Max retries: ${MAX_RETRIES}
  - Retry delay: ${RETRY_DELAY}ms
  - Debug mode: ${IS_DEBUG ? 'ENABLED' : 'DISABLED'}`);

if (IS_DEBUG) {
  console.log(`🐛 DEBUG MODE ACTIVE:
  - Emails will only be sent to: ${DEBUG_EMAILS.join(', ')}
  - Testing all languages: ${DEBUG_LANGUAGES.join(', ')}`);
}

async function getListingsForNewsletter(listingIDs) {
  if (listingIDs.length > 0) {
    const listings = await Listing.findAll({
      where: {
        id: listingIDs,
      },
      attributes: [
        'id',
        'brand_name',
        'model',
        'first_registration',
        'listing_price',
        'km_stand',
        'fuel_type',
        'transmission_type',
        'vat_or_margin',
        'expiration',
        'created_at',
        [
          Sequelize.literal(`
            EXTRACT(EPOCH FROM ("Listing"."created_at" + (INTERVAL '1 hour' * "Listing"."expiration") - NOW())) / 3600
          `),
          'remaining_hours',
        ],
      ],
      include: [
        {
          model: ListingPhotos,
          as: 'photos',
          required: false,
        },
      ],
    });

    // Transform the data into the desired format
    const transformedListings = listings.map((listing) => {
      const data = listing.dataValues;
      let firstImage = null;
      if (data.photos && data.photos.length > 0) {
        // Sort photos by id ascending and pick the first
        const sortedPhotos = data.photos.slice().sort((a, b) => a.id - b.id);
        firstImage = sortedPhotos[0].url;
      }
      const remainingHours = data.remaining_hours
        ? Math.max(0, Math.round(data.remaining_hours))
        : 0;

      return {
        id: data.id,
        make: data.brand_name,
        model: data.model,
        year: data.first_registration
          ? new Date(data.first_registration).getFullYear()
          : null,
        price: data.listing_price ? parseFloat(data.listing_price) : 0,
        image: firstImage,
        mileage: data.km_stand ? `${data.km_stand.toLocaleString()} km` : null,
        fuelType: data.fuel_type,
        transmission: data.transmission_type,
        vat_or_margin: data.vat_or_margin,
        brand_name: data.brand_name,
        remainingTime:
          remainingHours > 0 ? `${remainingHours} hours left` : 'Expired',
      };
    });
    return transformedListings;
  } else {
    console.log('no listing ids provided');
    return [];
  }
}

// Helper function to send a single email
async function sendSingleNewsletterEmail(contact, listings, retryCount = 0) {
  try {
    const contactData = contact.dataValues;

    // Create newsletter record for tracking
    const newsletter = await Newsletter.create({
      listing_id: listings[0]?.id || null,
      newsletter_contact_id: contact.id,
      email_type: 'newsletter',
      recipient_email: contactData.email,
      sent_at: new Date(),
    });

    // Prepare personalized email content using the template
    const emailContent = autoMarketNewsletterTemplate({
      userName: contactData.name || 'there',
      dealerName: contactData.company || 'your dealership',
      carListings: listings,
      newsletter_id: newsletter.id,
      contactId: contact.id,
      country_id: contactData.country_id,
      countryCode: contact.country?.code || null,
    });

    const senderName = process.env.SENDER_NAME || 'AutoMarket';
    const senderEmail = process.env.SENDER_EMAIL;

    if (!senderEmail) {
      throw new Error('SENDER_EMAIL environment variable is not set');
    }

    const unsubscribeUrl = `${process.env.APP_URL || 'https://browse.automarket.example.com'}/unsubscribe`;

    // Prepare email data for Mailgun
    const emailData = {
      from: `${senderName} <${senderEmail}>`,
      to: contactData.email,
      subject: emailContent.subject,
      html: emailContent.body,
      'h:X-Newsletter-ID': newsletter.id.toString(),
      'h:List-Unsubscribe': `<${unsubscribeUrl}>`,
      'h:List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'h:Precedence': 'bulk',
      'h:X-Auto-Response-Suppress': 'OOF, AutoReply',
      'o:tracking': 'yes',
      'o:tracking-opens': 'yes',
      'o:tracking-clicks': 'no',
      'v:newsletter_id': newsletter.id.toString(),
      'v:email_type': 'newsletter',
      'v:country_id': contactData.country_id?.toString() || 'unknown',
    };
    try {
      // Send email via Mailgun
      const mailResponse = await mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        emailData
      );

      // Check for error in response
      if (mailResponse.error) {
        // If error is an object, serialize it for better logging
        const errorDetail =
          typeof mailResponse.error === 'object'
            ? JSON.stringify(mailResponse.error)
            : mailResponse.error;
        throw new Error(`Mailgun API Error: ${errorDetail}`);
      }

      // Get email ID from the new response structure
      const emailId = mailResponse.data?.id;
      if (!emailId) {
        throw new Error(
          `No email ID in Mailgun API response: ${JSON.stringify(mailResponse)}`
        );
      }

      return {
        success: true,
        contact: contactData,
        response: mailResponse,
      };
    } catch (mailgunError) {
      // Log detailed Mailgun-specific errors, including full error object
      console.error('❌ Mailgun API Error:', {
        recipient: contactData.email,
        name: mailgunError.name,
        message: mailgunError.message,
        code: mailgunError.statusCode,
        data: mailgunError.data,
        apiResponse: mailgunError.response,
        attempt: retryCount + 1,
        fullError: mailgunError, // Add full error object for debugging
      });
      throw mailgunError;
    }
  } catch (error) {
    // Log all errors with full context, including full error object
    console.error('❌ Newsletter sending failed:', {
      recipient: contact.email,
      error:
        typeof error === 'object'
          ? JSON.stringify(error, Object.getOwnPropertyNames(error))
          : error,
      stack: error.stack,
      name: error.name,
      code: error.statusCode,
      data: error.data,
      attempt: retryCount + 1,
      totalAttempts: MAX_RETRIES,
      fullError: error, // Add full error object for debugging
    });

    // Retry logic for failed emails
    if (retryCount < MAX_RETRIES) {
      return sendSingleNewsletterEmail(contact, listings, retryCount + 1);
    }

    return {
      success: false,
      contact: contact.dataValues,
      error:
        typeof error === 'object'
          ? JSON.stringify(error, Object.getOwnPropertyNames(error))
          : error,
    };
  }
}

// Helper function to send a single email with delay
async function sendSingleNewsletterEmailWithDelay(
  contact,
  listings,
  retryCount = 0,
  delayMs = 0
) {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return sendSingleNewsletterEmail(contact, listings, retryCount);
}

// Helper function to process a batch of emails with per-email delay
async function processBatch(contacts, listings, batchNumber) {
  // Calculate per-email delay to respect rate limit
  // If batch size > 2, ensure at least 1000ms/2 = 500ms between emails
  const perEmailDelay = Math.max(Math.ceil(1000 / BATCH_SIZE), 500);

  const results = [];
  for (let i = 0; i < contacts.length; i++) {
    // Stagger each email send to avoid exceeding rate limit
    // (first email: 0ms, second: perEmailDelay, ...)
    // This is in addition to the batch delay between batches
    // eslint-disable-next-line no-await-in-loop
    const result = await sendSingleNewsletterEmailWithDelay(
      contacts[i],
      listings,
      0,
      i === 0 ? 0 : perEmailDelay
    );
    results.push(result);
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  // Only log if there are failures
  if (failureCount > 0) {
    console.error(`❌ Batch ${batchNumber} completed with errors:`, {
      total: results.length,
      successful: successCount,
      failed: failureCount,
      failureRate: `${((failureCount / results.length) * 100).toFixed(1)}%`,
    });
  }

  return {
    batchNumber,
    total: results.length,
    successCount,
    failureCount,
    results,
  };
}

// Create a limiter: max 2 batch requests per second
const limiter = new Bottleneck({
  minTime: 500, // 2 per second
  maxConcurrent: 2, // Optional: limit concurrent requests
});

// Rate-limited email sending function
async function sendSingleEmailWithRateLimit(contact, listings) {
  const contactData = contact.dataValues;
  const unsubscribeUrl = `${process.env.APP_URL || 'https://browse.automarket.example.com'}/unsubscribe`;

  // Create the email sending function
  const emailFunction = async (context) => {
    let newsletter;

    if (IS_DEBUG) {
      // In debug mode, don't create database records
      newsletter = {
        id: `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      console.log(
        `🐛 DEBUG: Sending rate-limited email to ${context.email} (${context.name})`
      );
    } else {
      // Create newsletter record for tracking
      newsletter = await Newsletter.create({
        listing_id: context.listings[0]?.id || null,
        newsletter_contact_id: context.contactId,
        email_type: 'newsletter',
        recipient_email: context.email,
        sent_at: new Date(),
      });
    }

    // Use enhanced email service for tracking
    const emailService = require('../services/emailService');

    const response = await emailService.sendEmail(
      'newsletter',
      context.email,
      {
        userName: context.name || 'there',
        dealerName: context.company || 'your dealership',
        carListings: context.listings,
        newsletter_id: newsletter.id,
        contactId: context.contactId,
        country_id: context.country_id,
        countryCode: context.countryCode || null,
        unsubscribeUrl: context.unsubscribeUrl,
      }
    );

    // Extract and update the Newsletter record with Mailgun message ID (skip in debug mode)
    const messageId = response.id || response.data?.id;
    if (messageId && !IS_DEBUG) {
      const cleanMessageId = messageId.replace(/^<|>$/g, '');
      await newsletter.update({
        mailgun_message_id: cleanMessageId,
      });
      console.log(
        `📧 Newsletter ${newsletter.id} updated with Mailgun ID: ${cleanMessageId}`
      );
    } else if (messageId && IS_DEBUG) {
      console.log(
        `🐛 DEBUG: Would update newsletter ${newsletter.id} with Mailgun ID: ${messageId}`
      );
    }

    console.log('Newsletter email response:', response);
    return {
      success: true,
      contact: context,
      response,
      newsletter_id: newsletter.id,
    };
  };

  // Queue the email through the rate limiter
  return await emailRateLimiter.queueEmail(emailFunction, {
    email: contactData.email,
    name: contactData.name,
    company: contactData.company,
    contactId: contact.id,
    country_id: contactData.country_id,
    countryCode: contact.country?.code,
    listings,
    unsubscribeUrl,
  });
}

// Helper function to send a batch of emails with rate limiting
async function sendNewsletterBatch(batchContacts, listings) {
  const results = [];
  
  console.log(`📧 Processing batch of ${batchContacts.length} emails with rate limiting`);
  console.log(`⏱️  Rate limiter status:`, emailRateLimiter.getStatus());
  
  // Process each email through the rate limiter
  for (const contact of batchContacts) {
    try {
      const result = await sendSingleEmailWithRateLimit(contact, listings);
      results.push(result);
    } catch (error) {
      console.error(
        `❌ Failed to send email to ${contact.dataValues.email}:`,
        error.message || error
      );
      results.push({
        success: false,
        contact: contact.dataValues,
        error: error.message || error,
      });
    }
  }

  return {
    data: results,
    success: results.every((r) => r.success),
    total: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  };
}

// Function to create debug contacts for testing all languages using real newsletter contact data
async function createDebugContacts() {
  const debugContacts = [];

  try {
    // Get the real newsletter contact for @gmail.com
    const realContact = await NewsletterContact.findOne({
      where: { email: 'test@example.com' },
      include: [
        {
          model: Country,
          as: 'country',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    // Create test contacts for each language and each debug email
    DEBUG_LANGUAGES.forEach((langCode, langIndex) => {
      DEBUG_EMAILS.forEach((email, emailIndex) => {
        // Map language code to country info for testing
        const langToCountry = {
          en: { id: 238, name: 'United States', code: 'US' },
          de: { id: 83, name: 'Germany', code: 'DE' },
          fr: { id: 76, name: 'France', code: 'FR' },
          it: { id: 110, name: 'Italy', code: 'IT' },
          nl: { id: 155, name: 'Netherlands', code: 'NL' },
        };

        const countryInfo = langToCountry[langCode] || langToCountry['en'];

        // Use real contact data if available, otherwise fallback to debug text
        let contactName, companyName;
        if (realContact && email === 'test@example.com') {
          contactName = realContact.dataValues.name || 'Test User';
          companyName = realContact.dataValues.company || 'Test Company';
        } else {
          contactName = `Debug User (${langCode.toUpperCase()})`;
          companyName = `Test Company (${langCode.toUpperCase()})`;
        }

        debugContacts.push({
          id: `debug_${langIndex}_${emailIndex}`,
          dataValues: {
            name: contactName,
            company: companyName,
            email: email,
            country_id: countryInfo.id,
          },
          country: {
            id: countryInfo.id,
            name: countryInfo.name,
            code: countryInfo.code,
          },
        });
      });
    });

    return debugContacts;
  } catch (error) {
    console.error('Error creating debug contacts:', error);
    // Return fallback debug contacts if there's an error
    const fallbackContacts = [];
    DEBUG_LANGUAGES.forEach((langCode, langIndex) => {
      DEBUG_EMAILS.forEach((email, emailIndex) => {
        const langToCountry = {
          en: { id: 238, name: 'United States', code: 'US' },
          de: { id: 83, name: 'Germany', code: 'DE' },
          fr: { id: 76, name: 'France', code: 'FR' },
          it: { id: 110, name: 'Italy', code: 'IT' },
          nl: { id: 155, name: 'Netherlands', code: 'NL' },
        };
        const countryInfo = langToCountry[langCode] || langToCountry['en'];

        fallbackContacts.push({
          id: `debug_${langIndex}_${emailIndex}`,
          dataValues: {
            name: `Debug User (${langCode.toUpperCase()})`,
            company: `Test Company (${langCode.toUpperCase()})`,
            email: email,
            country_id: countryInfo.id,
          },
          country: {
            id: countryInfo.id,
            name: countryInfo.name,
            code: countryInfo.code,
          },
        });
      });
    });
    return fallbackContacts;
  }
}

// Optimized newsletter sending function with batch processing using batch API
async function sendNewsletterEmails(country_id = 230, listingIDs = []) {
  const startTime = Date.now();
  try {
    let contacts;

    if (IS_DEBUG) {
      console.log('🐛 DEBUG MODE: Creating test contacts for all languages');
      contacts = await createDebugContacts();
    } else {
      // Get all newsletter contacts with their country information
      contacts = await NewsletterContact.findAll({
        where: { country_id: country_id },
        include: [
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'code'],
          },
        ],
      });
    }
    // Get active listings
    const listings = await getListingsForNewsletter(listingIDs);
    if (!listings.length || !contacts.length) {
      return {
        success: false,
        message: !listings.length
          ? 'No active listings found'
          : 'No contacts found',
        stats: { total: 0, sent: 0, failed: 0 },
      };
    }
    // Split contacts into batches of 100
    const batches = [];
    for (let i = 0; i < contacts.length; i += 100) {
      batches.push(contacts.slice(i, i + 100));
    }
    let totalSent = 0;
    let totalFailed = 0;
    
    console.log(`🚀 Starting rate-limited newsletter sending for ${contacts.length} contacts`);
    console.log(`📊 Initial rate limiter status:`, emailRateLimiter.getStatus());
    
    const queueEstimates = emailRateLimiter.getQueueEstimates();
    console.log(`⏱️  Estimated completion time: ${queueEstimates.estimatedCompletionTime}`);
    console.log(`🕐 Estimated hours required: ${queueEstimates.hoursRequired}`);
    
    for (let i = 0; i < batches.length; i++) {
      try {
        console.log(`📦 Processing batch ${i + 1}/${batches.length} with ${batches[i].length} contacts`);
        
        // Remove the bottleneck limiter since we're using our own rate limiter
        const response = await sendNewsletterBatch(batches[i], listings);
        console.log(`✅ Batch ${i + 1} completed:`, {
          successful: response.successful,
          failed: response.failed,
          total: response.total
        });

        totalSent += response.successful;
        totalFailed += response.failed;
        
        // Show updated rate limiter status after each batch
        console.log(`📊 Current rate limiter status:`, emailRateLimiter.getStatus());
      } catch (error) {
        totalFailed += batches[i].length;
        console.error(`❌ Batch ${i + 1} failed:`, error.message || error);
      }
    }
    // Only log final stats if there were any failures
    if (totalFailed > 0) {
      console.error('📊 Newsletter sending completed with errors:', {
        totalContacts: contacts.length,
        successful: totalSent,
        failed: totalFailed,
        failureRate: `${((totalFailed / contacts.length) * 100).toFixed(1)}%`,
        duration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      });
    }
    return {
      success: totalFailed === 0,
      stats: {
        total: contacts.length,
        sent: totalSent,
        failed: totalFailed,
      },
    };
  } catch (error) {
    console.error('❌ Newsletter sending failed:', error);
    return {
      success: false,
      message: error.message,
      stats: { total: 0, sent: 0, failed: 0 },
    };
  }
}

// sendNewsletterEmails();
module.exports = {
  sendNewsletterEmails, // Export for testing or manual triggering
  sendSingleNewsletterEmail, // Export for testing individual emails
  processBatch, // Export for testing batch processing
};
