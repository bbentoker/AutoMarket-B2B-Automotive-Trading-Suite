# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Resend to Mailgun Migration Summary

## Overview

This document summarizes the migration from Resend to Mailgun email service across the car sales platform.

## Changes Made

### 1. Package Dependencies

- **Removed**: `resend` package
- **Added**: `mailgun.js` and `form-data` packages

### 2. Files Modified

#### Core Email Service (`src/services/emailService.js`)

- Replaced Resend import with Mailgun imports
- Updated email sending methods to use Mailgun API
- Changed from `resend.emails.send()` to `mg.messages.create()`

#### Newsletter Service (`src/cron/sendNewsletters.js`)

- Replaced Resend initialization with Mailgun client setup
- Updated email data structure to use Mailgun format:
  - Headers: `'h:X-Newsletter-ID'` instead of `headers: { 'X-Newsletter-ID': ... }`
  - Tracking: `'o:tracking-opens'` and `'o:tracking-clicks'` instead of `track: { opens: true, clicks: true }`
  - Variables: `'v:newsletter_id'` instead of `tags: [{ name: 'email_type', value: 'newsletter' }]`

#### User Controller (`src/controllers/userController.js`)

- Replaced Resend import with Mailgun imports
- Updated contact form email sending to use Mailgun API

#### Server (`server.js`)

- Removed Resend domain setup code
- Updated webhook endpoint from `/api/resend` to `/api/mailgun`
- Updated webhook event handling for Mailgun format:
  - Event type: `event['event-data'].event` instead of `event.type`
  - Email: `data.recipient` instead of `data.to`
  - Newsletter ID: `data.user_variables?.newsletter_id` instead of header lookup
  - Timestamp: `data.timestamp` instead of `data.created_at`

#### Documentation Files

- Updated `WEEKLY_REPORT_CRON_README.md` to reflect Mailgun integration
- Updated `NEWSLETTER_PERFORMANCE_OPTIMIZATION.md` to reference Mailgun API key

### 3. Environment Variables Required

Replace the following environment variables:

**Old (Resend):**

```
RESEND_KEY=your_resend_api_key
```

**New (Mailgun):**

```
MAILGUN_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

### 4. Webhook Configuration

**Old Resend Webhook URL:**

```
https://your-domain.com/api/resend
```

**New Mailgun Webhook URL:**

```
https://your-domain.com/api/mailgun
```

### 5. Mailgun Setup Requirements

1. **Domain Verification**: Ensure your domain is verified in Mailgun
2. **API Key**: Get your Mailgun API key from the Mailgun dashboard (use MAILGUN_KEY environment variable)
3. **Region Configuration**: The application is configured for the EU region (`api.eu.mailgun.net`)
4. **Webhook Configuration**: Set up webhooks in Mailgun for tracking events
5. **Sender Email**: Ensure your sender email is authorized in Mailgun

### 6. Testing

After migration, test the following functionality:

- Contact form emails
- Newsletter sending
- Email tracking and webhooks
- Weekly report emails
- All stage-based emails

### 7. Benefits of Migration

- **Better Deliverability**: Mailgun has excellent deliverability rates
- **Advanced Analytics**: More detailed email tracking and analytics
- **Rate Limiting**: Better handling of bulk email sending
- **Webhook Reliability**: More reliable webhook delivery
- **Cost Effectiveness**: Often more cost-effective for high-volume sending

## Migration Checklist

- [ ] Update environment variables
- [ ] Configure Mailgun domain and API key
- [ ] Set up Mailgun webhooks
- [ ] Test email sending functionality
- [ ] Verify webhook event handling
- [ ] Update any external documentation
- [ ] Monitor email delivery rates
- [ ] Update any client-side email configuration

## Rollback Plan

If issues arise, the previous Resend implementation can be restored by:

1. Reverting the code changes
2. Reinstalling the `resend` package
3. Restoring the `RESEND_KEY` environment variable
4. Reverting webhook URLs
