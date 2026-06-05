# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# User Report Options

This document describes the new UserReportOptions functionality that allows each user to have personalized report settings.

## Overview

The UserReportOptions model stores user-specific report preferences including percentage settings, suggestions, scheduling preferences, and sending status.

## Database Schema

### Table: `user_report_options`

| Column         | Type      | Constraints                   | Description                    |
| -------------- | --------- | ----------------------------- | ------------------------------ |
| `id`           | SERIAL    | PRIMARY KEY                   | Auto-incrementing ID           |
| `user_id`      | INTEGER   | NOT NULL, UNIQUE, FOREIGN KEY | References users.id            |
| `percentage`   | INTEGER   | NOT NULL, DEFAULT 0           | Report percentage setting      |
| `suggestions`  | JSONB     | NULL                          | Array of suggestion objects    |
| `when_to_send` | JSONB     | NULL                          | Scheduling preferences object  |
| `is_sending`   | BOOLEAN   | NOT NULL, DEFAULT FALSE       | Whether reports are being sent |
| `created_at`   | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP     | Creation timestamp             |
| `updated_at`   | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP     | Last update timestamp          |

## API Endpoints

### 1. Update/Create User Report Options

**POST** `/api/auth/generate-scraped-dealers-report`

**Body:**

```json
{
  "dealer_id": 42,
  "percentage": 11,
  "suggestions": [
    {
      "listingsitea_listing_id": 13045,
      "reference_code": "6C5W2"
    }
  ],
  "when_to_send": {
    "day": "tuesday",
    "hour": "01"
  },
  "is_sending": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "User report options updated successfully",
  "data": {
    "id": 1,
    "user_id": 42,
    "percentage": 11,
    "suggestions": [...],
    "when_to_send": {...},
    "is_sending": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Alternative Update/Create Endpoint

**POST** `/api/users/report-options`

Same request/response format as above.

### 3. Get User Report Options

**GET** `/api/users/report-options/:dealer_id`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 42,
    "percentage": 11,
    "suggestions": [...],
    "when_to_send": {...},
    "is_sending": true,
    "user": {
      "id": 42,
      "name": "Dealer Name",
      "email": "dealer@example.com",
      "company_name": "Company Name"
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Model Relationships

- `UserReportOptions` belongs to `User` (one-to-one relationship)
- `User` has one `UserReportOptions`

## Usage Examples

### Creating Report Options for a New User

```javascript
const reportData = {
  dealer_id: 42,
  percentage: 11,
  suggestions: [{ listingsitea_listing_id: 13045, reference_code: '6C5W2' }],
  when_to_send: { day: 'tuesday', hour: '01' },
  is_sending: true,
};

const response = await fetch('/api/auth/generate-scraped-dealers-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reportData),
});
```

### Updating Existing Report Options

```javascript
const updatedData = {
  dealer_id: 42,
  percentage: 15,
  is_sending: false,
};

const response = await fetch('/api/users/report-options', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData),
});
```

### Retrieving Report Options

```javascript
const response = await fetch('/api/users/report-options/42');
const reportOptions = await response.json();
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found (user or report options not found)
- `500` - Internal Server Error

## Database Migration

To add this table to an existing database, run the migration:

```bash
# If using Sequelize CLI
npx sequelize-cli db:migrate

# Or manually execute the SQL from src/sql/create_tables.sql
```

## Testing

Run the test suite to verify functionality:

```bash
npm test src/tests/userReportOptions.test.js
```

## Notes

- Each user can have only one report options record (enforced by UNIQUE constraint on user_id)
- The `suggestions` and `when_to_send` fields use JSONB for flexible data storage
- Foreign key constraint ensures referential integrity with CASCADE delete
- The model includes timestamps for tracking creation and updates
