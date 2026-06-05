const formData = require('form-data');
const Mailgun = require('mailgun.js');
const reservationEmailTemplate = require('../templates/emails/reservationEmail');
const {
  counterOfferEmailTemplate,
} = require('../templates/emails/counterOfferEmail');
const counterTestEmailTemplate = require('../templates/emails/counter-test');
const { welcomeEmailTemplate } = require('../templates/emails/welcomeEmail');
const {
  welcomeCompleteEmailTemplate,
} = require('../templates/emails/welcomeCompleteEmail');
const autoMarketNewsletterTemplate = require('../templates/emails/newsLetterEmail');
const counterOfferRejectedEmailTemplate = require('../templates/emails/counterOfferRejectedEmail');
const autoMarketTemplate = require('../templates/emails/automarket-template');
const {
  passwordResetEmailTemplate,
} = require('../templates/emails/passwordResetEmail');
const {
  getStageEmailTemplate,
} = require('../templates/emails/stageEmailService');
const {
  wishlistNotificationEmailCleanTemplate,
} = require('../templates/emails/wishlistNotificationEmailClean');
const Newsletter = require('../models/Newsletter');
const NewsletterContact = require('../models/NewsletterContact');
const WeeklyReportEmail = require('../models/WeeklyReportEmail');

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

// Email template mapping
const emailTemplates = {
  reservation: {
    template: reservationEmailTemplate,
    getSubject: () => 'Car Listing Reserved',
  },
  counterOffer: {
    template: (data) => counterOfferEmailTemplate(data).body,
    getSubject: (data) => counterOfferEmailTemplate(data).subject,
  },
  counterTest: {
    template: counterTestEmailTemplate,
    getSubject: () => 'Counter Test',
  },
  welcome: {
    template: (data) => welcomeEmailTemplate(data).body,
    getSubject: (data) => welcomeEmailTemplate(data).subject,
  },
  welcomeComplete: {
    template: (data) => welcomeCompleteEmailTemplate(data).body,
    getSubject: (data) => welcomeCompleteEmailTemplate(data).subject,
  },
  newsletter: {
    template: (data) => autoMarketNewsletterTemplate(data).body,
    getSubject: (data) => autoMarketNewsletterTemplate(data).subject,
  },
  counterOfferRejected: {
    template: counterOfferRejectedEmailTemplate,
    getSubject: (data) =>
      `Counter Offer Rejected - ${data.vehicleBrand} ${data.vehicleModel}`,
  },
  contact_form: {
    template: (data) => data.emailBody,
    getSubject: (data) => data.emailSubject,
  },
  wishlistNotification: {
    template: (data) => wishlistNotificationEmailCleanTemplate(data).body,
    getSubject: (data) => wishlistNotificationEmailCleanTemplate(data).subject,
  },
};

