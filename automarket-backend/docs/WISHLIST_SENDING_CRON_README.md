# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Wishlist Sending Cron Job Documentation

This document describes the automated wishlist notification system that sends scheduled notifications to users based on their wishlist sending preferences.

## Overview

The Wishlist Sending Cron Job is a scheduled task that:

- Runs every hour to check for scheduled wishlist notifications
- Processes users' wishlist sending preferences with complex scheduling
- Generates login codes for users when notifications are due
- Supports multiple timezones and flexible scheduling options
- Logs all activities for monitoring and debugging

## Features

### ✅ **Flexible Scheduling**

- **Weekly notifications** with specific days
- **Custom time zones** support (converts to server timezone)
- **Hourly precision** for notification timing
- **Multiple days per week** scheduling

### ✅ **Timezone Handling**

- Automatic conversion from user timezone to server timezone (Europe/Stockholm)
- Support for any timezone format
- Fallback handling for invalid timezones

### ✅ **Development Mode Support**

- Restricted user processing in development environment
- Configurable allowed user IDs for testing
- Environment-based enabling/disabling

### ✅ **Login Code Integration**

- Uses existing `loginCodeService` to generate secure tokens
- Automatic cleanup of old login codes
- Error handling for login code generation failures

### ✅ **Email Integration**

- **Multilingual email templates** (English, Italian, German, Dutch, French)
- **Personalized content** with user's first name and company name
- **Professional email design** with AutoMarket branding
- **Automatic language detection** based on user preferences
- **Wishlist URL generation** with secure login tokens

### ✅ **Email Template Features**

- **Professional AutoMarket design** based on reserved template structure
- **Responsive layout** optimized for all devices
- **Clean, modern styling** with proper branding
- **Prominent call-to-action button** linking to personalized wishlist
- **Complete signature** with Camilla Sangin's contact details
- **Multilingual support** with proper localization

## Configuration

### Environment Variables

```bash
# Enable the wishlist sending cron job
ENABLE_WISHLIST_SENDING_CRON=true

# Development mode (optional)
NODE_ENV=dev
```

### Cron Schedule

- **Schedule**: `0 * * * *` (Every hour at minute 0)
- **Timezone**: `Europe/Stockholm`
- **Processing**: Runs continuously when enabled

## Data Structure

### User Wishlist Sending Options Format

Based on your example data:

```json
{
  "id": 1,
  "user_id": 6,
  "when_to_send": {
    "days": ["monday"],
    "time": "09:00",
    "timezone": "Europe/Stockholm",
    "frequency": "weekly"
  },
  "is_sending": true,
  "created_at": "2025-09-09T01:18:36.658+03:00",
  "updated_at": "2025-09-09T01:18:36.658+03:00"
}
```

### Supported Scheduling Options

#### **Days Array**

```json
{
  "days": [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ]
}
```

#### **Time Format**

```json
{
  "time": "09:00" // HH:MM format in 24-hour notation
}
```

#### **Supported Timezones**

```json
{
  "timezone": "Europe/Stockholm", // Default server timezone
  "timezone": "America/New_York", // US Eastern
  "timezone": "Asia/Tokyo", // Japan
  "timezone": "UTC" // Universal time
}
```

#### **Frequency Options**

```json
{
  "frequency": "weekly" // Currently supported
  // Future: "daily", "monthly", "custom"
}
```

## How It Works

### 1. **Hourly Execution**

```javascript
// Cron runs every hour
'0 * * * *'; // At minute 0 of every hour
```

### 2. **Time Matching Logic**

```javascript
// Example: User scheduled for Monday 09:00 in Europe/Stockholm
// Current server time: Monday 09:00 Europe/Stockholm
// Result: Match found, process notification
```

### 3. **Processing Flow**

1. Get current day and hour
2. Fetch all users with `is_sending: true`
3. Filter users whose schedule matches current time
4. Generate login codes for matched users
5. Log notification details
6. Process each user individually

### 4. **Login Code Generation**

```javascript
const loginCodeResult = await loginCodeService.generateCode(userId);
// Returns: { token: "abc123...", code: "123456", ... }
```

