# Server Setup Guide for NEIC Election Commission Portal

## 📋 Overview

This guide provides step-by-step instructions for setting up a production server for the Bangladesh Election Commission Portal (`neic-bd.org`). The setup includes Docker installation, NGINX configuration, domain setup, and complete system preparation.

## 🎯 Prerequisites

- Ubuntu 20.04 LTS or newer (recommended)
- Root or sudo access
- Minimum 4GB RAM, 50GB storage
- Domain name: `neic-bd.org` (or your domain)

---

## 🧹 Step 1: System Cleanup (Remove Previous Versions)

### 1.1 Remove Old Docker Installations

```bash
# Stop all running containers
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true

# Remove all containers
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# Remove all images
sudo docker rmi $(sudo docker images -q) 2>/dev/null || true

# Remove all volumes
sudo docker volume rm $(sudo docker volume ls -q) 2>/dev/null || true

# Remove all networks
sudo docker network rm $(sudo docker network ls -q) 2>/dev/null || true

# Complete system cleanup
sudo docker system prune -a -f --volumes

# Remove old Docker packages
sudo apt-get remove -y docker docker-engine docker.io containerd runc
sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 1.2 Remove Old NGINX Installations

```bash
# Stop NGINX
sudo systemctl stop nginx

# Remove NGINX
sudo apt-get remove -y nginx nginx-common nginx-core
sudo apt-get purge -y nginx nginx-common nginx-core

# Remove NGINX directories
sudo rm -rf /etc/nginx
sudo rm -rf /var/www/html
sudo rm -rf /var/log/nginx
```

### 1.3 Clean System

```bash
# Update package list
sudo apt-get update

# Clean package cache
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove -y

# Clean temporary files
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Clean logs
sudo journalctl --vacuum-time=7d
```

---

## 🐳 Step 2: Install Docker

### 2.1 Install Docker Engine

```bash
# Update package index
sudo apt-get update

# Install required packages
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
sudo apt-get update

# Install Docker Engine
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 2.2 Configure Docker

```bash
# Create Docker daemon configuration
sudo mkdir -p /etc/docker

# Configure Docker daemon
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "userland-proxy": false
}
EOF

# Restart Docker
sudo systemctl restart docker
```

---

## 🌐 Step 3: Install and Configure NGINX

### 3.1 Install NGINX

