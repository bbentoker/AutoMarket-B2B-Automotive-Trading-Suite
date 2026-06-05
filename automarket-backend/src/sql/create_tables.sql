CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);


CREATE TABLE user_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    zoho_id VARCHAR(100) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(100) ,
    phone_number VARCHAR(100),
    vat_number VARCHAR(100) ,
    website VARCHAR(255),
    billing_street VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_country VARCHAR(100),
    billing_code VARCHAR(50),
    password VARCHAR NOT NULL,
    role_id INTEGER DEFAULT 1,
    status_id INTEGER DEFAULT 1,
    language VARCHAR(50),
    country VARCHAR(100),
    listingsitea_url VARCHAR(255),
    listingsitea_url_add_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- constant table for statuses
CREATE TABLE statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- table for listing status updates
CREATE TABLE status_updates (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    previous_status_id INTEGER NOT NULL,
    current_status_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listing_photos (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    dealer_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    offer DECIMAL(10, 2) NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    counter_offer DECIMAL(10, 2),
    is_rejected BOOLEAN NOT NULL DEFAULT FALSE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER,
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
    status_id INTEGER,
    assigned_to_id INTEGER,
    expiration INTEGER DEFAULT 48,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    brand_name VARCHAR(100),
    model VARCHAR(255),
    color VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission_type VARCHAR(50),
    features TEXT,
    vat_or_margin VARCHAR,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invoice_id VARCHAR(100),
    seat VARCHAR(50),
    is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
    car_studio_processed BOOLEAN NOT NULL DEFAULT FALSE,
    previous_accidents BOOLEAN NOT NULL DEFAULT FALSE,
    reference_no VARCHAR(50),
    logo_filename VARCHAR(100),
    is_listingsiteb BOOLEAN NOT NULL DEFAULT FALSE,
    is_listingsitea BOOLEAN NOT NULL DEFAULT FALSE,
    is_listingsitec BOOLEAN NOT NULL DEFAULT FALSE,
    seller_address TEXT,
    amount_purchased DECIMAL(10,2),
    language VARCHAR(50),
    belgium_price DECIMAL(10,2),
    avg_selling_time INTEGER,
    listingsitea_link TEXT
);

CREATE TABLE listingsitea_controls (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP
);


-- table for listing status updates
CREATE TABLE status_updates (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    previous_status_id INTEGER NOT NULL,
    current_status_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (previous_status_id) REFERENCES statuses(id),
    FOREIGN KEY (current_status_id) REFERENCES statuses(id)
);

CREATE TABLE listing_photos (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id)
);

-- Table for Zoho OAuth tokens
CREATE TABLE zoho_tokens (
    id SERIAL PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_in INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking user activities on listings
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    listing_id INTEGER,
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    contacted boolean,
    type VARCHAR(50)
);

-- Table for newsletter contacts
CREATE TABLE IF NOT EXISTS newsletter_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    country_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE IF NOT EXISTS newsletters (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER,
    newsletter_contact_id INTEGER NOT NULL,
    email_type VARCHAR(50) NOT NULL DEFAULT 'newsletter',
    recipient_email VARCHAR(255) NOT NULL,
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at TIMESTAMPTZ,
    mailgun_message_id VARCHAR(255),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (newsletter_contact_id) REFERENCES users(id)
);

