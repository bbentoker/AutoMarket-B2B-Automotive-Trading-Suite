-- ===============================================
-- PERFORMANCE INDEXES MIGRATION
-- Run this on existing database to add indexes
-- ===============================================

-- This file adds comprehensive indexes to optimize database performance
-- for the main tables: listings and listingsitea_adverts

-- LISTINGS TABLE INDEXES (Primary performance table)
-- Drop any existing conflicting indexes first (ignore errors if they don't exist)

-- Foreign key indexes for joins
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status_id ON listings(status_id);
CREATE INDEX IF NOT EXISTS idx_listings_assigned_to_id ON listings(assigned_to_id);

-- Single column indexes for common filters
CREATE INDEX IF NOT EXISTS idx_listings_is_deleted ON listings(is_deleted);
CREATE INDEX IF NOT EXISTS idx_listings_is_viewed ON listings(is_viewed);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_updated_at ON listings(updated_at);
CREATE INDEX IF NOT EXISTS idx_listings_brand_name ON listings(brand_name);
CREATE INDEX IF NOT EXISTS idx_listings_model ON listings(model);
CREATE INDEX IF NOT EXISTS idx_listings_listing_price ON listings(listing_price);
CREATE INDEX IF NOT EXISTS idx_listings_deal_stage ON listings(deal_stage);
CREATE INDEX IF NOT EXISTS idx_listings_zoho_id ON listings(zoho_id);

-- Composite indexes for common query patterns
-- Active listings by seller (most common pattern)
CREATE INDEX IF NOT EXISTS idx_listings_seller_active ON listings(seller_id, is_deleted, status_id);

-- Dashboard queries - unviewed reserved listings
CREATE INDEX IF NOT EXISTS idx_listings_status_viewed ON listings(status_id, is_viewed) WHERE status_id = 2;

-- Active listings for browsing (status 1 or 3, not deleted)
CREATE INDEX IF NOT EXISTS idx_listings_browse_active ON listings(status_id, is_deleted) WHERE status_id IN (1, 3);

-- Newsletter queries - active listings by creation date
CREATE INDEX IF NOT EXISTS idx_listings_newsletter ON listings(status_id, created_at, is_deleted) WHERE status_id IN (1, 3);

-- Seller's listings ordered by creation (common in user dashboard)
CREATE INDEX IF NOT EXISTS idx_listings_seller_created ON listings(seller_id, created_at DESC, is_deleted);

-- Brand and model searches
CREATE INDEX IF NOT EXISTS idx_listings_brand_model ON listings(brand_name, model, is_deleted, status_id);

-- Price range searches
CREATE INDEX IF NOT EXISTS idx_listings_price_active ON listings(listing_price, status_id, is_deleted);

-- LISTING_SITE_A_ADVERTS TABLE INDEXES (Second main performance table)
-- Primary listingsitea_adverts indexes
-- Note: Using regular index instead of unique due to potential duplicates in existing data
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_listingsitea_id ON listingsitea_adverts(listingsitea_id);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_seller_id ON listingsitea_adverts(seller_id);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_is_active ON listingsitea_adverts(is_active);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_created_at ON listingsitea_adverts(created_at);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_last_seen ON listingsitea_adverts(last_seen);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_make ON listingsitea_adverts(make);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_model ON listingsitea_adverts(model);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_price ON listingsitea_adverts(price);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_first_registration ON listingsitea_adverts(first_registration);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_location ON listingsitea_adverts(location);
CREATE INDEX IF NOT EXISTS idx_listingsitea_adverts_is_initial_run ON listingsitea_adverts(is_initial_run_listing);

-- Composite indexes for listingsitea_adverts
-- Active adverts by seller (most common pattern)
CREATE INDEX IF NOT EXISTS idx_listingsitea_seller_active ON listingsitea_adverts(seller_id, is_active);

-- Non-initial run active listings (default scope)
CREATE INDEX IF NOT EXISTS idx_listingsitea_active_non_initial ON listingsitea_adverts(is_initial_run_listing, is_active) WHERE is_initial_run_listing = false;

-- Make/model searches for active adverts
CREATE INDEX IF NOT EXISTS idx_listingsitea_make_model_active ON listingsitea_adverts(make, model, is_active);

-- Price range searches for active adverts
CREATE INDEX IF NOT EXISTS idx_listingsitea_price_active ON listingsitea_adverts(price, is_active, seller_id);

-- Recently added/updated adverts
CREATE INDEX IF NOT EXISTS idx_listingsitea_recent ON listingsitea_adverts(created_at DESC, is_active);

-- Location-based searches
CREATE INDEX IF NOT EXISTS idx_listingsitea_location_active ON listingsitea_adverts(location, is_active);

-- OTHER SUPPORTING TABLE INDEXES
-- Status updates (frequently queried for listing history)
CREATE INDEX IF NOT EXISTS idx_status_updates_listing_created ON status_updates(listing_id, created_at DESC);

-- Listing photos (for gallery loading)
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON listing_photos(listing_id);

-- User activities (for tracking and analytics)
CREATE INDEX IF NOT EXISTS idx_user_activities_user_listing ON user_activities(user_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_listing_date ON user_activities(listing_id, activity_date DESC);

-- Offers (for offer management)
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_dealer_id ON offers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing_created ON offers(listing_id, created_at DESC);

-- Saved listings (for user favorites)
CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_listing_id ON saved_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user_listing ON saved_listings(user_id, listing_id);

-- Invoices (for billing)
CREATE INDEX IF NOT EXISTS idx_invoices_dealer_id ON invoices(dealer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_listing_id ON invoices(listing_id);
CREATE INDEX IF NOT EXISTS idx_invoices_is_paid ON invoices(is_paid);

-- Users table additional indexes
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status_id ON users(status_id);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_listingsitea_url ON users(listingsitea_url) WHERE listingsitea_url IS NOT NULL;

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Performance indexes have been successfully added to the database!';
    RAISE NOTICE 'Tables optimized: listings, listingsitea_adverts, and supporting tables';
    RAISE NOTICE 'Query performance should be significantly improved.';
END $$;
