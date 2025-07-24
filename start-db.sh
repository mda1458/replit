#!/bin/bash

# Simple script to start the database container
# Works on Mac, Linux, and Windows with Docker installed

echo "🗄️  Starting Forgiveness Journey Database Container"
echo "=================================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if container already exists
if docker ps -a --format "table {{.Names}}" | grep -q "forgiveness-db"; then
    echo "📦 Container already exists. Stopping and removing..."
    docker stop forgiveness-db >/dev/null 2>&1
    docker rm forgiveness-db >/dev/null 2>&1
fi

# Start the database container
echo "🚀 Starting PostgreSQL database container..."

docker run -d \
  --name forgiveness-db \
  --restart always \
  -e POSTGRES_DB=forgiveness_journey \
  -e POSTGRES_USER=forgiveness_user \
  -e POSTGRES_PASSWORD=secure_password_123 \
  -p 5432:5432 \
  -v forgiveness_postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Wait for container to start
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if container is running
if docker ps --format "table {{.Names}}" | grep -q "forgiveness-db"; then
    echo "✅ Database container is running!"

    # Wait for PostgreSQL to be ready
    echo "🔄 Waiting for PostgreSQL to accept connections..."
    for i in {1..30}; do
        if docker exec forgiveness-db pg_isready -U forgiveness_user -d forgiveness_journey >/dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            break
        fi
        echo "   Attempt $i/30 - waiting..."
        sleep 2
    done

    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL did not start properly. Check logs:"
        docker logs forgiveness-db
        exit 1
    fi

    echo ""
    echo "🎉 Database is ready!"
    echo "=========================="
    echo "📋 Connection Details:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: forgiveness_journey"
    echo "   User: forgiveness_user"
    echo "   Password: secure_password_123"
    echo ""
    echo "📌 Connection String:"
    echo "   postgresql://forgiveness_user:secure_password_123@localhost:5432/forgiveness_journey"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Check status:  docker ps | grep forgiveness-db"
    echo "   View logs:     docker logs forgiveness-db -f"
    echo "   Connect:       docker exec -it forgiveness-db psql -U forgiveness_user -d forgiveness_journey"
    echo "   Stop:          docker stop forgiveness-db"
    echo "   Remove:        docker rm forgiveness-db"
    echo ""

else
    echo "❌ Failed to start database container"
    echo "Check Docker logs:"
    docker logs forgiveness-db
    exit 1
fi
