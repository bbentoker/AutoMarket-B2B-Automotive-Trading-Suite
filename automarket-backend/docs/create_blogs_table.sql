-- Create blogs table
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    read_time VARCHAR(20) NOT NULL,
    image TEXT, -- Store base64 images
    slug VARCHAR(255) NOT NULL UNIQUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT,
    author_id INTEGER ,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE UNIQUE INDEX blogs_slug_unique ON blogs(slug);
CREATE INDEX blogs_category_index ON blogs(category);
CREATE INDEX blogs_featured_index ON blogs(featured);
CREATE INDEX blogs_is_published_index ON blogs(is_published);
CREATE INDEX blogs_author_id_index ON blogs(author_id);
CREATE INDEX blogs_date_index ON blogs(date);
CREATE INDEX blogs_created_at_index ON blogs(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row changes
CREATE TRIGGER update_blogs_updated_at 
    BEFORE UPDATE ON blogs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the table structure
COMMENT ON TABLE blogs IS 'Blog posts for the car sales platform';
COMMENT ON COLUMN blogs.id IS 'Primary key, auto-incrementing blog ID';
COMMENT ON COLUMN blogs.title IS 'Blog post title';
COMMENT ON COLUMN blogs.excerpt IS 'Short description/summary of the blog post';
COMMENT ON COLUMN blogs.category IS 'Blog category (e.g., Market Trends, Industry News)';
COMMENT ON COLUMN blogs.date IS 'Publication date';
COMMENT ON COLUMN blogs.read_time IS 'Estimated reading time (e.g., "5 min read")';
COMMENT ON COLUMN blogs.image IS 'Featured image URL/path';
COMMENT ON COLUMN blogs.slug IS 'URL-friendly version of the title';
COMMENT ON COLUMN blogs.featured IS 'Whether the blog is featured/highlighted';
COMMENT ON COLUMN blogs.content IS 'Full blog post content';
COMMENT ON COLUMN blogs.author_id IS 'Foreign key to users table (blog author)';
COMMENT ON COLUMN blogs.is_published IS 'Whether the blog is published and visible';
COMMENT ON COLUMN blogs.created_at IS 'Timestamp when the blog was created';
COMMENT ON COLUMN blogs.updated_at IS 'Timestamp when the blog was last updated';

-- Optional: Insert sample data
INSERT INTO blogss (
    title, 
    excerpt, 
    category, 
    date, 
    read_time, 
    image, 
    slug, 
    featured, 
    content, 
    author_id, 
    is_published
) VALUES 
(
    'The Future of Cross-Border Car Trading in Europe',
    'Exploring how digital platforms are revolutionizing the way dealerships source vehicles across European markets.',
    'Market Trends',
    '2024-01-15',
    '5 min read',
    '/premium-sports-cars-showroom.jpeg',
    'future-cross-border-car-trading-europe',
    TRUE,
    'The automotive industry in Europe is experiencing a digital transformation that is reshaping how dealerships operate and source vehicles. Cross-border car trading has become increasingly popular as dealers seek to expand their inventory and offer customers more diverse options. This comprehensive guide explores the current trends, challenges, and opportunities in the European car trading market.',
    1,
    TRUE
),
(
    'Electric Vehicles: Market Analysis 2024',
    'An in-depth analysis of the growing electric vehicle market across Europe and its impact on traditional car dealerships.',
    'Industry News',
    '2024-01-20',
    '7 min read',
    '/electric-cars-charging.jpg',
    'electric-vehicles-market-analysis-2024',
    FALSE,
    'The electric vehicle (EV) market in Europe has seen unprecedented growth over the past few years. With government incentives, environmental concerns, and technological advancements driving adoption, traditional car dealerships must adapt to this changing landscape. This analysis examines current market trends, consumer behavior, and the future outlook for EV sales in Europe.',
    2,
    TRUE
),
(
    'Top 10 Luxury Cars for 2024',
    'Discover the most luxurious vehicles hitting the European market this year, featuring cutting-edge technology and premium craftsmanship.',
    'Car Reviews',
    '2024-01-25',
    '8 min read',
    '/luxury-cars-2024.jpg',
    'top-10-luxury-cars-for-2024',
    TRUE,
    'The luxury car segment continues to evolve with innovative features, sustainable technologies, and exceptional performance. Our comprehensive review of the top 10 luxury vehicles for 2024 covers everything from traditional premium brands to emerging electric luxury manufacturers.',
    3,
    TRUE
);

-- Show table structure
\d blogs; 