const emailService = {
  /**
   * Send email using specified template with tracking
   * @param {string} emailType - Type of email ('reservation', 'counterOffer', 'welcome', 'welcomeComplete')
   * @param {string} recipientEmail - Recipient's email address
   * @param {Object} templateData - Data to pass to the email template
   * @param {string} senderEmail - Optional sender email address (defaults to process.env.SENDER_EMAIL)
   * @returns {Promise} - Email send response
   */
  async sendEmail(emailType, recipientEmail, templateData, senderEmail = null) {
    try {
      const emailConfig = emailTemplates[emailType];

      if (!emailConfig) {
        throw new Error(`Unknown email type: ${emailType}`);
      }

      const emailHtml = emailConfig.template(templateData);
      const subject = emailConfig.getSubject(templateData);

      // Prepare email data with enhanced tracking
      const emailData = {
        from: senderEmail || process.env.SENDER_EMAIL,
        to: recipientEmail,
        subject: subject,
        html: emailHtml,
        'o:tracking': 'yes',
        'o:tracking-opens': 'yes',
        'o:tracking-clicks': 'no',
        'v:email_type': emailType,
        'v:template_used': emailType,
      };

      // Add additional custom variables for newsletter emails
      if (emailType === 'newsletter' && templateData) {
        if (templateData.newsletter_id) {
          emailData['v:newsletter_id'] = templateData.newsletter_id.toString();
        }
        if (templateData.contactId) {
          emailData['v:contact_id'] = templateData.contactId.toString();
        }
        if (templateData.country_id) {
          emailData['v:country_id'] = templateData.country_id.toString();
        }
        emailData['v:email_type'] = 'newsletter';

        console.log('📧 Newsletter email data with tracking variables:', {
          to: recipientEmail,
          subject: subject,
          newsletter_id: templateData.newsletter_id,
          contact_id: templateData.contactId,
          country_id: templateData.country_id,
          email_type: 'newsletter',
        });
      }

      const response = await mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        emailData
      );

      console.log(`${emailType} email sent successfully:`, response);
      return response;
    } catch (error) {
      console.error(`Error sending ${emailType} email:`, error);
      throw error;
    }
  },

  /**
   * Send stage-based email using stage email templates with tracking
   * @param {string} stageName - Name of the stage (e.g., 'Reserved', 'Purchased', etc.)
   * @param {string} recipientEmail - Recipient's email address
   * @param {Object} data - Data to pass to the stage email template
   * @param {string} language - Language code (e.g., 'en', 'nl', 'fr', 'it', 'de')
   * @param {Object} listingDetails - Listing details object
   * @param {Object} options - Additional options including attachments
   * @returns {Promise} - Email send response
   */
  async sendStageEmail(
    stageName,
    recipientEmail,
    data,
    language = 'en',
    listingDetails,
    options = {}
  ) {
    try {
      console.log(
        `Attempting to send stage email '${stageName}' to ${recipientEmail}`
      );
      console.log('Mailgun domain:', process.env.MAILGUN_DOMAIN);
      console.log('Sender email:', process.env.SENDER_EMAIL);

      const emailContent = getStageEmailTemplate(
        stageName,
        data,
        language,
        listingDetails
      );

      console.log('Email content generated successfully');
      console.log('Subject:', emailContent.subject);

      // Prepare email data with tracking
      const emailData = {
        from: process.env.SENDER_EMAIL,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.body,
        'o:tracking': 'yes',
        'o:tracking-opens': 'yes',
        'o:tracking-clicks': 'no',
      };

      // Add attachments if provided
      if (options.attachments && Array.isArray(options.attachments)) {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');

        // Process attachments one by one
        for (let i = 0; i < options.attachments.length; i++) {
          const attachment = options.attachments[i];
          if (attachment.filename && attachment.data) {
            try {
              // Create a temporary file for the attachment
              const tempDir = os.tmpdir();
              const tempFileName = `invoice_${Date.now()}_${i}_${attachment.filename}`;
              const tempFilePath = path.join(tempDir, tempFileName);

              // Write buffer to temporary file
              fs.writeFileSync(tempFilePath, attachment.data);

              // Add attachment using file path
              emailData[`attachment[${i}]`] = fs.createReadStream(tempFilePath);

              // Store temp file path for cleanup later
              if (!emailData._tempFiles) emailData._tempFiles = [];
              emailData._tempFiles.push(tempFilePath);
            } catch (fileError) {
              console.error('Error preparing attachment:', fileError);
            }
          }
        }
      }

      const response = await mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        emailData
      );

      // Clean up temporary files
      if (emailData._tempFiles) {
        const fs = require('fs');
        emailData._tempFiles.forEach((tempFilePath) => {
          try {
            fs.unlinkSync(tempFilePath);
            console.log(`Cleaned up temp file: ${tempFilePath}`);
          } catch (cleanupError) {
            console.error(
              `Error cleaning up temp file ${tempFilePath}:`,
              cleanupError
            );
          }
        });
      }

      console.log(
        `Stage email '${stageName}' sent successfully to ${recipientEmail}:`,
        response
      );
      return response;
    } catch (error) {
      // Clean up temporary files even if email sending fails
      if (emailData && emailData._tempFiles) {
        const fs = require('fs');
        emailData._tempFiles.forEach((tempFilePath) => {
          try {
            fs.unlinkSync(tempFilePath);
            console.log(`Cleaned up temp file after error: ${tempFilePath}`);
          } catch (cleanupError) {
            console.error(
              `Error cleaning up temp file ${tempFilePath}:`,
              cleanupError
            );
          }
        });
      }

      console.error(
        `Error sending stage email '${stageName}' to ${recipientEmail}:`,
        error
      );
      throw error;
    }
  },

  // Convenience methods for backward compatibility
  async sendReservationEmail(userEmail, userName, listingDetails) {
    return this.sendEmail('reservation', userEmail, {
      userName,
      listingDetails,
    });
  },

  async sendCounterOfferEmail(
    dealerEmail,
    dealerName,
    listingDetails,
    offer,
    counterOffer,
    offerId,
    language = 'en'
  ) {
    return this.sendEmail('counterOffer', dealerEmail, {
      dealerName,
      listingDetails,
      offer,
      counterOffer,
      offerId,
      language,
    });
  },

  async sendCounterTestEmail(dealerEmail, dealerName, listingDetails) {
    return this.sendEmail('counterTest', dealerEmail, {
      dealerName,
      listingDetails,
    });
  },

  async sendWelcomeEmail(
    dealerEmail,
    dealerName,
    companyName,
    language = 'en',
    isScrapedDealer = false
  ) {
    return this.sendEmail('welcome', dealerEmail, {
      dealerName,
      companyName,
      email: dealerEmail,
      language,
      isScrapedDealer,
    });
  },

  async sendWelcomeCompleteEmail(
    dealerEmail,
    dealerName,
    companyName,
    language = 'en'
  ) {
    return this.sendEmail('welcomeComplete', dealerEmail, {
      dealerName,
      companyName,
      email: dealerEmail,
      language,
    });
  },

  async sendNewsletterEmail(recipientEmail, templateData) {
    return this.sendEmail('newsletter', recipientEmail, templateData);
  },

  async sendCounterOfferRejectedEmail(recipientEmail, templateData) {
    return this.sendEmail('counterOfferRejected', recipientEmail, templateData);
  },

  async sendPasswordResetEmail(
    recipientEmail,
    userName,
    resetCode,
    language = 'en'
  ) {
    try {
      const emailHtml = passwordResetEmailTemplate({
        userName,
        resetCode,
        language,
      });

      // Get subject from translations
      const translations = {
        en: 'Password Reset Request - Car Sales Platform',
        nl: 'Wachtwoord Reset Verzoek - Car Sales Platform',
        fr: 'Demande de Réinitialisation de Mot de Passe - Car Sales Platform',
        it: 'Richiesta di Reset Password - Car Sales Platform',
        de: 'Passwort-Reset-Anfrage - Car Sales Platform',
      };

      const subject = translations[language] || translations.en;

      // Prepare email data with tracking
      const emailData = {
        from: process.env.SENDER_EMAIL,
        to: recipientEmail,
        subject: subject,
        html: emailHtml,
        'o:tracking': 'yes',
        'o:tracking-opens': 'yes',
        'o:tracking-clicks': 'no',
      };

      const response = await mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        emailData
      );

      console.log(
        `Password reset email sent successfully to ${recipientEmail}:`,
        response
      );
      return response;
    } catch (error) {
      console.error(
        `Error sending password reset email to ${recipientEmail}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Send weekly report email to users with tracking
   * @param {string} recipientEmail - Recipient's email address
   * @param {Object} emailData - Data for the weekly report email
   * @param {string} language - Language code (e.g., 'en', 'nl', 'fr', 'it', 'de')
   * @returns {Promise} - Email send response
   */
  async sendWeeklyReportEmail(recipientEmail, emailData, language = 'en') {
    try {
      const newsletter_id = 1; // Fixed newsletter ID for Weekly Dealer Report

      // Extract user_id from emailData
      const user_id = emailData.user_id;
      if (!user_id) {
        throw new Error(
          'user_id is required in emailData for weekly report emails'
        );
      }

      // Calculate week information
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      weekEnd.setHours(23, 59, 59, 999);

      // Get week number and year
      const weekNumber = Math.ceil(
        (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const year = now.getFullYear();

      // Create WeeklyReportEmail record first to get the ID
      // Generate a unique temporary message ID to avoid unique constraint violations
      const tempMessageId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const weeklyReportRecord = await WeeklyReportEmail.create({
        user_id: user_id,
        recipient_email: recipientEmail,
        mailgun_message_id: tempMessageId, // Will be updated after sending
        week_start_date: weekStart,
        week_end_date: weekEnd,
        week_number: weekNumber,
        year: year,
        language: language,
        sent_at: new Date(),
      });

      console.log(
        `📊 Weekly Report Email record created with ID: ${weeklyReportRecord.id}`
      );

      // Add weekly report email ID to emailData
      const emailDataWithReportId = {
        ...emailData,
        weeklyReportEmailId: weeklyReportRecord.id,
      };

      // Reuse the stage-based template system for Weekly Dealer Report
      const emailContent = getStageEmailTemplate(
        'Weekly Dealer Report',
        emailDataWithReportId,
        language,
        null, // listingDetails
        emailData.loginCode // Pass login code as additional parameter
      );

      // Prepare email data with tracking
      const emailDataForMailgun = {
        from: process.env.SENDER_EMAIL,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.body,
        'o:tracking': 'yes',
        'o:tracking-opens': 'yes',
        'o:tracking-clicks': 'no',
        'v:newsletter_id': JSON.stringify(newsletter_id),
        'v:email_type': JSON.stringify('weekly_report'),
        'v:stage_name': JSON.stringify('Weekly Dealer Report'),
        'v:test': JSON.stringify('test'),
      };

      // Debug: Log the email data being sent
      console.log('📧 Sending Weekly Report email with data:', {
        to: recipientEmail,
        subject: emailContent.subject,
        newsletter_id: JSON.stringify(newsletter_id),
        email_type: JSON.stringify('weekly_report'),
        stage_name: JSON.stringify('Weekly Dealer Report'),
        test: JSON.stringify('test'),
      });

      const response = await mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        emailDataForMailgun
      );

      // Extract and log the Mailgun message ID
      const messageId = response.id || response.data?.id;
      console.log(
        `Weekly Dealer Report email sent successfully to ${recipientEmail}:`,
        response
      );
      console.log(`📧 Mailgun Message ID: ${messageId}`);

      // Clean the message ID by removing angle brackets if present
      const cleanMessageId = messageId
        ? messageId.replace(/^<|>$/g, '')
        : messageId;
      console.log(`📧 Cleaned Mailgun Message ID: ${cleanMessageId}`);

      // Update WeeklyReportEmail record with the actual mailgun message ID
      await weeklyReportRecord.update({
        mailgun_message_id: cleanMessageId,
      });

      console.log(
        `📊 Weekly Report Email record updated with Mailgun ID: ${cleanMessageId}`
      );
      console.log(
        `📅 Week: ${weekNumber}/${year} (${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]})`
      );

      return response;
    } catch (error) {
      console.error(
        `Error sending Weekly Dealer Report email to ${recipientEmail}:`,
        error
      );
      throw error;
    }
  },
};

module.exports = emailService;
