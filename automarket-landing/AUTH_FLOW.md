# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

# Authentication Flow Documentation

This document describes the Login and Registration flows for the application, based on the inspection of `components/login-form.tsx`, `components/register-form.tsx`, and `lib/api.ts`.

## Environment Variables

The application relies on the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend API | `https://api.automarket.example.com` |
| `NEXT_PUBLIC_DASHBOARD_URL` | URL to redirect a user after successful login | `https://dashboard.automarket.example.com` |

---

## 1. Login Flow

### Component
- **File**: `components/login-form.tsx`
- **Function**: `LoginForm`

### API Interaction
- **Function**: `loginDealer` (in `lib/api.ts`)
- **Endpoint**: `POST {NEXT_PUBLIC_API_BASE_URL}/auth/dealer/login`
- **Headers**:
  - `Content-Type: application/json`

### Request Payload
```json
{
  "email": "user@example.com",
  "password": "your_secure_password"
}
```

### Response Handling

#### Success Response
Expected structure:
```json
{
  "token": {
    "token": "JWT_ACCESS_TOKEN",
    "error": null,      // Optional check
    "statusCode": 200   // Optional check
  }
}
```

#### Error Handling
1. If HTTP status is not OK (200-299), it throws an error.
2. If `response.token.error` is present, it is treated as a login failure.
3. If `response.token.token` is missing, it is treated as a server error.

### Post-Login Logic
1. **Storage**: The token (`JWT_ACCESS_TOKEN`) is stored in:
   - `localStorage` if "Remember me" is checked.
   - `sessionStorage` if "Remember me" is unchecked.
   - Key: `'token'`

2. **Redirect**:
   - The user is redirected to the external dashboard application.
   - **Target URL**: `{NEXT_PUBLIC_DASHBOARD_URL}?token={JWT_ACCESS_TOKEN}`
   - **Method**: `window.open(url, '_self')` (Full page navigation)

---

## 2. Registration Flow

### Component
- **File**: `components/register-form.tsx`
- **Function**: `RegisterForm`

### API Interaction
- **Function**: `registerDealer` (in `lib/api.ts`)
- **Endpoint**: `POST {NEXT_PUBLIC_API_BASE_URL}/auth/dealer/register`
- **Headers**:
  - `Content-Type: application/json`

### Request Payload
```json
{
  "name": "Full Name",
  "email": "user@example.com",
  "password": "your_secure_password",
  "company_name": "My Company Ltd.",
  "phone_number": "+1234567890",
  "vat_number": "VAT123456"
}
```

### Validation Rules (Frontend)
- **Full Name**: Required.
- **Email**: Required, valid format.
- **Company Name**: Required.
- **Phone**: Required, valid format (regex).
- **VAT Number**: Required, min 8 chars.
- **Password**: Required, min 8 chars.
- **Confirm Password**: Must match password.
- **Terms**: Must be agreed.

### Response Handling

#### Success
- The API is expected to return a JSON response indicating success (typically HTTP 200/201).
- **UI Behavior**: A "Success Modal" is displayed informing the user that their account is under review.
- **User Action**: Clicking "Continue to Login" on the modal redirects to `/login`.

#### Error Handling
- Checks for specific error message: `"A dealer with this email already exists"`.
  - If found: Shows "Account already exists" toast and redirects to `/login` after 2s.
- Generic errors are displayed via toast notifications.

---

## Summary for Migration

To move this flow to another app:

1. **Copy Components**: Move `login-form.tsx` and `register-form.tsx` (and their UI dependencies like `button.tsx`, inputs, etc.).
2. **Copy Logic**: Move `lib/api.ts` (or the relevant functions) and ensure `lib/config.ts` exists.
3. **Configure Env**: Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_DASHBOARD_URL` in the new app's environment.
4. **Routes**: Ensure the new app has routes for `/login` and `/register` (or equivalent) to host these forms.
