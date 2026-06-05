# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

## Authentication Features

### Admin

- **Login**: Admins can log in using their email and password.
- **Add Admin**: Only existing admins can add new admins.
- **JWT Middleware**: Admin routes are protected by a middleware that verifies JWT tokens to ensure the user is an admin.
- **Email Validation**: Added validation to check if the email format is correct before adding a new admin.
- **Duplicate Email Check**: Before adding a new admin, the system checks if an admin with the same email already exists to prevent duplicates.
- **Controller-Level Validation**: Email validation and duplicate email checks for both admin and dealer registration are now handled at the controller level, ensuring these checks occur before service method execution.

### Dealer

- **Login**: Dealers can log in using their email and password.
- **Register**: New dealers can register by providing their name, email, and password.

## User Management

- **Update Dealer Status**: An endpoint to update the status of a dealer by their ID. If the dealer's status ID is 2 or 3, they are not allowed to log in.
- **Get All Dealers**: An endpoint to retrieve all users with the role ID of 2 (dealers).

## Listing Management

- **Get All Listings with Status ID 1**: An endpoint to retrieve all listings that have a status ID of 1.
- **Update Listing Status**: An endpoint to update the status of a listing by its ID. This also creates a status update entry to store the previous and current status.
- **Get Listings Based on Status**: An endpoint to retrieve all listings that match a given status ID.
