#!/bin/bash
set -e

# Custom PostgreSQL Docker entrypoint for Forgiveness Journey
echo "🗄️  Starting Forgiveness Journey Database Container"
echo "=================================================="

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if we're being called as postgres user
if [ "$(id -u)" != "999" ]; then
    log "ERROR: This script must be run as postgres user (UID 999)"
    exit 1
fi

# Set default environment variables if not provided
export POSTGRES_DB=${POSTGRES_DB:-forgiveness_journey}
export POSTGRES_USER=${POSTGRES_USER:-forgiveness_user}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-secure_password_123}

log "Database: $POSTGRES_DB"
log "User: $POSTGRES_USER"

# Create data directory if it doesn't exist
if [ ! -d "/var/lib/postgresql/data" ]; then
    log "Creating PostgreSQL data directory..."
    mkdir -p /var/lib/postgresql/data
    chmod 700 /var/lib/postgresql/data
fi

# Initialize database if data directory is empty
if [ ! -s "/var/lib/postgresql/data/PG_VERSION" ]; then
    log "Initializing PostgreSQL database..."
    
    initdb --username=postgres \
           --pwfile=<(echo "$POSTGRES_PASSWORD") \
           --auth-local=scram-sha-256 \
           --auth-host=scram-sha-256 \
           --encoding=UTF8 \
           --locale=C \
           --data-checksums \
           /var/lib/postgresql/data
    
    log "Database initialized successfully!"
    
    # Start temporary PostgreSQL server for setup
    log "Starting temporary PostgreSQL server for initial setup..."
    pg_ctl -D /var/lib/postgresql/data -l /var/log/postgresql/init.log start
    
    # Wait for server to be ready
    until pg_isready -h localhost -p 5432; do
        log "Waiting for PostgreSQL to be ready..."
        sleep 1
    done
    
    # Create database and user
    log "Creating database and user..."
    psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
        CREATE DATABASE $POSTGRES_DB;
        CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
        GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
        ALTER USER $POSTGRES_USER CREATEDB;
        
        -- Grant superuser privileges for setup (will be revoked later)
        ALTER USER $POSTGRES_USER WITH SUPERUSER;
EOSQL
    
    # Run initialization scripts
    if [ -d "/docker-entrypoint-initdb.d" ]; then
        log "Running initialization scripts..."
        for f in /docker-entrypoint-initdb.d/*; do
            case "$f" in
                *.sql)    log "Running $f"; psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER --dbname $POSTGRES_DB -f "$f"; echo ;;
                *.sql.gz) log "Running $f"; gunzip -c "$f" | psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER --dbname $POSTGRES_DB; echo ;;
                *.sh)     log "Running $f"; . "$f" ;;
                *)        log "Ignoring $f" ;;
            esac
        done
    fi
    
    # Revoke superuser privileges for security
    log "Securing database user permissions..."
    psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
        ALTER USER $POSTGRES_USER WITH NOSUPERUSER;
EOSQL
    
    # Stop temporary server
    log "Stopping temporary server..."
    pg_ctl -D /var/lib/postgresql/data stop
    
    log "Database setup completed!"
fi

# Copy configuration files if they exist
if [ -f "/etc/postgresql/postgresql.conf" ]; then
    log "Using custom PostgreSQL configuration..."
    cp /etc/postgresql/postgresql.conf /var/lib/postgresql/data/postgresql.conf
fi

if [ -f "/etc/postgresql/pg_hba.conf" ]; then
    log "Using custom authentication configuration..."
    cp /etc/postgresql/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
fi

# Create log directory
mkdir -p /var/log/postgresql
chmod 755 /var/log/postgresql

log "Starting PostgreSQL server..."
log "Configuration file: /var/lib/postgresql/data/postgresql.conf"
log "Data directory: /var/lib/postgresql/data"
log "Log directory: /var/log/postgresql"

# Start PostgreSQL with custom configuration
exec postgres -D /var/lib/postgresql/data -c config_file=/var/lib/postgresql/data/postgresql.conf