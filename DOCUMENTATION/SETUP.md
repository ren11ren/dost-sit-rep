# DOST Situation Reporting System - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 16+ with npm
- PostgreSQL 12+ (local or remote)
- Git
- Docker & Docker Compose (for containerized deployment)

### Installation (Development)

```bash
# Clone repository
git clone https://github.com/dost/sit-rep.git
cd dost-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5010
- Database: localhost:5432 (PostgreSQL)

---

## Environment Setup

### Development Environment

**Create `.env` file in project root:**

```bash
# Backend Server
PORT=5010
NODE_ENV=development
DOCKER_ENV=false

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dost_sitep
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dost_sitep

# Frontend
REACT_APP_API_PORT=5010
REACT_APP_API_URL=http://localhost:5010

# CORS Configuration
CORS_ALLOW_ALL=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5010

# Fallback Store
FALLBACK_STORE_PATH=./data/fallback-store.json
ALLOW_DEGRADED_DB_MODE=true
```

### Production Environment

```bash
# Backend Server
PORT=5010
NODE_ENV=production
DOCKER_ENV=true

# Database
DATABASE_URL=postgres://prod_user:secure_password@db-host:5432/dost_sitep

# CORS Configuration
CORS_ALLOW_ALL=false
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Fallback Store
FALLBACK_STORE_PATH=/var/data/fallback-store.json
ALLOW_DEGRADED_DB_MODE=false
```

---

## Database Setup

### Local PostgreSQL Setup

#### Option 1: Docker Container (Recommended)

```bash
# Create PostgreSQL container
docker run --name dost-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dost_sitep \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:15

# Verify connection
psql -U postgres -d dost_sitep -h localhost
```

#### Option 2: System PostgreSQL

```bash
# Create database
createdb -U postgres dost_sitep

# Create user (optional, if using different credentials)
createuser -U postgres dost_user --pwprompt
```

### Initialize Schema

The database schema is **automatically initialized** on first backend startup if the tables don't exist.

To manually initialize:

```bash
# Connect to database
psql -U postgres -d dost_sitep < database/schema.sql

# (Optional) Load seed data
psql -U postgres -d dost_sitep < database/seed.sql
```

**Seed Data Includes:**
- Default admin user: `admin@dostregion1.ph` / `admin123`
- Test office data for all DOST regions
- Sample event data

---

## Local Development Workflow

### Start Development Servers

```bash
# Terminal 1: Start both frontend and backend
npm run dev

# Output:
# [0] 🚀 Server running on port 5010
# [1] Compiled successfully!
# [1] You can now view the app in the browser
```

### Login with Test Users

Access http://localhost:3000 and use test credentials:

**Admin User:**
- Email: `admin@dostregion1.ph`
- Password: `admin123`

**Field Staff:**
- Email: `staff@dostregion1.ph`
- Password: `staff123`

### Test Data

Initial test data is loaded from `database/seed.sql`:

```sql
-- Sample offices
DOST-Ilocos Norte
DOST-Ilocos Sur
DOST-La Union
DOST-Pangasinan
DOST-Ilocos Sur - FO
DOST-Pangasinan - FO
DOST-Ilocos Region
```

---

## Docker Deployment

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**docker-compose.yml includes:**
- PostgreSQL database
- Node.js backend (Express)
- React frontend (Nginx)
- Network isolation
- Volume mounts for persistence

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Monitor services
docker ps
docker stats
```

**docker-compose.prod.yml includes:**
- Nginx reverse proxy
- Environment-specific config
- Health checks
- Resource limits
- Restart policies

### Manual Docker Build

```bash
# Build frontend
docker build -t dost-frontend:latest \
  --build-arg REACT_APP_API_PORT=5010 \
  -f Dockerfile.frontend .

# Build backend
docker build -t dost-backend:latest -f Dockerfile.backend .

# Run containers
docker run -d -p 5010:5010 \
  -e DATABASE_URL=postgres://... \
  dost-backend:latest

docker run -d -p 80:3000 dost-frontend:latest
```

---

## Build & Deployment

### Production Build

```bash
# Build frontend bundle
npm run build

# Output: build/ directory with optimized files
# Size: ~300KB gzipped (production)
```

### Deploy to Server

#### Option 1: Direct SSH Deployment

```bash
# On local machine
npm run build
tar czf build.tar.gz build/

# Upload to server
scp build.tar.gz user@server:/var/www/dost-frontend/

# On server
cd /var/www/dost-frontend
tar xzf build.tar.gz
nginx -s reload  # Reload Nginx if using
```

#### Option 2: Git-Based Deployment

