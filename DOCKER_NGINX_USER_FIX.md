# Docker Nginx User Fix

## Issue Fixed
The Docker build was failing because the `nginx` group already exists in the `nginx:alpine` base image, causing a conflict when trying to create it again.

## Solution Applied
Changed from:
```dockerfile
RUN addgroup -g 1001 -S nginx && \
    adduser -S forgiveness -u 1001 -G nginx
```

To:
```dockerfile
RUN adduser -S forgiveness -u 1001 -G nginx
```

## Why This Works
- The `nginx:alpine` image already has a `nginx` group
- We only need to create the `forgiveness` user and add it to the existing `nginx` group
- This maintains security while avoiding the group conflict

## Test the Build
```bash
# Build frontend container
docker-compose build frontend

# Or build all services
docker-compose build

# Start services
docker-compose up -d
```

Your Docker build should now complete successfully without user/group conflicts.