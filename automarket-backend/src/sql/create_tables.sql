-- =============================================================================
-- AutoMarket Platform — Canonical Database Schema (Single Source of Truth)
-- =============================================================================
-- Fresh install:  psql -d $DB_NAME -f src/sql/create_tables.sql
-- Country seed:   psql -d $DB_NAME -f src/sql/create_countries.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared trigger: auto-update updated_at on row changes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Lookup tables (no foreign-key dependencies)
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE user_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(2) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Users & auth
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    zoho_id VARCHAR(100) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(100),
    phone_number VARCHAR(100),
    vat_number VARCHAR(100),
    website VARCHAR(255),
    billing_street VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_country VARCHAR(100),
    billing_code VARCHAR(50),
    password VARCHAR NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
    status_id INTEGER NOT NULL DEFAULT 1 REFERENCES user_status(id),
    language VARCHAR(50),
    country VARCHAR(100),
    listingsitea_url VARCHAR(255),
    listingsitea_url_add_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reset_password_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(255) NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Scraper session marker (written by automarket-scraper)
-- -----------------------------------------------------------------------------
CREATE TABLE listingsitea_controls (
    id SERIAL PRIMARY KEY,
    date TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- Listings & deal pipeline
-- -----------------------------------------------------------------------------
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    horsepower VARCHAR(50),
    registration_number VARCHAR(50),
    deal_stage VARCHAR(100),
    first_registration DATE,
    km_stand INTEGER,
    vin_number VARCHAR(100),
    internal_url TEXT,
    co2 VARCHAR(50),
    listing_price DECIMAL(10, 2),
    currency VARCHAR(50),
    status_id INTEGER REFERENCES statuses(id),
    assigned_to_id INTEGER REFERENCES users(id),
    expiration INTEGER DEFAULT 48,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    brand_name VARCHAR(100),
    model VARCHAR(255),
    color VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission_type VARCHAR(50),
    features TEXT,
    vat_or_margin VARCHAR(100),
    location VARCHAR(255),
    vehicle_category VARCHAR(100),
    interior_color VARCHAR(50),
    trim_package VARCHAR(255),
    engine VARCHAR(100),
    service_history TEXT,
    number_of_owners INTEGER,
    zoho_id VARCHAR(100),
    proforma_invoice_number VARCHAR(100),
    additional_notes TEXT,
    tracking_code VARCHAR(100),
    proforma_inv_date DATE,
    expected_pick_up_date DATE,
    expected_delivery_date DATE,
    expected_close_date DATE,
    closing_date DATE,
    transport_cost DECIMAL(10, 2),
    car_delivery_address TEXT,
    pick_up_address TEXT,
    document_sent_address TEXT,
    seller_email VARCHAR(255),
    seller_company VARCHAR(255),
    contact_person VARCHAR(255),
    telephone VARCHAR(50),
    mobile VARCHAR(50),
    email_address VARCHAR(255),
    submitted_offer_amount DECIMAL(10, 2),
    amount_sold_for DECIMAL(10, 2),
    grade VARCHAR(50),
    buyer_company_name VARCHAR(255),
    buyer_s_email VARCHAR(255),
    payment_send_date DATE,
    invoice_id VARCHAR(100),
    seat VARCHAR(50),
    is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
    car_studio_processed BOOLEAN NOT NULL DEFAULT FALSE,
    previous_accidents BOOLEAN NOT NULL DEFAULT FALSE,
    reference_no VARCHAR(50) UNIQUE,
    logo_filename VARCHAR(100),
    is_listingsiteb BOOLEAN NOT NULL DEFAULT FALSE,
    is_listingsitea BOOLEAN NOT NULL DEFAULT FALSE,
    is_listingsitec BOOLEAN NOT NULL DEFAULT FALSE,
    seller_address TEXT,
    amount_purchased DECIMAL(10, 2),
    language VARCHAR(50),
    belgium_price DECIMAL(10, 2),
    avg_selling_time INTEGER,
    listingsitea_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_updates (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    previous_status_id INTEGER NOT NULL REFERENCES statuses(id),
    current_status_id INTEGER NOT NULL REFERENCES statuses(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listing_photos (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE damaged_parts (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    part_id INTEGER NOT NULL,
    photo TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    dealer_id INTEGER NOT NULL REFERENCES users(id),
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    offer DECIMAL(10, 2) NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    counter_offer DECIMAL(10, 2),
    is_rejected BOOLEAN NOT NULL DEFAULT FALSE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    dealer_id INTEGER NOT NULL REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    invoice_number VARCHAR(100) UNIQUE,
    description TEXT,
    due_date DATE,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, listing_id)
);

CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    activity_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contacted BOOLEAN,
    type VARCHAR(50)
);

-- -----------------------------------------------------------------------------
-- Newsletter
-- -----------------------------------------------------------------------------
CREATE TABLE newsletter_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    country_id INTEGER NOT NULL REFERENCES countries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletters (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    newsletter_contact_id INTEGER NOT NULL REFERENCES newsletter_contacts(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL DEFAULT 'newsletter',
    recipient_email VARCHAR(255) NOT NULL,
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at TIMESTAMPTZ,
    mailgun_message_id VARCHAR(255),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Weekly dealer reports
-- -----------------------------------------------------------------------------
CREATE TABLE user_report_options (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    percentage INTEGER NOT NULL DEFAULT 0,
    suggestions JSONB,
    when_to_send JSONB,
    is_sending BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weekly_report_emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    mailgun_message_id VARCHAR(255) NOT NULL UNIQUE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at TIMESTAMPTZ,
    language VARCHAR(2) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Scraped dealer inventory (written by automarket-scraper, read by backend)
-- -----------------------------------------------------------------------------
CREATE TABLE listingsitea_adverts (
    id SERIAL PRIMARY KEY,
    listingsitea_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    seller_name VARCHAR(255),
    first_registration DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen TIMESTAMPTZ,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    model_version VARCHAR(255),
    location VARCHAR(255),
    price DOUBLE PRECISION,
    price_currency VARCHAR(10),
    body_type VARCHAR(100),
    type VARCHAR(100),
    drivetrain VARCHAR(100),
    seats INTEGER,
    doors INTEGER,
    mileage VARCHAR(100),
    previous_owner INTEGER,
    full_service_history BOOLEAN,
    non_smoker_vehicle BOOLEAN,
    power VARCHAR(100),
    gearbox VARCHAR(100),
    engine_size VARCHAR(100),
    gears INTEGER,
    cylinders INTEGER,
    empty_weight VARCHAR(100),
    emission_class VARCHAR(100),
    fuel_type VARCHAR(100),
    fuel_consumption VARCHAR(100),
    co_2_emissions VARCHAR(100),
    comfort TEXT,
    entertainment TEXT,
    safety TEXT,
    extras TEXT,
    color VARCHAR(100),
    paint VARCHAR(100),
    upholstery_color VARCHAR(100),
    upholstery TEXT,
    description TEXT,
    link VARCHAR(500),
    sell_time INTEGER,
    image_url VARCHAR(500),
    is_initial_run_listing BOOLEAN NOT NULL DEFAULT FALSE,
    original_image_url VARCHAR(500)
);

CREATE TABLE listingsitea_inventory (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Wishlist (listing_id references scraped adverts, not platform listings)
-- -----------------------------------------------------------------------------
CREATE TABLE wishlist_options (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Column name is historical; FK points at listingsitea_adverts.id (scraped inventory).
    listing_id INTEGER NOT NULL REFERENCES listingsitea_adverts(id) ON DELETE CASCADE,
    listing_vat_type VARCHAR(50),
    offered_price DECIMAL(10, 2),
    offered_price_vat_type VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'EUR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, listing_id)
);

CREATE TABLE user_wishlist_sending_options (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    when_to_send JSONB,
    is_sending BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mailgun_message_id VARCHAR(255) NOT NULL UNIQUE,
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    when_opened TIMESTAMPTZ,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_clicks (
    id SERIAL PRIMARY KEY,
    wishlist_option_id INTEGER NOT NULL REFERENCES wishlist_options(id) ON DELETE CASCADE,
    -- May reference a platform listing or scraped advert depending on context.
    listing_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Blog CMS
-- -----------------------------------------------------------------------------
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    read_time VARCHAR(20) NOT NULL,
    image TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Standalone integrations
-- -----------------------------------------------------------------------------
CREATE TABLE zoho_tokens (
    id SERIAL PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_in INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- users
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status_id ON users(status_id);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_listingsitea_url ON users(listingsitea_url) WHERE listingsitea_url IS NOT NULL;

-- listings
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_status_id ON listings(status_id);
CREATE INDEX idx_listings_assigned_to_id ON listings(assigned_to_id);
CREATE INDEX idx_listings_is_deleted ON listings(is_deleted);
CREATE INDEX idx_listings_is_viewed ON listings(is_viewed);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_listings_updated_at ON listings(updated_at);
CREATE INDEX idx_listings_brand_name ON listings(brand_name);
CREATE INDEX idx_listings_model ON listings(model);
CREATE INDEX idx_listings_listing_price ON listings(listing_price);
CREATE INDEX idx_listings_deal_stage ON listings(deal_stage);
CREATE INDEX idx_listings_zoho_id ON listings(zoho_id);
CREATE INDEX idx_listings_seller_active ON listings(seller_id, is_deleted, status_id);
CREATE INDEX idx_listings_status_viewed ON listings(status_id, is_viewed) WHERE status_id = 2;
CREATE INDEX idx_listings_browse_active ON listings(status_id, is_deleted) WHERE status_id IN (1, 3);
CREATE INDEX idx_listings_newsletter ON listings(status_id, created_at, is_deleted) WHERE status_id IN (1, 3);
CREATE INDEX idx_listings_seller_created ON listings(seller_id, created_at DESC, is_deleted);
CREATE INDEX idx_listings_brand_model ON listings(brand_name, model, is_deleted, status_id);
CREATE INDEX idx_listings_price_active ON listings(listing_price, status_id, is_deleted);

-- status_updates
CREATE INDEX idx_status_updates_listing_created ON status_updates(listing_id, created_at DESC);

-- listing_photos
CREATE INDEX idx_listing_photos_listing_id ON listing_photos(listing_id);

-- damaged_parts
CREATE INDEX idx_damaged_parts_listing_id ON damaged_parts(listing_id);

-- offers
CREATE INDEX idx_offers_listing_id ON offers(listing_id);
CREATE INDEX idx_offers_dealer_id ON offers(dealer_id);
CREATE INDEX idx_offers_listing_created ON offers(listing_id, created_at DESC);

-- invoices
CREATE INDEX idx_invoices_dealer_id ON invoices(dealer_id);
CREATE INDEX idx_invoices_listing_id ON invoices(listing_id);
CREATE INDEX idx_invoices_is_paid ON invoices(is_paid);

-- saved_listings
CREATE INDEX idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX idx_saved_listings_listing_id ON saved_listings(listing_id);

-- user_activities
CREATE INDEX idx_user_activities_user_listing ON user_activities(user_id, listing_id);
CREATE INDEX idx_user_activities_listing_date ON user_activities(listing_id, activity_date DESC);

-- newsletters
CREATE INDEX idx_newsletters_contact_id ON newsletters(newsletter_contact_id);
CREATE INDEX idx_newsletters_listing_id ON newsletters(listing_id);
CREATE INDEX idx_newsletters_mailgun_message_id ON newsletters(mailgun_message_id);

-- weekly_report_emails
CREATE INDEX idx_weekly_report_emails_user_id ON weekly_report_emails(user_id);
CREATE INDEX idx_weekly_report_emails_week_dates ON weekly_report_emails(week_start_date, week_end_date);
CREATE INDEX idx_weekly_report_emails_year_week ON weekly_report_emails(year, week_number);

-- listingsitea_adverts
CREATE INDEX idx_listingsitea_adverts_seller_id ON listingsitea_adverts(seller_id);
CREATE INDEX idx_listingsitea_adverts_is_active ON listingsitea_adverts(is_active);
CREATE INDEX idx_listingsitea_adverts_created_at ON listingsitea_adverts(created_at);
CREATE INDEX idx_listingsitea_adverts_last_seen ON listingsitea_adverts(last_seen);
CREATE INDEX idx_listingsitea_adverts_make ON listingsitea_adverts(make);
CREATE INDEX idx_listingsitea_adverts_model ON listingsitea_adverts(model);
CREATE INDEX idx_listingsitea_adverts_price ON listingsitea_adverts(price);
CREATE INDEX idx_listingsitea_adverts_first_registration ON listingsitea_adverts(first_registration);
CREATE INDEX idx_listingsitea_adverts_location ON listingsitea_adverts(location);
CREATE INDEX idx_listingsitea_adverts_is_initial_run ON listingsitea_adverts(is_initial_run_listing);
CREATE INDEX idx_listingsitea_seller_active ON listingsitea_adverts(seller_id, is_active);
CREATE INDEX idx_listingsitea_active_non_initial ON listingsitea_adverts(is_initial_run_listing, is_active) WHERE is_initial_run_listing = FALSE;
CREATE INDEX idx_listingsitea_make_model_active ON listingsitea_adverts(make, model, is_active);
CREATE INDEX idx_listingsitea_price_active ON listingsitea_adverts(price, is_active, seller_id);
CREATE INDEX idx_listingsitea_recent ON listingsitea_adverts(created_at DESC, is_active);
CREATE INDEX idx_listingsitea_location_active ON listingsitea_adverts(location, is_active);

-- listingsitea_inventory
CREATE INDEX idx_listingsitea_inventory_seller_id ON listingsitea_inventory(seller_id);
CREATE INDEX idx_listingsitea_inventory_created_at ON listingsitea_inventory(created_at);

-- wishlist_options
CREATE INDEX idx_wishlist_options_user_id ON wishlist_options(user_id);
CREATE INDEX idx_wishlist_options_listing_id ON wishlist_options(listing_id);

-- wishlist_clicks
CREATE INDEX idx_wishlist_clicks_wishlist_option_id ON wishlist_clicks(wishlist_option_id);
CREATE INDEX idx_wishlist_clicks_listing_id ON wishlist_clicks(listing_id);
CREATE INDEX idx_wishlist_clicks_user_id ON wishlist_clicks(user_id);
CREATE INDEX idx_wishlist_clicks_user_listing ON wishlist_clicks(user_id, listing_id);

-- user_wishlist_sending_options
CREATE INDEX idx_user_wishlist_sending_options_user_id ON user_wishlist_sending_options(user_id);

-- wishlist_emails
CREATE INDEX idx_wishlist_emails_user_id ON wishlist_emails(user_id);
CREATE INDEX idx_wishlist_emails_mailgun_message_id ON wishlist_emails(mailgun_message_id);
CREATE INDEX idx_wishlist_emails_is_opened ON wishlist_emails(is_opened);
CREATE INDEX idx_wishlist_emails_sent_at ON wishlist_emails(sent_at);

-- blogs
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_featured ON blogs(featured);
CREATE INDEX idx_blogs_is_published ON blogs(is_published);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_date ON blogs(date);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);
