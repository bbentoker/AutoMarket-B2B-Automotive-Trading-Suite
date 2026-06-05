# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# User Wishlist Sending Options API Documentation

This document describes the API endpoints for managing user wishlist sending options, which allow users to configure when and how they receive wishlist-related notifications.

## Overview

The User Wishlist Sending Options feature allows users to:

- Configure when to receive wishlist notifications
- Enable/disable wishlist email sending
- Manage notification preferences similar to user report options

## Database Schema

### Table: `user_wishlist_sending_options`

```sql
CREATE TABLE user_wishlist_sending_options (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    when_to_send JSONB,
    is_sending BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Fields Description

- **id**: Primary key, auto-incrementing integer
- **user_id**: Foreign key referencing users table, unique constraint ensures one record per user
- **when_to_send**: JSONB field for flexible scheduling configuration (e.g., days of week, time preferences)
- **is_sending**: Boolean flag to enable/disable wishlist notifications
- **created_at**: Timestamp of record creation
- **updated_at**: Timestamp of last update

## API Endpoints

### 1. Add/Update User Wishlist Sending Options

**Endpoint:** `POST /api/users/wishlist-sending-options`

**Description:** Creates new wishlist sending options for a user or updates existing ones.

**Request Body:**

```json
{
  "user_id": 123,
  "when_to_send": {
    "days": ["monday", "wednesday", "friday"],
    "time": "09:00",
    "timezone": "Europe/Stockholm"
  },
  "is_sending": true
}
```

**Request Body Parameters:**

- `user_id` (required): Integer - ID of the user
- `when_to_send` (optional): Object - JSONB configuration for when to send notifications
- `is_sending` (optional): Boolean - Whether to send wishlist notifications (default: false)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "when_to_send": {
      "days": ["monday", "wednesday", "friday"],
      "time": "09:00",
      "timezone": "Europe/Stockholm"
    },
    "is_sending": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Wishlist sending options created successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Missing user_id:

```json
{
  "success": false,
  "message": "user_id is required"
}
```

- **404 Not Found** - User doesn't exist:

```json
{
  "success": false,
  "message": "User not found"
}
```

- **500 Internal Server Error**:

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

**Behavior:**

- If options already exist for the user, they will be updated
- If no options exist, new ones will be created
- Only provided fields will be updated (partial updates supported)

---

### 2. Get User Wishlist Sending Options by User ID

**Endpoint:** `GET /api/users/wishlist-sending-options/:user_id`

**Description:** Retrieves wishlist sending options for a specific user.

**URL Parameters:**

- `user_id` (required): Integer - ID of the user

**Example Request:**

```
GET /api/users/wishlist-sending-options/123
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "when_to_send": {
      "days": ["monday", "wednesday", "friday"],
      "time": "09:00",
      "timezone": "Europe/Stockholm"
    },
    "is_sending": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "company_name": "ABC Motors"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing user_id:

```json
{
  "success": false,
  "message": "user_id is required"
}
```

- **404 Not Found** - No options found for user:

```json
{
  "success": false,
  "message": "Wishlist sending options not found for this user"
}
```

- **500 Internal Server Error**:

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

### 3. Get All Users with Wishlist Sending Options

**Endpoint:** `GET /api/users/wishlist-sending-options`

**Description:** Retrieves all users who have configured wishlist sending options with pagination support.

**Query Parameters:**

- `page` (optional): Integer - Page number (default: 1)
- `limit` (optional): Integer - Items per page (default: 10)

**Example Request:**

