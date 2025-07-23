#!/bin/bash
set -e

# Docker entrypoint script for Forgiveness Journey
echo "🚀 Starting Forgiveness Journey Production Deployment..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until PGPASSWORD="$DB_PASSWORD" pg_isready -h database -p 5432 -U forgiveness_user -d forgiveness_journey; do
  echo "Database is unavailable - sleeping for 2 seconds"
  sleep 2
done
echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npx drizzle-kit push

# Start the application
echo "🎯 Starting Forgiveness Journey backend..."
exec tsx server/index.ts