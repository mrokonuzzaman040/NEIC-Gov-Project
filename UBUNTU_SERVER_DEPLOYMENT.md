# Ubuntu Server Deployment Guide

This guide helps you deploy the Election Commission Portal to an Ubuntu server with proper environment configuration.

## 🚨 Common Issues on Ubuntu Server

### 1. Database Connection Problems
- **Cause**: Hardcoded environment variables in docker-compose.yml
- **Solution**: Use environment variables from .env.local

### 2. CSS Not Loading
- **Cause**: Static file serving issues
- **Solution**: Proper volume mounting and Next.js configuration

### 3. Functions Not Working
- **Cause**: Environment variables not loaded properly
- **Solution**: Correct .env.local configuration

## 📋 Pre-Deployment Checklist

### 1. Server Requirements
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Create Production Environment File
Create `.env.local` on your server:

```bash
# Database Configuration
DATABASE_URL="postgresql://election:SecureElectionDB2024!@db:5432/election"
POSTGRES_DB=election
POSTGRES_USER=election
POSTGRES_PASSWORD=SecureElectionDB2024!

# NextAuth Configuration
NEXTAUTH_SECRET="tKAHqkJashMMQU73d8xjsQRV3aQ0N0DsxldhedGa7yo="
NEXTAUTH_URL="http://YOUR_SERVER_IP:3000"
HASH_SALT="replace-with-long-random-secret"

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info
UPLOAD_DIR=/app/uploads/submissions
SEED_DATABASE=false

# Public Configuration
NEXT_PUBLIC_APP_NAME="BD Election Commission Portal"
NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB=25
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB2Ao953YsjaZPlN_H1QR9yd0W60UP7uLE
NEXT_PUBLIC_RECAPTCHA_KEY=6LdjsNArAAAAAEWKWxEGhg_Dbq9T_JmdOvPtA8_j
NEXT_PUBLIC_RECAPTCHA_KEY_SECRET=6LdjsNArAAAAAAM7WiOdCW0PIlLw3gkkEgxzemxQ

# Redis Configuration
REDIS_URL="redis://:SecureRedis2024!@redis:6379"
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=SecureRedis2024!
REDIS_TLS=false

# Rate Limiting
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_SECONDS=60

# User Management
ADMIN_EMAIL=admin@neic-bd.org
ADMIN_PASSWORD=NewSecurePassword2024!
ADMIN_NAME=System Administrator
MANAGER_EMAIL=manager@neic-bd.org
MANAGER_PASSWORD=NewSecurePassword2024!
MANAGER_NAME=Management User
SUPPORT_EMAIL=support@neic-bd.org
SUPPORT_PASSWORD=NewSecurePassword2024!
SUPPORT_NAME=Support Staff

# Email Configuration (optional)
SENDGRID_API_KEY=
FROM_EMAIL=

# Server Configuration
APP_HTTP_PORT=3000
```

## 🚀 Deployment Commands

### 1. Clone and Setup
```bash
# Clone repository
git clone <your-repo-url>
cd election

# Create .env.local file (copy content above)
nano .env.local

# Make scripts executable
chmod +x docker/entrypoint.sh
chmod +x docker/uploads-backup.sh
```

### 2. Deploy Application
```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs app --tail=20
```

### 3. Setup Database
```bash
# Run database migrations
docker-compose exec app npx prisma db push

# Create admin users
docker-compose exec app node scripts/create-admin.js

# Restart application
docker-compose restart app
```

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check database connection
docker-compose exec app npx prisma db push

# Check database logs
docker-compose logs db

# Test database connection
docker-compose exec db psql -U election -d election -c "SELECT 1;"
```

### CSS/Static Files Not Loading
```bash
# Check if volumes are mounted correctly
docker-compose exec app ls -la /app/uploads

# Check Next.js build
docker-compose exec app ls -la /app/.next

# Restart with fresh build
docker-compose down
docker-compose up --build -d
```

### Environment Variables Not Loading
```bash
# Check environment variables in container
docker-compose exec app env | grep DATABASE_URL

# Verify .env.local file
cat .env.local

# Check docker-compose.yml syntax
docker-compose config
```

### Port Issues
```bash
# Check if ports are open
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5050

# Open firewall ports
sudo ufw allow 3000
sudo ufw allow 5050
```

## 🔐 Security Configuration

### 1. Firewall Setup
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow application ports
sudo ufw allow 3000
sudo ufw allow 5050

# Check status
sudo ufw status
```

### 2. SSL/HTTPS Setup (Optional)
```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com
```

## 📊 Monitoring Commands

### 1. Check Service Status
```bash
# All services
docker-compose ps

# Specific service logs
docker-compose logs app -f
docker-compose logs db -f
docker-compose logs redis -f
```

### 2. Resource Usage
```bash
# Docker stats
docker stats

# Disk usage
docker system df

# Container resource usage
docker-compose top
```

### 3. Health Checks
```bash
# Application health
curl -I http://localhost:3000/

# Database health
docker-compose exec db pg_isready -U election

# Redis health
docker-compose exec redis redis-cli ping
```

## 🔄 Maintenance Commands

### 1. Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Run migrations if needed
docker-compose exec app npx prisma db push
```

### 2. Backup Data
```bash
# Database backup
docker-compose exec db pg_dump -U election election > backup.sql

# Uploads backup
docker-compose exec app tar -czf /tmp/uploads-backup.tar.gz /app/uploads
```

### 3. Clean Up
```bash
# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Full cleanup
docker system prune -a -f --volumes
```

## 🌐 Access URLs

- **Application**: http://YOUR_SERVER_IP:3000
- **Login**: http://YOUR_SERVER_IP:3000/en/login
- **pgAdmin**: http://YOUR_SERVER_IP:5050

## 🔑 Default Credentials

After running `create-admin.js`:
- **Admin**: admin@neic-bd.org
- **Manager**: manager@neic-bd.org  
- **Support**: support@neic-bd.org

Check `user-credentials.json` for generated passwords.

## ⚠️ Important Notes

1. **Replace YOUR_SERVER_IP** with your actual server IP address
2. **Change default passwords** after first login
3. **Keep .env.local secure** and don't commit to git
4. **Regular backups** are essential
5. **Monitor logs** for any issues
6. **Update regularly** for security patches

## 🆘 Emergency Recovery

### Complete Reset
```bash
# Stop everything
docker-compose down

# Remove all data (WARNING: This deletes everything!)
docker system prune -a -f --volumes

# Start fresh
docker-compose up --build -d
docker-compose exec app npx prisma db push
docker-compose exec app node scripts/create-admin.js
```

### Restore from Backup
```bash
# Restore database
docker-compose exec -T db psql -U election election < backup.sql

# Restore uploads
docker-compose exec app tar -xzf /tmp/uploads-backup.tar.gz -C /
```

---

**Last Updated**: $(date)  
**Status**: ✅ Production Ready