-- Table for damaged parts associated with listings
CREATE TABLE damaged_parts (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL,
    part_id INTEGER NOT NULL,
    photo TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for saved listings by dealers
CREATE TABLE saved_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for invoices
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    dealer_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP,
    invoice_number VARCHAR(100) UNIQUE,
    description TEXT,
    due_date DATE,
    listing_id INTEGER,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for user report options
CREATE TABLE user_report_options (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    percentage INTEGER NOT NULL DEFAULT 0,
    suggestions JSONB,
    when_to_send JSONB,
    is_sending BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);


-- Create login_codes table
CREATE TABLE login_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create listingsitea_inventory table
CREATE TABLE listingsitea_inventory (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Create reset_password_codes table
CREATE TABLE reset_password_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create weekly_report_emails table
CREATE TABLE weekly_report_emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    mailgun_message_id VARCHAR(255) NOT NULL UNIQUE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at TIMESTAMP WITH TIME ZONE,
    language VARCHAR(2) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for weekly_report_emails table
CREATE INDEX idx_weekly_report_emails_user_id ON weekly_report_emails(user_id);
CREATE INDEX idx_weekly_report_emails_week_dates ON weekly_report_emails(week_start_date, week_end_date);
CREATE INDEX idx_weekly_report_emails_year_week ON weekly_report_emails(year, week_number);

-- Create wishlist_options table
CREATE TABLE wishlist_options (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    listing_vat_type VARCHAR(50),
    offered_price DECIMAL(10, 2),
    offered_price_vat_type VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for wishlist_options table
CREATE INDEX idx_wishlist_options_user_id ON wishlist_options(user_id);
CREATE INDEX idx_wishlist_options_listing_id ON wishlist_options(listing_id);
CREATE INDEX idx_wishlist_options_user_listing ON wishlist_options(user_id, listing_id);

-- Create wishlist_clicks table
CREATE TABLE wishlist_clicks (
    id SERIAL PRIMARY KEY,
    wishlist_option_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for wishlist_clicks table
CREATE INDEX idx_wishlist_clicks_wishlist_option_id ON wishlist_clicks(wishlist_option_id);
CREATE INDEX idx_wishlist_clicks_listing_id ON wishlist_clicks(listing_id);
CREATE INDEX idx_wishlist_clicks_user_id ON wishlist_clicks(user_id);
CREATE INDEX idx_wishlist_clicks_user_listing ON wishlist_clicks(user_id, listing_id);

-- Create user_wishlist_sending_options table
CREATE TABLE user_wishlist_sending_options (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    when_to_send JSONB,
    is_sending BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for user_wishlist_sending_options table
CREATE INDEX idx_user_wishlist_sending_options_user_id ON user_wishlist_sending_options(user_id);

-- Create wishlist_emails table
CREATE TABLE wishlist_emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mailgun_message_id VARCHAR(255) NOT NULL UNIQUE,
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    when_opened TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for wishlist_emails table
CREATE INDEX idx_wishlist_emails_user_id ON wishlist_emails(user_id);
CREATE INDEX idx_wishlist_emails_mailgun_message_id ON wishlist_emails(mailgun_message_id);
CREATE INDEX idx_wishlist_emails_is_opened ON wishlist_emails(is_opened);
CREATE INDEX idx_wishlist_emails_sent_at ON wishlist_emails(sent_at);

-- ===============================================
-- PERFORMANCE INDEXES FOR MAIN TABLES
-- ===============================================

-- LISTINGS TABLE INDEXES (Primary performance table)
-- Foreign key indexes for joins
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_status_id ON listings(status_id);
CREATE INDEX idx_listings_assigned_to_id ON listings(assigned_to_id);

-- Single column indexes for common filters
CREATE INDEX idx_listings_is_deleted ON listings(is_deleted);
CREATE INDEX idx_listings_is_viewed ON listings(is_viewed);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_listings_updated_at ON listings(updated_at);
CREATE INDEX idx_listings_brand_name ON listings(brand_name);
CREATE INDEX idx_listings_model ON listings(model);
CREATE INDEX idx_listings_listing_price ON listings(listing_price);
CREATE INDEX idx_listings_deal_stage ON listings(deal_stage);
CREATE INDEX idx_listings_zoho_id ON listings(zoho_id);

-- Composite indexes for common query patterns
-- Active listings by seller (most common pattern)
CREATE INDEX idx_listings_seller_active ON listings(seller_id, is_deleted, status_id);

-- Dashboard queries - unviewed reserved listings
CREATE INDEX idx_listings_status_viewed ON listings(status_id, is_viewed) WHERE status_id = 2;

-- Active listings for browsing (status 1 or 3, not deleted)
CREATE INDEX idx_listings_browse_active ON listings(status_id, is_deleted) WHERE status_id IN (1, 3);

-- Newsletter queries - active listings by creation date
CREATE INDEX idx_listings_newsletter ON listings(status_id, created_at, is_deleted) WHERE status_id IN (1, 3);

-- Seller's listings ordered by creation (common in user dashboard)
CREATE INDEX idx_listings_seller_created ON listings(seller_id, created_at DESC, is_deleted);

-- Brand and model searches
CREATE INDEX idx_listings_brand_model ON listings(brand_name, model, is_deleted, status_id);

-- Price range searches
CREATE INDEX idx_listings_price_active ON listings(listing_price, status_id, is_deleted);

-- LISTING_SITE_A_ADVERTS TABLE INDEXES (Second main performance table)
-- Create the table first if it doesn't exist (from model definition)
CREATE TABLE IF NOT EXISTS listingsitea_adverts (
    id SERIAL PRIMARY KEY,
    listingsitea_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seller_id INTEGER,
    seller_name VARCHAR(255),
    first_registration DATE,
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    model_version VARCHAR(255),
    location VARCHAR(255),
    price FLOAT,
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
    is_initial_run_listing BOOLEAN DEFAULT false,
    original_image_url VARCHAR(500)
);

-- Primary listingsitea_adverts indexes
-- Note: Using regular index instead of unique due to potential duplicates in existing data
CREATE INDEX idx_listingsitea_adverts_listingsitea_id ON listingsitea_adverts(listingsitea_id);
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

-- Composite indexes for listingsitea_adverts
-- Active adverts by seller (most common pattern)
CREATE INDEX idx_listingsitea_seller_active ON listingsitea_adverts(seller_id, is_active);

-- Non-initial run active listings (default scope)
CREATE INDEX idx_listingsitea_active_non_initial ON listingsitea_adverts(is_initial_run_listing, is_active) WHERE is_initial_run_listing = false;

-- Make/model searches for active adverts
CREATE INDEX idx_listingsitea_make_model_active ON listingsitea_adverts(make, model, is_active);

-- Price range searches for active adverts
CREATE INDEX idx_listingsitea_price_active ON listingsitea_adverts(price, is_active, seller_id);

-- Recently added/updated adverts
CREATE INDEX idx_listingsitea_recent ON listingsitea_adverts(created_at DESC, is_active);

-- Location-based searches
CREATE INDEX idx_listingsitea_location_active ON listingsitea_adverts(location, is_active);

-- OTHER SUPPORTING TABLE INDEXES
-- Status updates (frequently queried for listing history)
CREATE INDEX idx_status_updates_listing_created ON status_updates(listing_id, created_at DESC);

-- Listing photos (for gallery loading)
CREATE INDEX idx_listing_photos_listing_id ON listing_photos(listing_id);

-- User activities (for tracking and analytics)
CREATE INDEX idx_user_activities_user_listing ON user_activities(user_id, listing_id);
CREATE INDEX idx_user_activities_listing_date ON user_activities(listing_id, activity_date DESC);

-- Offers (for offer management)
CREATE INDEX idx_offers_listing_id ON offers(listing_id);
CREATE INDEX idx_offers_dealer_id ON offers(dealer_id);
CREATE INDEX idx_offers_listing_created ON offers(listing_id, created_at DESC);

-- Saved listings (for user favorites)
CREATE INDEX idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX idx_saved_listings_listing_id ON saved_listings(listing_id);
CREATE INDEX idx_saved_listings_user_listing ON saved_listings(user_id, listing_id);

-- Invoices (for billing)
CREATE INDEX idx_invoices_dealer_id ON invoices(dealer_id);
CREATE INDEX idx_invoices_listing_id ON invoices(listing_id);
CREATE INDEX idx_invoices_is_paid ON invoices(is_paid);

-- Users table additional indexes
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status_id ON users(status_id);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_listingsitea_url ON users(listingsitea_url) WHERE listingsitea_url IS NOT NULL;