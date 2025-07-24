#!/bin/bash

# Simple script to stop the database container

echo "🛑 Stopping Forgiveness Journey Database Container"
echo "================================================="

# Check if container exists
if docker ps -a --format "table {{.Names}}" | grep -q "forgiveness-db"; then
    echo "📦 Found database container"
    
    # Stop the container
    echo "🔄 Stopping container..."
    docker stop forgiveness-db
    
    echo "✅ Database container stopped"
    echo ""
    echo "💡 To start again, run: ./start-db.sh"
    echo "💡 To remove completely: docker rm forgiveness-db"
    echo "💡 To remove data volume: docker volume rm forgiveness_postgres_data"
else
    echo "❌ No database container found"
fi