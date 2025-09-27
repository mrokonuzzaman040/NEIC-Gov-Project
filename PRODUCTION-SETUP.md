# Production Setup Guide for BD Election Commission Portal

This guide will help you deploy the BD Election Commission Portal to a production Ubuntu server with the domain `neic-bd.org`.

## 🚀 Quick Start

### Prerequisites
- Ubuntu 20.04+ server with root/sudo access
- Domain `neic-bd.org` pointing to your server's IP address
- At least 2GB RAM and 20GB disk space

### Automated Setup

1. **Upload your application files to the server**
   ```bash
   scp -r /path/to/election-portal user@your-server-ip:/tmp/
   ```

2. **Run the setup script**
   ```bash
   cd /tmp/election-portal
   chmod +x setup-production.sh
   ./setup-production.sh
   ```

3. **Copy your application files**
   ```bash
   sudo cp -r /tmp/election-portal/* /opt/election-portal/
   sudo chown -R election:election /opt/election-portal/
   ```

4. **Install dependencies and build**
   ```bash
   cd /opt/election-portal
   sudo -u election npm ci --production
   sudo -u election npm run build
   ```

5. **Setup database**
   ```bash
   sudo -u election npm run db:migrate
   sudo -u election npm run db:seed
   ```

6. **Start the application**
   ```bash
   sudo systemctl start election-portal
   sudo systemctl status election-portal
   ```

7. **Setup SSL certificate**
   ```bash
   sudo certbot --nginx -d neic-bd.org -d www.neic-bd.org
   ```

## 📋 What the Setup Script Does

The `setup-production.sh` script automatically installs and configures:

### System Components
- ✅ Node.js 20.x
- ✅ PostgreSQL 15
- ✅ Redis
- ✅ Nginx
- ✅ PM2
- ✅ Certbot (for SSL)

### Security Features
- ✅ UFW Firewall configuration
- ✅ SSL/TLS with Let's Encrypt
- ✅ Rate limiting
- ✅ Security headers
- ✅ File access restrictions

### Production Features
- ✅ Systemd service for auto-start
- ✅ Log rotation
- ✅ Automated backups
- ✅ Monitoring scripts
- ✅ Process management with PM2

## 🔧 Manual Configuration

### 1. Environment Variables

Edit the production environment file:
```bash
sudo nano /opt/election-portal/.env.production
```

Update these critical values:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `SMTP_*` - Email configuration
- `RECAPTCHA_*` - reCAPTCHA keys

### 2. Database Setup

Create the database and user:
```bash
sudo -u postgres psql
CREATE DATABASE election_portal;
CREATE USER election_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE election_portal TO election_user;
ALTER USER election_user CREATEDB;
\q
```

### 3. Application Deployment

```bash
# Copy application files
sudo cp -r /path/to/election-portal/* /opt/election-portal/
sudo chown -R election:election /opt/election-portal/

# Install dependencies
cd /opt/election-portal
sudo -u election npm ci --production

# Build the application
sudo -u election npm run build

# Run database migrations
sudo -u election npm run db:migrate

# Seed initial data
sudo -u election npm run db:seed
```

## 🛠️ Service Management

### Start/Stop/Restart Application
```bash
sudo systemctl start election-portal
sudo systemctl stop election-portal
sudo systemctl restart election-portal
sudo systemctl status election-portal
```

### View Logs
```bash
# Application logs
sudo journalctl -u election-portal -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application specific logs
sudo tail -f /var/log/election-portal/app.log
```

### Check Service Status
```bash
# All services
sudo systemctl status election-portal nginx postgresql redis-server

# Database connection
sudo -u postgres psql -c "SELECT version();"

# Redis connection
redis-cli ping
```

## 🔒 Security Configuration

### Firewall Rules
```bash
sudo ufw status
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

### Database Security
```bash
# Change default passwords
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_secure_password';
ALTER USER election_user PASSWORD 'new_secure_password';
```

## 📊 Monitoring & Maintenance

### Automated Backups
- Database backups: Daily at 2 AM
- File backups: Daily at 2 AM
- Retention: 7 days (configurable)

### Monitoring Scripts
- Service health check: Every 5 minutes
- Disk space monitoring
- Memory usage monitoring

### Log Rotation
- Application logs: Daily rotation
- Nginx logs: Weekly rotation
- Retention: 52 weeks

## 🚨 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   sudo journalctl -u election-portal -n 50
   sudo systemctl status election-portal
   ```

2. **Database connection issues**
   ```bash
   sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
   sudo systemctl status postgresql
   ```

3. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --force-renewal
   ```

### Performance Optimization

1. **Database optimization**
   ```bash
   sudo -u postgres psql election_portal -c "ANALYZE;"
   sudo -u postgres psql election_portal -c "VACUUM;"
   ```

2. **Redis memory optimization**
   ```bash
   redis-cli CONFIG SET maxmemory-policy allkeys-lru
   redis-cli CONFIG SET maxmemory 256mb
   ```

3. **Nginx caching**
   - Static files are cached for 1 year
   - Gzip compression enabled
   - Rate limiting configured

## 📁 File Structure

```
/opt/election-portal/          # Application directory
├── .env.production           # Environment configuration
├── uploads/                  # File uploads
├── logs/                     # Application logs
└── ...

/etc/nginx/sites-available/    # Nginx configuration
├── neic-bd.org              # Domain configuration

/etc/systemd/system/          # Service configuration
├── election-portal.service  # Application service

/var/log/election-portal/     # Application logs
├── app.log                  # Main application log
└── monitor.log              # Monitoring log

/opt/backups/election-portal/ # Backup directory
├── db_backup_*.sql          # Database backups
├── uploads_backup_*.tar.gz  # File backups
└── app_backup_*.tar.gz      # Application backups
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Stop service
sudo systemctl stop election-portal

# Backup current version
sudo -u election /usr/local/bin/backup-election-portal.sh

# Update application files
sudo cp -r /path/to/new/election-portal/* /opt/election-portal/
sudo chown -R election:election /opt/election-portal/

# Install dependencies
cd /opt/election-portal
sudo -u election npm ci --production

# Run migrations
sudo -u election npm run db:migrate

# Build and start
sudo -u election npm run build
sudo systemctl start election-portal
```

### System Updates
```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl restart election-portal nginx postgresql redis-server
```

## 📞 Support

For issues or questions:
1. Check the logs first: `sudo journalctl -u election-portal -f`
2. Verify all services are running: `sudo systemctl status election-portal nginx postgresql redis-server`
3. Check disk space: `df -h`
4. Check memory usage: `free -h`

## 🎯 Performance Benchmarks

Expected performance on a 2GB RAM server:
- Response time: < 200ms
- Concurrent users: 100+
- File upload limit: 25MB
- Database connections: 10 concurrent

---

**⚠️ Important Security Notes:**
- Always use strong passwords
- Keep the system updated
- Monitor logs regularly
- Backup data frequently
- Use HTTPS only in production
