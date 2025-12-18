-- Create attractions table with PostGIS support
-- Prerequisites: PostgreSQL 14+ with PostGIS extension enabled
-- Enable extension: CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location GEOMETRY(POINT, 4326) NOT NULL,  -- PostGIS geometry (lat/lon, WGS84)
    category VARCHAR(50) NOT NULL CHECK (category IN
        ('Historical', 'Nature', 'Cultural', 'Food', 'Entertainment', 'Shopping')),
    rating FLOAT CHECK (rating >= 0 AND rating <= 5),
    visit_duration_minutes INT NOT NULL CHECK (visit_duration_minutes > 0),
    photo_urls TEXT[],  -- Array of image URLs
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',  -- Additional flexible data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_attractions_city_code ON attractions(city_code);
CREATE INDEX IF NOT EXISTS idx_attractions_category ON attractions(category);
CREATE INDEX IF NOT EXISTS idx_attractions_location ON attractions USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_attractions_rating ON attractions(rating DESC NULLS LAST);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_attractions_updated_at
    BEFORE UPDATE ON attractions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE attractions IS 'Points of interest for driving routes in EU cities';
COMMENT ON COLUMN attractions.city_code IS 'Short city identifier (e.g., LON, PAR, ROM)';
COMMENT ON COLUMN attractions.location IS 'Geographic coordinates (PostGIS Point geometry, SRID 4326 = WGS84)';
COMMENT ON COLUMN attractions.visit_duration_minutes IS 'Estimated time to visit attraction';
COMMENT ON COLUMN attractions.metadata IS 'Additional data (opening hours, contact info, etc.)';