```bash
# On server (bare repository)
git clone --bare https://github.com/dost/sit-rep.git repo.git

# Add post-receive hook
cat > repo.git/hooks/post-receive << 'EOF'
#!/bin/bash
GIT_WORK_TREE=/var/www/dost-frontend git checkout -f
cd /var/www/dost-frontend
npm install
npm run build
systemctl restart dost-app
EOF

chmod +x repo.git/hooks/post-receive

# On local machine
git push deploy master  # Triggers deploy
```

#### Option 3: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - run: npm install
    - run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/dost-frontend
          git pull
          npm install --production
          npm run build
          sudo systemctl restart dost-app
```

---

## Nginx Configuration

### Reverse Proxy Setup

```nginx
# /etc/nginx/sites-available/dost

upstream backend {
    server localhost:5010;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS (if using SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Frontend
    location / {
        root /var/www/dost-frontend/build;
        try_files $uri /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/dost /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Manual Certificate Installation

```bash
# Place certificate files
cp /path/to/cert.pem /etc/ssl/certs/
cp /path/to/key.pem /etc/ssl/private/

# Update Nginx config
ssl_certificate /etc/ssl/certs/cert.pem;
ssl_certificate_key /etc/ssl/private/key.pem;
```

---

## Systemd Service Configuration

Create `/etc/systemd/system/dost-app.service`:

```ini
[Unit]
Description=DOST Situation Reporting Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dost-frontend
ExecStart=/usr/bin/node /var/www/dost-frontend/server.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment=NODE_ENV=production
Environment=PORT=5010
EnvironmentFile=/var/www/dost-frontend/.env

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dost-app
sudo systemctl start dost-app
sudo systemctl status dost-app
```

---

## Monitoring & Logs

### Check Service Status

```bash
# Systemd
sudo systemctl status dost-app

# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Direct logs
tail -f ~/.pm2/logs/dost-app-error.log
```

### Monitor Performance

```bash
# Check server resources
htop
docker stats

# Check database
psql -U postgres -d dost_sitep -c "SELECT COUNT(*) FROM events;"

# Check disk usage
df -h
du -sh /var/www/dost-frontend
```

---

## Backup & Recovery

### Database Backup

```bash
# Full backup
pg_dump -U postgres dost_sitep > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -U postgres dost_sitep | gzip > backup.sql.gz

# Backup schedule (cron)
0 2 * * * pg_dump -U postgres dost_sitep | gzip > /backups/dost_$(date +\%Y\%m\%d).sql.gz
```

### Database Restore

```bash
# Restore from backup
psql -U postgres dost_sitep < backup_20260715_143000.sql

# Restore from compressed
gunzip < backup.sql.gz | psql -U postgres dost_sitep
```

### Application Backup

```bash
# Backup entire application
tar czf dost-app-backup-$(date +%Y%m%d).tar.gz \
  /var/www/dost-frontend \
  /var/data/fallback-store.json

# Off-site backup
scp dost-app-backup-*.tar.gz backup@backup-server:/backups/
```

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 5010
lsof -i :5010

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=5011 npm run dev
```

**Database Connection Error**
```bash
# Test connection
psql -U postgres -d dost_sitep -h localhost

# Check PostgreSQL service
sudo systemctl status postgresql

# Check credentials in .env
cat .env | grep DATABASE
```

**CORS Errors**
```bash
# Verify CORS_ALLOWED_ORIGINS includes frontend URL
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Restart backend
npm run dev
```

**npm install Fails**
```bash
# Clear cache
npm cache clean --force

# Update npm
npm install -g npm@latest

# Retry
npm install
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Node debugger
node --inspect server.js
# Then open chrome://inspect in Chrome
```

---

## Performance Tuning

### Frontend Optimization

```bash
# Analyze bundle size
npm run analyze
# or use: npx source-map-explorer 'build/static/js/*.js'

# Production build optimization
NODE_ENV=production npm run build

# Enable gzip compression in Nginx
gzip on;
gzip_types text/plain application/json;
gzip_min_length 1000;
```

### Backend Optimization

```javascript
// server.js - Connection pooling config
const pool = new Pool({
  max: 20,           // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Database Optimization

```sql
-- Create indexes for slow queries
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_offices_name ON offices(office_name);

-- Vacuum and analyze
VACUUM ANALYZE;
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS/SSL
- [ ] Set strong database password
- [ ] Restrict database IP access
- [ ] Enable firewall (ufw, iptables)
- [ ] Regular security updates (`apt upgrade`)
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Monitor access logs
- [ ] Set up alerts for errors

---

## Maintenance

### Regular Tasks

```bash
# Weekly: Check logs
grep -i error /var/log/dost-app.log | tail -100

# Monthly: Database maintenance
psql -U postgres dost_sitep -c "VACUUM ANALYZE;"

# Monthly: Backup verification
tar tzf dost-app-backup-*.tar.gz | head -20

# Quarterly: Security updates
sudo apt update && sudo apt upgrade
npm audit fix
```

