#!/bin/bash

# Health check script for PostgreSQL container
# Returns 0 if healthy, 1 if unhealthy

# Set default values
POSTGRES_USER=${POSTGRES_USER:-forgiveness_user}
POSTGRES_DB=${POSTGRES_DB:-forgiveness_journey}

# Check if PostgreSQL is accepting connections
if ! pg_isready -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    echo "PostgreSQL is not accepting connections"
    exit 1
fi

# Check if we can execute a simple query
if ! psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "Cannot execute queries on PostgreSQL"
    exit 1
fi

# Check if the main tables exist (optional - comment out if not needed)
# if ! psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'users';" >/dev/null 2>&1; then
#     echo "Main application tables not found"
#     exit 1
# fi

echo "PostgreSQL is healthy"
exit 0