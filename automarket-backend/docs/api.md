# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# API Documentation

## Authentication Routes

### Admin

- **POST /admin/login**

  - Description: Admin login using email and password.
  - Request Body: `{ email: string, password: string }`
  - Response: `{ token: string }`
  - Errors: 400 if login fails.

- **POST /admin/add**
  - Description: Add a new admin. Requires admin authentication.
  - Middleware: `verifyAdmin`
  - Request Body: `{ name: string, email: string, password: string }`
  - Response: Newly created admin object.
  - Errors: 400 if email is invalid or already exists.

### Dealer

- **POST /dealer/login**

  - Description: Dealer login using email and password.
  - Request Body: `{ email: string, password: string }`
  - Response: `{ token: string }`
  - Errors: 400 if login fails.

- **POST /dealer/register**

  - Description: Register a new dealer.
  - Request Body: `{ name: string, email: string, password: string }`
  - Response: Newly created dealer object.
  - Errors: 400 if email is invalid or already exists.

- **PUT /dealer/:id/status**

  - Description: Update the status of a dealer by ID.
  - Request Body: `{ statusId: number }`
  - Response: Updated dealer object.
  - Errors: 400 if dealer not found.

- **GET /dealers**
  - Description: Retrieve all dealers.
  - Response: List of dealer objects.
  - Errors: 400 if retrieval fails.

## Listing Routes

- **GET /**

  - Description: Retrieve all listings with optional pagination.
  - Query Parameters:
    - `language` (optional, default: 'en'): Preferred language for translations
    - `fallbackLanguage` (optional, default: 'en'): Fallback language if preferred not available
    - `page` (optional, default: 1): Page number for pagination
    - `limit` (optional): Number of listings per page (1-100). If not provided, all listings are returned
  - Response:
    ```json
    {
      "listings": [
        /* array of listing objects */
      ],
      "pagination": {
        "total": 150,
        "page": 1,
        "limit": 20,
        "totalPages": 8,
        "hasNext": true,
        "hasPrev": false
      }
    }
    ```
  - Errors:
    - 400 if limit is not between 1 and 100
    - 400 if page is less than 1
    - 500 if retrieval fails

- **GET /:id**

  - Description: Retrieve a single listing by ID.
  - Query Parameters: `language` (optional), `fallbackLanguage` (optional)
  - Response: Listing object.
  - Errors: 404 if listing not found, 500 if retrieval fails.

- **POST /**

  - Description: Create a new listing.
  - Request Body: Listing object.
  - Response: Newly created listing object.
  - Errors: 400 if creation fails.

- **PUT /:id**

  - Description: Update a listing by ID.
  - Request Body: Listing object.
  - Response: Updated listing object.
  - Errors: 404 if listing not found, 400 if update fails.

- **DELETE /:id**

  - Description: Delete a listing by ID.
  - Response: Success message.
  - Errors: 404 if listing not found, 500 if deletion fails.

- **POST /extract-listing**

  - Description: Extract listing information from a URL.
  - Request Body: `{ url: string }`
  - Response: Extracted and created listing object.
  - Errors: 400 if URL is invalid or extraction fails, 500 if extraction fails.

- **GET /status/1**

  - Description: Retrieve all listings with status ID 1.
  - Response: List of listing objects.
  - Errors: 500 if retrieval fails.

- **PUT /:id/status**

  - Description: Update the status of a listing by ID.
  - Request Body: `{ statusId: number }`
  - Response: Updated listing object.
  - Errors: 404 if listing not found, 400 if update fails.

- **GET /status/:statusId**
  - Description: Retrieve listings based on status ID.
  - Response: List of listing objects.
  - Errors: 500 if retrieval fails.
