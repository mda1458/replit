-- Extensions setup for Forgiveness Journey Database
-- This script installs useful PostgreSQL extensions

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set up basic indexes and performance optimizations
-- These will be created after the main schema is loaded

-- Create a function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a function for generating short UUIDs
CREATE OR REPLACE FUNCTION generate_short_id(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars))::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Set timezone for the database
SET timezone TO 'UTC';

-- Basic database configuration
ALTER DATABASE forgiveness_journey SET log_statement = 'all';
ALTER DATABASE forgiveness_journey SET log_min_duration_statement = 1000;

-- Create a stats table for monitoring (optional)
CREATE TABLE IF NOT EXISTS db_stats (
    id SERIAL PRIMARY KEY,
    stat_name VARCHAR(100) NOT NULL,
    stat_value TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial stats
INSERT INTO db_stats (stat_name, stat_value) VALUES 
    ('database_initialized', 'true'),
    ('extensions_loaded', 'uuid-ossp,pg_trgm,btree_gin,pg_stat_statements'),
    ('init_date', CURRENT_TIMESTAMP::TEXT);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO forgiveness_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO forgiveness_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO forgiveness_user;