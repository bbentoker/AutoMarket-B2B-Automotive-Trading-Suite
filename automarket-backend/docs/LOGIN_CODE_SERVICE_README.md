# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Login Code Service

This service provides functionality for generating and validating login codes for users. Each user can have only one active login code at a time.

## Features

- Generate unique 6-digit login codes for users
- Validate login codes with expiration (24 hours)
- Automatic cleanup of expired codes
- One active code per user constraint
- Secure token generation

## Database Schema

The service uses a `login_codes` table with the following structure:

```sql
CREATE TABLE login_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Methods

### `generateCode(userId)`

Generates a new login code for a user.

**Parameters:**
- `userId` (number): The ID of the user

**Returns:**
```javascript
{
  success: true,
  code: "123456",           // 6-digit code
  token: "abc123...",       // Unique token
  loginCodeId: 1,           // Database record ID
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

**Example:**
```javascript
const loginCodeService = require('./src/services/loginCodeService');

const result = await loginCodeService.generateCode(1);
console.log(result.code); // "123456"
```

### `validateCode(code)`

Validates a login code and logs in the user if successful.

**Parameters:**
- `code` (string): The code to validate

**Returns:**
```javascript
// Success response
{
  success: true,
  message: "Login successful",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role_id: 2,
    language: "en"
  }
}

// Error response
{
  success: false,
  message: "Invalid login code",
  statusCode: 401
}
```

**Example:**
```javascript
const result = await loginCodeService.validateCode("abc123token");
if (result.success) {
  console.log("Login successful!");
  console.log("Token:", result.token);
  console.log("User:", result.user);
} else {
  console.log("Login failed:", result.message);
}
```

### `getActiveCode(userId)`

Gets the active login code for a user (if any).

**Parameters:**
- `userId` (number): The ID of the user

**Returns:**
```javascript
// If active code exists
{
  id: 1,
  user_id: 1,
  token: "abc123...",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z"
}

// If no active code
null
```

### `deleteUserCodes(userId)`

Deletes all login codes for a user.

**Parameters:**
- `userId` (number): The ID of the user

**Returns:**
```javascript
true // Success
```

## Setup

1. **Create the database table:**
   ```sql
   -- Run the SQL from src/sql/create_login_codes_table.sql
   ```

2. **Import the service:**
   ```javascript
   const loginCodeService = require('./src/services/loginCodeService');
   ```

3. **Test the service:**
   ```javascript
   // Run the test file
   node src/tests/loginCodeService.test.js
   ```

## Security Features

- **Unique tokens:** Each login code has a unique cryptographic token
- **Expiration:** Codes expire after 24 hours
- **One per user:** Only one active code per user at a time
- **Automatic cleanup:** Expired codes are automatically deleted
- **Cascade deletion:** Codes are deleted when users are deleted

## Integration with Email Service

You can integrate this with your email service to send login codes to users:

```javascript
const loginCodeService = require('./src/services/loginCodeService');
const emailService = require('./src/services/emailService');

async function sendLoginCode(userId, userEmail) {
  try {
    // Generate the code
    const result = await loginCodeService.generateCode(userId);
    
    // Send email with the code
    await emailService.sendLoginCodeEmail(userEmail, result.code);
    
    return { success: true, message: "Login code sent successfully" };
  } catch (error) {
    console.error('Error sending login code:', error);
    throw error;
  }
}
```

## Error Handling

The service includes comprehensive error handling:

- User not found errors
- Database connection errors
- Validation errors
- Expiration handling

All errors are logged and thrown for proper handling by the calling code.

## Dependencies

- `crypto`: For secure token generation
- `sequelize`: For database operations
- `User` model: For user validation
- `LoginCode` model: For database operations 