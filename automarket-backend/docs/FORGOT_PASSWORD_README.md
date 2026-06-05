# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Forgot Password Functionality

This document describes the forgot password functionality implemented in the Car Sales Platform.

## Overview

The forgot password feature allows users to reset their password by:

1. Requesting a password reset code via email
2. Using the code to set a new password

## Database Schema

### ResetPasswordCode Model

The `reset_password_codes` table stores password reset codes:

```sql
CREATE TABLE reset_password_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### 1. Forgot Password Request

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "If an account with this email exists, a password reset code has been sent."
}
```

**Error Responses:**

- `400` - Email is required
- `400` - Invalid email format
- `500` - Internal server error

### 2. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

```json
{
  "code": "reset_code_from_email",
  "newPassword": "new_password_here"
}
```

**Response:**

```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**

- `400` - Reset code and new password are required
- `400` - Password must be at least 6 characters long
- `400` - Invalid or expired reset code
- `400` - Reset code has expired
- `500` - Internal server error

## Security Features

1. **Email Validation:** Validates email format before processing
2. **Code Expiration:** Reset codes expire after 1 hour
3. **One-time Use:** Reset codes can only be used once
4. **Password Requirements:** New passwords must be at least 6 characters
5. **Secure Response:** Doesn't reveal if an email exists in the system
6. **Password Hashing:** New passwords are hashed using bcrypt

## Email Template

The password reset email includes:

- User's name
- Reset code
- Instructions for password reset
- Security warning
- Expiration information

## Files Modified/Created

### New Files:

- `src/models/ResetPasswordCode.js` - Sequelize model for reset codes
- `src/tests/forgotPassword.test.js` - Test file for the functionality
- `FORGOT_PASSWORD_README.md` - This documentation

### Modified Files:

- `src/sql/create_tables.sql` - Added reset_password_codes table
- `src/models/associations.js` - Added ResetPasswordCode associations
- `src/controllers/authController.js` - Added forgotPassword and resetPassword methods
- `src/routes/authRoutes.js` - Added forgot-password and reset-password routes
- `src/services/emailService.js` - Added sendPasswordResetEmail method

## Testing

Run the test file to verify the functionality:

```bash
node src/tests/forgotPassword.test.js
```

## Usage Example

1. **Request Password Reset:**

   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com"}'
   ```

2. **Reset Password (after receiving email):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"code": "abc123def456", "newPassword": "newSecurePassword123"}'
   ```

## Environment Variables Required

Make sure these environment variables are set:

- `MAILGUN_KEY` - Mailgun API key
- `MAILGUN_DOMAIN` - Mailgun domain
- `SENDER_EMAIL` - Email address for sending emails

## Notes

- Reset codes are generated using a combination of random strings
- Codes are unique and can only be used once
- The system doesn't reveal whether an email exists in the database
- Password reset emails include a security warning
- All passwords are hashed using bcrypt with salt rounds of 10
