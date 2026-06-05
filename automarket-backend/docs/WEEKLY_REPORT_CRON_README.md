# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Weekly Report Cron Job

This document describes the weekly report cron job functionality that automatically sends weekly reports to users based on their scheduling preferences.

## Overview

The weekly report system consists of a single cron job that checks for user-specific scheduling preferences and sends reports accordingly.

## Features

### 🕒 Scheduling Options

- **Custom User Scheduling**: Users can set their preferred day and hour for reports
- **Flexible Timing**: Supports any day of the week and any hour (0-23)
- **Hourly Checks**: System checks every hour for matching schedules

### 📊 Report Content

- **Performance Summary**: Cars sold, total revenue, target percentage
- **Suggestions**: User-specific suggestions from the report options
- **Detailed Data**: Full report data from the `calculateReport` service
- **Professional Email Template**: HTML-formatted emails with responsive design

### 🔧 Configuration

- **Timezone**: Europe/Stockholm (configurable)
- **Error Handling**: Graceful error handling with detailed logging
- **Email Service**: Integrated with Mailgun email service

## Cron Job Details

### Weekly Report Sending (`sendWeeklyReports`)

**Schedule**: Every hour at minute 0
**Cron Expression**: `0 * * * *`

**Process**:

1. Get current day and hour
2. Find users with matching `when_to_send` preferences and `is_sending: true`
3. For each matching user:
   - Get their sold cars (adverts where `is_active: false`)
   - Calculate report data using `calculateReport` service
   - Prepare email data with user information
   - Send weekly report email
4. Log results and handle errors gracefully

## Database Integration

### UserReportOptions Model

```javascript
{
  user_id: 42,
  percentage: 11,
  suggestions: [
    { listingsitea_listing_id: 13045, reference_code: '6C5W2' }
  ],
  when_to_send: { day: 'tuesday', hour: '01' },
  is_sending: true
}
```

### Key Fields

- `user_id`: Links to the user (unique constraint)
- `percentage`: Target percentage for reports
- `suggestions`: JSONB array of suggestion objects
- `when_to_send`: JSONB object with `day` and `hour` preferences
- `is_sending`: Boolean flag to enable/disable reports

## Email Template

The weekly report emails include:

- **Header**: Personalized greeting with user and company name
- **Performance Summary**: Visual stats showing cars sold, revenue, and percentage
- **Suggestions Section**: User-specific suggestions (if any)
- **Detailed Report**: Full report data (if available)
- **Footer**: Generation timestamp and branding

## API Integration

### Existing Endpoints

- `POST /api/auth/generate-scraped-dealers-report` - Updates report options
- `POST /api/users/report-options` - Alternative endpoint for report options
- `GET /api/users/report-options/:dealer_id` - Retrieves user report options

### Manual Triggering

```javascript
const { sendWeeklyReports } = require('./src/cron/weeklyReport');

// Manually trigger weekly reports check
await sendWeeklyReports();
```

## Error Handling

### Graceful Error Management

- Individual user errors don't stop the entire process
- Detailed logging for debugging
- Email service errors are caught and logged
- Database errors are handled gracefully

### Logging Examples

```
⏰ Checking scheduled weekly reports...
📅 Found 3 scheduled reports for monday at 09:00
📧 Sending scheduled report to: John Doe (john@example.com)
✅ Scheduled report sent to john@example.com
🎯 Scheduled report process complete: 3 reports sent, 0 errors
```

## Configuration

### Environment Variables

- `SENDER_EMAIL`: Email address for sending reports
- `MAILGUN_KEY`: Mailgun API key for email service
- `MAILGUN_DOMAIN`: Mailgun domain for email service
- `NODE_ENV`: Environment (affects logging and error handling)

### Timezone Configuration

```javascript
{
  scheduled: true,
  timezone: 'Europe/Stockholm', // Configurable timezone
}
```

## Testing

### Test File

- `src/tests/weeklyReport.test.js` - Comprehensive test suite
- Tests the cron function and API endpoints
- Mocks email service to avoid sending actual emails
- Tests error scenarios and edge cases

### Running Tests

```bash
npm test src/tests/weeklyReport.test.js
```

## Monitoring

### Log Messages

- **Start**: `⏰ Checking scheduled weekly reports...`
- **Progress**: `📧 Sending scheduled report to: [name] ([email])`
- **Success**: `✅ Scheduled report sent to [email]`
- **Completion**: `🎯 Scheduled report process complete: [sent] reports sent, [errors] errors`
- **Errors**: `❌ Error sending scheduled report for user [id]: [error]`

### Metrics to Monitor

- Number of users with active report options
- Number of reports sent successfully
- Number of errors encountered
- Email delivery success rate
- Processing time for each report

## Troubleshooting

### Common Issues

1. **No reports being sent**

   - Check if users have `is_sending: true`
   - Verify `when_to_send` format matches current time
   - Check email service configuration
   - Verify timezone settings

2. **Scheduled reports not triggering**

   - Verify `when_to_send` format: `{ day: 'monday', hour: '09' }`
   - Check current timezone vs configured timezone
   - Ensure cron job is running
   - Check if current day/hour matches user preferences

3. **Email delivery failures**
   - Check Mailgun API key and domain configuration
   - Verify sender email address
   - Check email service logs

### Debug Commands

```javascript
// Check current timezone and day/hour
console.log(new Date().toLocaleDateString('en-US', { weekday: 'lowercase' }));
console.log(new Date().getHours().toString().padStart(2, '0'));

// Check user report options
const options = await UserReportOptions.findAll({
  where: {
    is_sending: true,
    when_to_send: {
      [Op.and]: [
        Sequelize.literal(`when_to_send->>'day' = 'monday'`),
        Sequelize.literal(`when_to_send->>'hour' = '09'`),
      ],
    },
  },
});
console.log('Matching scheduled reports:', options.length);
```

## Usage Examples

### Setting Up User Report Options

```javascript
// Via API
POST /api/auth/generate-scraped-dealers-report
{
  "dealer_id": 42,
  "percentage": 11,
  "suggestions": [
    { "listingsitea_listing_id": 13045, "reference_code": "6C5W2" }
  ],
  "when_to_send": { "day": "tuesday", "hour": "01" },
  "is_sending": true
}
```

### Scheduling Options

```javascript
// Monday at 9 AM
when_to_send: { day: 'monday', hour: '09' }

// Tuesday at 1 AM
when_to_send: { day: 'tuesday', hour: '01' }

// Friday at 5 PM
when_to_send: { day: 'friday', hour: '17' }
```

## Future Enhancements

### Potential Improvements

- **Email Templates**: More sophisticated HTML templates
- **Report Customization**: User-configurable report content
- **Analytics**: Track report open rates and engagement
- **Multiple Formats**: PDF reports in addition to emails
- **Advanced Scheduling**: More granular scheduling options (minutes, timezone)
- **Report History**: Store and retrieve past reports
- **Batch Processing**: Process multiple users more efficiently
