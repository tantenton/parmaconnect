# Deployment Guide — VPS

## Overview

ParmaConnect is designed to run on a VPS with Docker Compose and a reverse proxy.

## Prerequisites

- VPS with Ubuntu 22.04+ (recommended 2 vCPU, 4GB RAM)
- Domain name pointing to VPS IP
- Docker + Docker Compose installed
- PostgreSQL 17 (can run in Docker or as separate service)

## Recommended Architecture

```
Internet → Nginx (reverse proxy, SSL termination) → ParmaConnect (Next.js)
                                                     ↓
                                              PostgreSQL (separate container or host)
```

## Step 1: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

## Step 2: Setup PostgreSQL

Option A — Separate container (recommended):
```bash
docker compose -f docker/docker-compose.prod.yml up postgres
```

Option B — Host PostgreSQL:
```bash
sudo apt install postgresql-17
# Create user and database per documentation
```

## Step 3: Configure Environment

On the VPS, create `.env`:

```bash
# Generate secrets
openssl rand -base64 32  # for SESSION_SECRET
openssl rand -base64 32  # for POSTGRES_PASSWORD

# Set values
POSTGRES_PASSWORD=your-generated-password
SESSION_SECRET=your-generated-secret
APP_URL=https://parmaconnect.yourdomain.com
NODE_ENV=production
DATABASE_URL=postgresql://parmaconnect:POSTGRES_PASSWORD@postgres:5432/parmaconnect
```

## Step 4: Build and Deploy

```bash
# Clone repository
git clone https://github.com/your-org/parmaconnect.git
cd parmaconnect

# Build
docker compose -f docker/docker-compose.prod.yml build

# Run migrations
docker compose -f docker/docker-compose.prod.yml run --rm web npx prisma migrate deploy

# Seed (optional, for demo)
docker compose -f docker/docker-compose.prod.yml run --rm web npx tsx prisma/seed.ts

# Start
docker compose -f docker/docker-compose.prod.yml up -d
```

## Step 5: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name parmaconnect.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name parmaconnect.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Step 6: SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d parmaconnect.yourdomain.com
```

## Step 7: Database Backup

See docs/backup-guide.md (placeholder — implement per deployment).

## Update Procedure

```bash
cd parmaconnect
git pull
docker compose -f docker/docker-compose.prod.yml build
docker compose -f docker/docker-compose.prod.yml up -d
```

## Monitoring

- Health check: `curl https://parmaconnect.yourdomain.com/api/health`
- View logs: `docker compose -f docker/docker-compose.prod.yml logs -f web`
- PostgreSQL logs: `docker compose -f docker/docker-compose.prod.yml logs -f postgres`