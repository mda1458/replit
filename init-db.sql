-- Database initialization for Forgiveness Journey
-- This file sets up the initial database schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'forgiveness_user') THEN
        CREATE ROLE forgiveness_user LOGIN PASSWORD 'secure_password_123';
    END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE forgiveness_journey TO forgiveness_user;
GRANT ALL ON SCHEMA public TO forgiveness_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO forgiveness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO forgiveness_user;

-- Note: The actual table creation will be handled by Drizzle ORM
-- This file just sets up the basic database structure and permissions