## Example Scenarios

### Scenario 1: Weekly Monday Morning Notifications

**User Configuration:**

```json
{
  "user_id": 6,
  "when_to_send": {
    "days": ["monday"],
    "time": "09:00",
    "timezone": "Europe/Stockholm",
    "frequency": "weekly"
  },
  "is_sending": true
}
```

**Execution:**

- Cron checks every Monday at 09:00 Stockholm time
- Generates login code for user ID 6
- Logs notification details

### Scenario 2: Multi-day Notifications with Timezone Conversion

**User Configuration:**

```json
{
  "user_id": 12,
  "when_to_send": {
    "days": ["monday", "wednesday", "friday"],
    "time": "14:00",
    "timezone": "America/New_York",
    "frequency": "weekly"
  },
  "is_sending": true
}
```

**Execution:**

- Converts 14:00 EST to Stockholm time
- Processes on Monday, Wednesday, Friday at converted time
- Handles timezone differences automatically

### Scenario 3: Development Mode Testing

**Configuration:**

```bash
NODE_ENV=dev
ENABLE_WISHLIST_SENDING_CRON=true
```

**Behavior:**

- Only processes users with IDs 6 and 12 (configurable)
- Skips other users with log message
- Full functionality for allowed users

## Logging Output

### Successful Processing

```
⏰ Checking scheduled wishlist notifications...
📅 Current wishlist scheduling time: monday 09
📋 Found 1 scheduled wishlist notifications for monday at 09:00
📧 Processing wishlist notification for: John Doe (john@example.com)
🔐 Generated login code for user 6: abc123def456...
📋 Wishlist notification details:
   User ID: 6
   User Name: John Doe
   Email: john@example.com
   Company: ABC Motors
   Language: en
   Login Code: abc123def456...
   Wishlist URL: https://dashboard.automarket.example.com/wishlist?login_token=abc123def456...
   Schedule: {"days":["monday"],"time":"09:00","timezone":"Europe/Stockholm","frequency":"weekly"}
📧 Wishlist notification email sent to @gmail.com for user John Doe
✅ Wishlist notification processed and email sent for john@example.com
🎯 Wishlist notification process complete: 1 processed, 0 errors
```

### No Scheduled Notifications

```
⏰ Checking scheduled wishlist notifications...
📅 Current wishlist scheduling time: tuesday 10
📋 Found 0 scheduled wishlist notifications for tuesday at 10:00
✅ No scheduled wishlist notifications for current time
```

### Development Mode Filtering

```
📧 Processing wishlist notification for: Jane Smith (jane@example.com)
🔧 [DEV] Skipping user: XYZ Company
🎯 Wishlist notification process complete: 0 processed, 0 errors, 1 skipped
```

### Error Handling

```
❌ Error generating login code for user 123: User not found
❌ Error processing wishlist notification for user 456: Database connection failed
🎯 Wishlist notification process complete: 2 processed, 2 errors
```

## Key Functions

### `sendWishlistNotifications()`

Main function that orchestrates the entire process.

### `getScheduledWishlistNotifications(currentDay, currentHour)`

Fetches and filters users based on current time matching their schedule.

### `isTimeToSend(whenToSend, currentDay, currentHour)`

Complex logic to determine if current time matches user's schedule.

### `convertTimeToServerTimezone(time, timezone)`

Handles timezone conversion from user timezone to server timezone.

### `generateUserLoginCode(userId)`

Integrates with login code service to generate secure tokens.

### `generateWishlistUrl(loginToken)`

Creates the complete wishlist URL with the user's login token.

### `sendWishlistNotificationEmail(user, wishlistUrl)`

Sends personalized multilingual email using the wishlist notification template.

### `processSingleWishlistNotification(wishlistOption)`

Processes individual user notification with full error handling and email sending.

## Error Handling

### Database Errors

- Connection failures are logged and don't stop processing other users
- Invalid user data is handled gracefully

### Login Code Generation Errors

- Failed login code generation is logged but doesn't crash the system
- Users with failed login codes are counted as errors

### Timezone Conversion Errors

