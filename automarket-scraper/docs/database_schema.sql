-- PostgreSQL Schema for ListingSiteA Scraper AutoMarket
-- Generated from Sequelize models

drop table if exists listingsitea_adverts;
drop table if exists listingsitea_controls;
drop table if exists listingsitea_inventory;

-- Create listingsitea_adverts table
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


-- Create listingsitea_controls table
CREATE TABLE listingsitea_controls (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP
);



-- Create listingsitea_inventory table
CREATE TABLE listingsitea_inventory (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_listingsitea_adverts_make_model ON listingsitea_adverts(make, model);
CREATE INDEX idx_listingsitea_adverts_price ON listingsitea_adverts(price);
CREATE INDEX idx_listingsitea_adverts_is_active ON listingsitea_adverts(is_active);
CREATE INDEX idx_listingsitea_adverts_created_at ON listingsitea_adverts(created_at);

CREATE INDEX idx_listingsitea_inventory_seller_id ON listingsitea_inventory(seller_id);
CREATE INDEX idx_listingsitea_inventory_created_at ON listingsitea_inventory(created_at);

-- Add foreign key constraints (optional - uncomment if needed) 