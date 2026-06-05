-- New unified listings table structure
-- This table combines the original listings table with all translation fields
-- Eliminates the need for a separate listing_translations table

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    
    -- Original listing fields
    seller_id INTEGER,
    horsepower VARCHAR(50),
    registration_number VARCHAR(50),
    deal_stage VARCHAR(100),
    first_registration DATE,
    km_stand INTEGER,
    vin_number VARCHAR(100),
    internal_url TEXT,
    listing_price DECIMAL(10, 2),
    status_id INTEGER,
    assigned_to_id INTEGER,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Translation fields (previously in listing_translations table)
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
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_listings_status_id ON listings(status_id);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_is_deleted ON listings(is_deleted);
CREATE INDEX idx_listings_created_at ON listings(created_at);

-- Add foreign key constraints (assuming these tables exist)
-- ALTER TABLE listings ADD CONSTRAINT fk_listings_status FOREIGN KEY (status_id) REFERENCES statuses(id);
-- ALTER TABLE listings ADD CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users(id);
-- ALTER TABLE listings ADD CONSTRAINT fk_listings_assigned FOREIGN KEY (assigned_to_id) REFERENCES users(id); 