```bash
# Update package list
sudo apt-get update

# Install NGINX
sudo apt-get install -y nginx

# Start and enable NGINX
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 3.2 Configure NGINX for neic-bd.org

```bash
# Create NGINX configuration for the domain
sudo tee /etc/nginx/sites-available/neic-bd.org > /dev/null <<'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream for the application
upstream election_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Main server block
server {
    listen 80;
    listen [::]:80;
    server_name neic-bd.org www.neic-bd.org;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; frame-src 'self' https://www.google.com https://maps.google.com;" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Client settings
    client_max_body_size 25M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Proxy settings
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    
    # Main application
    location / {
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Login rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://election_app;
        proxy_cache_valid 200 1d;
        proxy_cache_valid 404 1m;
        add_header Cache-Control "public, immutable";
        expires 1d;
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# Redirect www to non-www
server {
    listen 80;
    listen [::]:80;
    server_name www.neic-bd.org;
    return 301 http://neic-bd.org$request_uri;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/neic-bd.org /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

---

## 🔒 Step 4: SSL Certificate Setup (Let's Encrypt)

### 4.1 Install Certbot

```bash
# Install snapd
sudo apt-get install -y snapd

# Install certbot
sudo snap install --classic certbot

# Create symlink
sudo ln -sf /snap/bin/certbot /usr/bin/certbot
```

### 4.2 Obtain SSL Certificate

```bash
# Stop NGINX temporarily
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d neic-bd.org -d www.neic-bd.org

# Start NGINX
sudo systemctl start nginx
```

### 4.3 Update NGINX Configuration for HTTPS

```bash
# Update NGINX configuration with SSL
sudo tee /etc/nginx/sites-available/neic-bd.org > /dev/null <<'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream for the application
upstream election_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name neic-bd.org www.neic-bd.org;
    return 301 https://$server_name$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name neic-bd.org www.neic-bd.org;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/neic-bd.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neic-bd.org/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; frame-src 'self' https://www.google.com https://maps.google.com;" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Client settings
    client_max_body_size 25M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Proxy settings
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    
    # Main application
    location / {
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Login rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://election_app;
        proxy_cache_valid 200 1d;
        proxy_cache_valid 404 1m;
        add_header Cache-Control "public, immutable";
        expires 1d;
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://election_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Test and reload NGINX
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 Setup Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## 🚀 Step 5: Deploy the Application

### 5.1 Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/election-portal
sudo chown $USER:$USER /opt/election-portal
cd /opt/election-portal

# Clone the repository (replace with your actual repository URL)
git clone <your-repository-url> .

# Copy environment file
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### 5.2 Configure Environment Variables

```bash
# Essential environment variables for production
cat > .env.local << 'EOF'
# Application
NODE_ENV=production
NEXTAUTH_URL=https://neic-bd.org
NEXTAUTH_SECRET=your-super-secret-key-here
HASH_SALT=your-hash-salt-here

# Database
DATABASE_URL="postgresql://election:your-db-password@db:5432/election?schema=public"

# Redis
REDIS_URL="redis://:your-redis-password@redis:6379"
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Application Settings
APP_HTTP_PORT=3000
UPLOAD_DIR=/app/uploads/submissions
NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB=25

# Security
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_SECONDS=60

# Email (if using SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@neic-bd.org

# Admin Users
ADMIN_EMAIL=admin@neic-bd.org
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_NAME=System Administrator

MANAGER_EMAIL=manager@neic-bd.org
MANAGER_PASSWORD=your-secure-manager-password
MANAGER_NAME=System Manager

SUPPORT_EMAIL=support@neic-bd.org
SUPPORT_PASSWORD=your-secure-support-password
SUPPORT_NAME=Support Staff

# Database
POSTGRES_DB=election
POSTGRES_USER=election
POSTGRES_PASSWORD=your-secure-db-password

# Redis
REDIS_PASSWORD=your-secure-redis-password

# Backup Settings
POSTGRES_BACKUP_SCHEDULE=@daily
POSTGRES_BACKUP_KEEP_DAYS=7
UPLOADS_BACKUP_INTERVAL_SECONDS=86400
UPLOADS_BACKUP_RETENTION_DAYS=7

# Timezone
TZ=Asia/Dhaka
EOF
```

### 5.3 Deploy with Docker

```bash
# Build and start all services
docker compose up --build -d

# Check status
docker compose ps

# Setup database
docker compose exec app npx prisma db push

# Create admin users
docker compose exec app node scripts/create-admin.js

# Restart application
docker compose restart app

# Check logs
docker compose logs app --tail=20
```

---

## 🔧 Step 6: System Optimization

### 6.1 Configure Firewall

```bash
# Install UFW
sudo apt-get install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Check status
sudo ufw status
```

### 6.2 Configure System Limits

```bash
# Configure system limits
sudo tee -a /etc/security/limits.conf > /dev/null << 'EOF'
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
EOF

# Configure systemd limits
sudo mkdir -p /etc/systemd/system/nginx.service.d
sudo tee /etc/systemd/system/nginx.service.d/override.conf > /dev/null << 'EOF'
[Service]
LimitNOFILE=65536
EOF

sudo systemctl daemon-reload
sudo systemctl restart nginx
```

### 6.3 Configure Log Rotation

```bash
# Configure log rotation for Docker
sudo tee /etc/logrotate.d/docker > /dev/null << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Configure log rotation for application
sudo tee /etc/logrotate.d/election-portal > /dev/null << 'EOF'
/opt/election-portal/logs/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
EOF
```

---

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Setup Monitoring Scripts

```bash
# Create monitoring script
sudo tee /opt/election-portal/monitor.sh > /dev/null << 'EOF'
#!/bin/bash

# Check if services are running
check_service() {
    if docker compose ps | grep -q "$1.*Up"; then
        echo "✅ $1 is running"
    else
        echo "❌ $1 is not running"
        return 1
    fi
}

# Check all services
echo "=== Service Status ==="
check_service "app"
check_service "db"
check_service "redis"

# Check disk space
echo -e "\n=== Disk Usage ==="
df -h /opt/election-portal

# Check memory usage
echo -e "\n=== Memory Usage ==="
free -h

# Check Docker resources
echo -e "\n=== Docker Resources ==="
docker system df
EOF

sudo chmod +x /opt/election-portal/monitor.sh

# Setup cron job for monitoring
echo "*/5 * * * * /opt/election-portal/monitor.sh >> /var/log/election-portal-monitor.log" | sudo crontab -
```

### 7.2 Setup Backup Scripts

```bash
# Create backup script
sudo tee /opt/election-portal/backup.sh > /dev/null << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/election-portal"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T db pg_dump -U election election > $BACKUP_DIR/database_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/election-portal uploads/

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

sudo chmod +x /opt/election-portal/backup.sh

# Setup daily backup
echo "0 2 * * * /opt/election-portal/backup.sh >> /var/log/election-portal-backup.log" | sudo crontab -
```

---

## 🧪 Step 8: Testing and Verification

### 8.1 Test Application

```bash
# Test HTTP redirect
curl -I http://neic-bd.org

# Test HTTPS
curl -I https://neic-bd.org

# Test API endpoints
curl -I https://neic-bd.org/api/health

# Test login page
curl -I https://neic-bd.org/en/login
```

### 8.2 Performance Testing

```bash
# Install Apache Bench
sudo apt-get install -y apache2-utils

# Test performance
ab -n 100 -c 10 https://neic-bd.org/

# Test with authentication
ab -n 50 -c 5 https://neic-bd.org/en/login
```

---

## 🚨 Step 9: Emergency Procedures

### 9.1 Quick Restart

```bash
# Restart all services
cd /opt/election-portal
docker compose restart

# Check status
docker compose ps
docker compose logs --tail=20
```

### 9.2 Complete Reset

```bash
# Stop all services
cd /opt/election-portal
docker compose down

# Clean Docker system
docker system prune -a -f --volumes

# Rebuild and start
docker compose up --build -d

# Setup database
docker compose exec app npx prisma db push
docker compose exec app node scripts/create-admin.js
docker compose restart app
```

### 9.3 Rollback Procedure

```bash
# Stop services
docker compose down

# Restore from backup
cd /opt/backups/election-portal
LATEST_DB=$(ls -t database_*.sql | head -1)
LATEST_UPLOADS=$(ls -t uploads_*.tar.gz | head -1)

# Restore database
docker compose up -d db
sleep 30
docker compose exec -T db psql -U election -d election < $LATEST_DB

# Restore uploads
tar -xzf $LATEST_UPLOADS -C /opt/election-portal/

# Start application
docker compose up -d
```

---

## 📋 Step 10: Final Checklist

### ✅ Pre-deployment Checklist

- [ ] Domain DNS pointing to server IP
- [ ] SSL certificate obtained and configured
- [ ] Environment variables configured
- [ ] Database credentials set
- [ ] Admin users created
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backup procedures in place

### ✅ Post-deployment Checklist

- [ ] Application accessible via HTTPS
- [ ] All services running
- [ ] Database connected
- [ ] Admin login working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] SSL certificate auto-renewal working
- [ ] Monitoring scripts running
- [ ] Backup scripts running

---

## 🔗 Useful Commands

### Docker Management

```bash
# View logs
docker compose logs -f app

# Restart specific service
docker compose restart app

# Execute commands in container
docker compose exec app sh

# View resource usage
docker stats

# Clean up system
docker system prune -a -f --volumes
```

### NGINX Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart NGINX
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check system logs
sudo journalctl -f

# Check Docker logs
docker compose logs -f
```

---

## 📞 Support Information

### Default Admin Credentials

- **Admin Email**: admin@neic-bd.org
- **Manager Email**: manager@neic-bd.org  
- **Support Email**: support@neic-bd.org

### Important URLs

- **Main Site**: https://neic-bd.org
- **Admin Panel**: https://neic-bd.org/en/admin
- **Login**: https://neic-bd.org/en/login
- **pgAdmin**: https://neic-bd.org:5050 (if exposed)

### Log Locations

- **Application Logs**: `docker compose logs app`
- **NGINX Logs**: `/var/log/nginx/`
- **System Logs**: `sudo journalctl -f`
- **Docker Logs**: `/var/lib/docker/containers/`

---

## ⚠️ Security Notes

1. **Change all default passwords** immediately after deployment
2. **Keep SSL certificates updated** (auto-renewal configured)
3. **Monitor logs regularly** for suspicious activity
4. **Keep system updated** with security patches
5. **Backup data regularly** and test restore procedures
6. **Use strong passwords** for all accounts
7. **Limit access** to production server
8. **Monitor resource usage** to prevent overload

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Server**: Production  
**Domain**: neic-bd.org  
**Status**: ✅ Ready for deployment
