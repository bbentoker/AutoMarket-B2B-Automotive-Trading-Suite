-- SECURITY-SANITIZED: Real dealer seed data was removed for public showcase.
-- Schema and example insert format are preserved for reference.

-- Example synthetic dealer (replace with your own test data)
INSERT INTO users (
    zoho_id,
    name,
    email,
    company_name,
    phone_number,
    website,
    listingsitea_url,
    role_id,
    status_id,
    language,
    country,
    password,
    created_at,
    updated_at
) VALUES (
    NULL,
    'Demo Dealer',
    'dealer@example.com',
    'Example Motors Ltd',
    '+1-555-0100',
    'https://example.com',
    'https://listingsitea.example.com/dealer/demo',
    2,
    2,
    'en',
    'US',
    '$2b$10$PLACEHOLDER_HASH_CHANGE_BEFORE_USE',
    NOW(),
    NOW()
);
