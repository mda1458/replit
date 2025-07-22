# Docker Deployment Guide for GoDaddy cPanel

## Overview
This Docker Compose setup packages your complete Forgiveness Journey application with:
- **Frontend**: React app with Nginx
- **Backend**: Node.js/Express server  
- **Database**: PostgreSQL
- **Reverse Proxy**: Nginx for routing

## Quick Start

### 1. Prepare Environment Variables
Copy and customize the environment file:
```bash
cp .env.production .env
```

Edit `.env` with your actual values:
```bash
# Required API Keys
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
VITE_STRIPE_PUBLIC_KEY=pk_live_your-stripe-public
SENDGRID_API_KEY=SG.your-sendgrid-key

# Domain Configuration
DOMAIN=forgiveness.info
REPLIT_DOMAINS=forgiveness.info

# Security
SESSION_SECRET=your-long-random-session-secret-32-chars-minimum
DB_PASSWORD=your-secure-database-password
```

### 2. Build and Start
```bash
# Build all services
docker-compose build

# Start in detached mode
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Verify Deployment
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health  
- **Full App**: http://localhost (via Nginx)
- **Database**: localhost:5432

## GoDaddy cPanel Deployment

### Method 1: Docker Hub Images
1. **Build and push images**:
```bash
# Build and tag images
docker build -t your-dockerhub/forgiveness-frontend -f Dockerfile.frontend .
docker build -t your-dockerhub/forgiveness-backend -f Dockerfile.backend .

# Push to Docker Hub
docker push your-dockerhub/forgiveness-frontend
docker push your-dockerhub/forgiveness-backend
```

2. **Update docker-compose.yml** to use your images:
```yaml
services:
  frontend:
    image: your-dockerhub/forgiveness-frontend
  backend:
    image: your-dockerhub/forgiveness-backend
```

3. **Deploy in GoDaddy cPanel**:
   - Upload `docker-compose.yml` and `.env`
   - Run: `docker-compose up -d`

### Method 2: Full Package Upload
1. **Create deployment package**:
```bash
# Create tar file with all necessary files
tar -czf forgiveness-journey-docker.tar.gz \
  docker-compose.yml \
  Dockerfile.backend \
  Dockerfile.frontend \
  nginx.conf \
  nginx-frontend.conf \
  init-db.sql \
  .env \
  server/ \
  client/ \
  shared/ \
  package.json \
  package-lock.json \
  tsconfig.json \
  drizzle.config.ts \
  vite.config.ts \
  tailwind.config.ts \
  postcss.config.js \
  components.json
```

2. **Upload and extract in cPanel**:
```bash
# Extract files
tar -xzf forgiveness-journey-docker.tar.gz

# Build and start
docker-compose up -d
```

## Production Configuration

### SSL Certificates
Add SSL certificates to enable HTTPS:
```bash
mkdir ssl/
# Add your SSL certificate files:
# ssl/fullchain.pem
# ssl/privkey.pem
```

### Domain Configuration
Update `nginx.conf` with your actual domain:
```nginx
server_name your-domain.com www.your-domain.com;
```

### Resource Limits
For production, add resource limits in `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Health Checks
```bash
# Check service health
docker-compose exec backend curl http://localhost:5000/api/health
docker-compose exec frontend curl http://localhost:3000

# Database connection
docker-compose exec database psql -U forgiveness_user -d forgiveness_journey -c "SELECT version();"
```

### Backup Database
```bash
# Create backup
docker-compose exec database pg_dump -U forgiveness_user forgiveness_journey > backup.sql

# Restore backup
docker-compose exec -T database psql -U forgiveness_user forgiveness_journey < backup.sql
```

### Updates and Restarts
```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose restart

# Full rebuild
docker-compose down
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Common Issues

**Database Connection Failed**:
```bash
# Check database status
docker-compose exec database pg_isready -U forgiveness_user

# Reset database
docker-compose down database
docker volume rm $(docker volume ls -q | grep postgres)
docker-compose up -d database
```

**Frontend Not Loading**:
```bash
# Check build logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

**Backend API Errors**:
```bash
# Check environment variables
docker-compose exec backend env | grep -E "(DATABASE_URL|OPENAI|STRIPE)"

# Restart backend
docker-compose restart backend
```

### Performance Optimization
- Use Redis for session storage in high-traffic scenarios
- Enable Nginx caching for static assets
- Configure database connection pooling
- Set up monitoring with Prometheus/Grafana

## Security Considerations

1. **Change default passwords**
2. **Use strong session secrets**
3. **Keep API keys secure**
4. **Enable firewall rules**
5. **Regular security updates**
6. **Monitor access logs**

Your Forgiveness Journey app is now ready for production deployment! 🚀