- Invalid timezones fall back to original time
- Conversion errors are logged for debugging

### Development Mode Safety

- Prevents accidental processing of production users in development
- Configurable user whitelist for testing

## Monitoring and Debugging

### Log Levels

- **Info**: Normal operation logs (✅, 📋, 🎯)
- **Warning**: Timezone conversion issues (⚠️)
- **Error**: Failed operations (❌)
- **Debug**: Development mode filtering (🔧)

### Metrics Tracked

- Total notifications processed
- Error count
- Skipped count (development mode)
- Processing time per user

### Health Checks

- Cron job status can be monitored via process logs
- Failed executions are logged with full error details
- Startup initialization confirms cron job registration

## Email Template Structure

### Supported Languages

- **English (en)** - Default language
- **Italian (it)** - Italiano
- **German (de)** - Deutsch
- **Dutch (nl)** - Nederlands
- **French (fr)** - Français

### Email Content

The email template includes:

- **Personalized greeting** using user's first name
- **Company-specific messaging** with dealer name
- **Call-to-action button** linking to wishlist
- **Professional signature** with complete contact information
- **Responsive design** for mobile and desktop
- **AutoMarket branding** with logos and styling

### URL Structure

```
https://dashboard.automarket.example.com/wishlist?login_token={USER_LOGIN_TOKEN}
```

### Email Recipients

- **Development/Testing**: All emails sent to `@gmail.com`
- **Production**: Configurable recipient email address

## Integration Points

### Database Models

- **UserWishlistSendingOptions**: Main configuration storage
- **User**: User information and associations
- **LoginCode**: Generated login tokens

### Services

- **loginCodeService**: Secure token generation
- **emailService**: Email template rendering and sending

### Future Enhancements

- **Analytics**: Track email open rates and user engagement
- **Advanced Scheduling**: Daily, monthly, custom intervals
- **A/B Testing**: Test different email templates and content
- **Email Preferences**: User-configurable email frequency and content

## Usage Examples

### Enable Cron Job

```bash
# Set environment variable
export ENABLE_WISHLIST_SENDING_CRON=true

# Start server
npm start
```

### Manual Testing

```javascript
// In Node.js console or test file
const { sendWishlistNotifications } = require('./src/cron/wishlistSending');

// Trigger manually
await sendWishlistNotifications();
```

### Check Cron Status

```bash
# Look for startup message in logs
🚀 Wishlist sending cron job scheduled (0 * * * * in Europe/Stockholm)
```

## Security Considerations

### Login Code Security

- Tokens are cryptographically secure
- Old tokens are automatically cleaned up
- Each user gets unique tokens per generation

### Development Mode Protection

- Prevents accidental processing of production users
- Configurable user whitelist
- Clear logging of skipped users

### Error Information

- Sensitive information is not logged
- User emails are logged for operational purposes only
- Login codes are logged for debugging (consider removing in production)

## Performance Considerations

### Efficient Querying

- Filters users at application level after fetching active users
- Single query to get all active wishlist options
- Includes user data in single query to avoid N+1 problems

### Memory Usage

- Processes users sequentially to avoid memory spikes
- No large data structures held in memory
- Timezone conversion uses built-in JavaScript functions

### Database Impact

- Hourly execution has minimal database load
- Login code generation involves cleanup and creation
- Read-heavy operation with minimal writes

## Troubleshooting

### Cron Job Not Running

1. Check environment variable: `ENABLE_WISHLIST_SENDING_CRON=true`
2. Verify server startup logs for cron registration message
3. Check server timezone configuration

### No Notifications Processed

1. Verify users have `is_sending: true`
2. Check schedule configuration matches current time
3. Confirm timezone conversion is working correctly

### Login Code Generation Failures

1. Check database connectivity
2. Verify user exists in users table
3. Review loginCodeService configuration

### Development Mode Issues

1. Confirm allowed user IDs in DEV_CONFIG
2. Check NODE_ENV setting
3. Verify users are in the allowed list

This cron job provides a robust, flexible system for scheduled wishlist notifications with comprehensive logging, error handling, and development safety features.
