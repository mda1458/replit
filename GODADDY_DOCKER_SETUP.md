# GoDaddy cPanel Docker Deployment - Step by Step

## Prerequisites
- GoDaddy hosting with Docker support enabled
- Your domain pointing to the server
- SSH/Terminal access to your cPanel

## Quick Deployment Steps

### 1. Upload Docker Package
Create the deployment package on your local machine:
```bash
# Create tar file with all necessary files
tar -czf forgiveness-journey.tar.gz \
  docker-compose.yml \
  Dockerfile.backend \
  Dockerfile.frontend \
  nginx.conf \
  nginx-frontend.conf \
  init-db.sql \
  docker-entrypoint.sh \
  .env.production \
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

### 2. Upload to GoDaddy
1. **Via cPanel File Manager**:
   - Upload `forgiveness-journey.tar.gz` to your domain's root directory
   - Extract the archive in File Manager

2. **Via SSH** (if available):
   ```bash
   scp forgiveness-journey.tar.gz username@your-server.com:~/
   ssh username@your-server.com
   tar -xzf forgiveness-journey.tar.gz
   ```

### 3. Configure Environment
Edit `.env.production` with your actual values:
```bash
# Copy template
cp .env.production .env

# Edit with your values
nano .env
```

Required values:
```
OPENAI_API_KEY=your_actual_openai_key
STRIPE_SECRET_KEY=your_actual_stripe_secret
VITE_STRIPE_PUBLIC_KEY=your_actual_stripe_public
DOMAIN=forgiveness.info
```

### 4. Deploy with Docker
```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Test Your Deployment
- **Health Check**: `curl http://your-domain.com/api/health`
- **Frontend**: Visit `http://your-domain.com`
- **Backend API**: Visit `http://your-domain.com/api/`

## Important GoDaddy-Specific Notes

### Domain Configuration
Make sure your domain DNS points to your server:
```
A Record: @ → Your Server IP
A Record: www → Your Server IP
```

### Port Configuration
GoDaddy may require specific ports. Update `docker-compose.yml` if needed:
```yaml
nginx:
  ports:
    - "80:80"      # HTTP
    - "443:443"    # HTTPS
    - "8080:80"    # Alternative HTTP port
```

### SSL Certificates
For HTTPS, add your SSL certificates:
```bash
mkdir ssl/
# Upload your certificates to ssl/ directory
# ssl/fullchain.pem
# ssl/privkey.pem
```

### Resource Limits
GoDaddy hosting may have resource limits. Add to `docker-compose.yml`:
```yaml
services:
  database:
    deploy:
      resources:
        limits:
          memory: 512M
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
```

## Troubleshooting

### Common Issues

**"Permission Denied" Errors**:
```bash
chmod +x docker-entrypoint.sh
sudo chown -R $USER:$USER .
```

**"Port Already in Use"**:
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80
# Stop conflicting services or change ports
```

**Database Connection Issues**:
```bash
# Check database logs
docker-compose logs database
# Ensure database is healthy
docker-compose exec database pg_isready -U forgiveness_user
```

**Frontend Build Failures**:
```bash
# Check build logs
docker-compose logs frontend
# Rebuild with more memory
docker-compose build --memory=2g frontend
```

### Monitoring Commands
```bash
# Check all service status
docker-compose ps

# View resource usage
docker stats

# Check logs
docker-compose logs -f --tail=100

# Restart specific service
docker-compose restart backend
```

## Updating Your App
When you make changes:
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Or for zero-downtime deployment
docker-compose up -d --no-deps --build backend
```

## Backup Strategy
```bash
# Backup database
docker-compose exec database pg_dump -U forgiveness_user forgiveness_journey > backup-$(date +%Y%m%d).sql

# Backup uploaded files (if any)
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

Your Forgiveness Journey app will be live at `http://forgiveness.info` with all features working:
- ✅ User authentication
- ✅ AI-powered guidance  
- ✅ Payment processing
- ✅ Database persistence
- ✅ Mobile-responsive design
- ✅ Privacy compliance

Perfect for production use! 🚀