```
GET /api/users/wishlist-sending-options?page=1&limit=5
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "wishlistSendingOptions": [
      {
        "id": 1,
        "user_id": 123,
        "when_to_send": {
          "days": ["monday", "wednesday", "friday"],
          "time": "09:00",
          "timezone": "Europe/Stockholm"
        },
        "is_sending": true,
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "user": {
          "id": 123,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "company_name": "ABC Motors",
          "phone_number": "+46123456789",
          "country": "Sweden"
        }
      },
      {
        "id": 2,
        "user_id": 456,
        "when_to_send": {
          "days": ["tuesday", "thursday"],
          "time": "14:00",
          "timezone": "Europe/Stockholm"
        },
        "is_sending": false,
        "created_at": "2024-01-14T15:45:00.000Z",
        "updated_at": "2024-01-14T15:45:00.000Z",
        "user": {
          "id": 456,
          "name": "Jane Smith",
          "email": "jane.smith@example.com",
          "company_name": "XYZ Auto",
          "phone_number": "+46987654321",
          "country": "Sweden"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 15,
      "itemsPerPage": 5
    }
  }
}
```

**Error Responses:**

- **500 Internal Server Error**:

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

**Features:**

- Results are ordered by creation date (newest first)
- Includes full user information for each record
- Pagination metadata helps with frontend implementation

## Usage Examples

### Example 1: Enable Daily Wishlist Notifications

```bash
curl -X POST http://localhost:3000/api/users/wishlist-sending-options \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "when_to_send": {
      "frequency": "daily",
      "time": "08:00",
      "timezone": "Europe/Stockholm"
    },
    "is_sending": true
  }'
```

### Example 2: Configure Weekly Notifications

```bash
curl -X POST http://localhost:3000/api/users/wishlist-sending-options \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 456,
    "when_to_send": {
      "frequency": "weekly",
      "days": ["monday"],
      "time": "10:00",
      "timezone": "Europe/Stockholm"
    },
    "is_sending": true
  }'
```

### Example 3: Disable Notifications

```bash
curl -X POST http://localhost:3000/api/users/wishlist-sending-options \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 789,
    "is_sending": false
  }'
```

### Example 4: Get User's Current Settings

```bash
curl -X GET http://localhost:3000/api/users/wishlist-sending-options/123
```

### Example 5: List All Users with Pagination

```bash
curl -X GET "http://localhost:3000/api/users/wishlist-sending-options?page=2&limit=20"
```

## Integration Notes

### Frontend Integration

1. **User Settings Page**: Allow users to configure their wishlist notification preferences
2. **Admin Dashboard**: View and manage all users' wishlist sending options
3. **Notification Management**: Use the `is_sending` flag to control email sending

### Backend Integration

1. **Cron Jobs**: Use the `when_to_send` configuration in scheduled tasks
2. **Email Service**: Check `is_sending` flag before sending wishlist emails
3. **User Management**: Integrate with existing user management workflows

### Data Structure for `when_to_send`

The `when_to_send` field is flexible JSONB that can store various scheduling configurations:

```json
// Daily notifications
{
  "frequency": "daily",
  "time": "09:00",
  "timezone": "Europe/Stockholm"
}

// Weekly notifications
{
  "frequency": "weekly",
  "days": ["monday", "wednesday", "friday"],
  "time": "10:00",
  "timezone": "Europe/Stockholm"
}

// Custom interval
{
  "frequency": "custom",
  "interval_days": 3,
  "time": "14:00",
  "timezone": "Europe/Stockholm"
}
```

## Security Considerations

1. **Authentication**: Ensure proper authentication for all endpoints
2. **Authorization**: Users should only be able to modify their own settings
3. **Input Validation**: Validate all input data, especially JSONB fields
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Related Models

- **User**: Main user model (foreign key relationship)
- **UserReportOptions**: Similar functionality for report notifications
- **WishlistOptions**: User's wishlist items
- **WishlistClick**: User interactions with wishlist items

## Migration Notes

To add this functionality to an existing database:

1. Run the CREATE TABLE statement from `src/sql/create_tables.sql`
2. Ensure the User model associations are properly loaded
3. Test the endpoints with sample data
4. Update any existing cron jobs to use the new settings

## Error Handling

All endpoints include comprehensive error handling:

- Input validation errors (400)
- Resource not found errors (404)
- Internal server errors (500)
- Proper error messages for debugging

## Performance Considerations

- Unique constraint on `user_id` ensures efficient lookups
- Index on `user_id` for fast queries
- Pagination prevents large result sets
- JSONB field allows flexible querying with PostgreSQL JSON operators
