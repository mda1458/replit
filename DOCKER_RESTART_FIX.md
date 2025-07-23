# Docker Container Restart Issues - Fixed

## Root Causes Identified and Fixed

### 1. Database Connection Authentication
**Issue**: Backend couldn't authenticate with PostgreSQL
**Fix**: Added PGPASSWORD environment variable to pg_isready check
```bash
PGPASSWORD="$DB_PASSWORD" pg_isready -h database -p 5432 -U forgiveness_user -d forgiveness_journey
```

### 2. Health Check Command Missing
**Issue**: Backend health check using `curl` which might not be available in Alpine Linux
**Fix**: Changed to `wget` which is more commonly available
```dockerfile
CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1
```

### 3. Nginx Proxy Timeouts
**Issue**: Nginx not handling backend/frontend connection failures gracefully
**Fix**: Added proper timeout settings and error handling
```nginx
proxy_connect_timeout 30s;
proxy_send_timeout 30s;
proxy_read_timeout 30s;
proxy_intercept_errors on;
error_page 502 503 504 /50x.html;
```

### 4. Missing Error Page
**Issue**: Nginx referencing error page that didn't exist
**Fix**: Created `50x.html` error page and included it in frontend build

## Additional Stability Improvements

### Container Dependencies
The docker-compose.yml already has proper depends_on relationships:
- backend depends on database
- frontend depends on backend  
- nginx depends on both frontend and backend

### Health Checks
- Backend: Checks /api/health endpoint every 30s
- Database: Built-in PostgreSQL health monitoring
- Frontend: Nginx serves static files (inherently healthy)

### Network Configuration
- All containers on shared `forgiveness-network`
- Proper inter-container communication via service names
- Isolated from host network for security

## Expected Behavior After Fix

1. **Database** starts first and initializes
2. **Backend** waits for database, runs migrations, starts API server
3. **Frontend** builds React app and serves with Nginx
4. **Nginx Reverse Proxy** routes traffic between services
5. **Health checks** monitor all services continuously

## Test the Fix
```bash
# Rebuild with fixes
docker-compose build --no-cache

# Start services and monitor logs
docker-compose up -d
docker-compose logs -f

# Check service status
docker-compose ps

# Test health endpoints
curl http://localhost/health        # Nginx health
curl http://localhost/api/health    # Backend health
```

The containers should now start and remain stable without restart loops!