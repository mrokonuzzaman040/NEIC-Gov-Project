#!/bin/bash

# Production Setup Script for BD Election Commission Portal
# Domain: neic-bd.org
# This script will set up PostgreSQL, Redis, Node.js, and configure the application for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="neic-bd.org"
APP_NAME="election-portal"
APP_USER="election"
APP_DIR="/opt/election-portal"
NGINX_DIR="/etc/nginx"
SSL_DIR="/etc/letsencrypt"
SERVICE_NAME="election-portal"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Function to check current directory and fix permissions
check_working_directory() {
    print_status "Checking working directory..."
    
    # Get the directory where the script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Change to script directory to avoid permission issues
    cd "$SCRIPT_DIR"
    
    print_success "Working in directory: $(pwd)"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_success "System packages updated"
}

# Function to install essential packages
install_essentials() {
    print_status "Installing essential packages..."
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release bc
    print_success "Essential packages installed"
}

# Function to install Node.js 20.x
install_nodejs() {
    print_status "Installing Node.js 20.x..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 20 ]; then
            print_warning "Node.js $NODE_VERSION is already installed"
            return
        fi
    fi
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    
    print_success "Node.js $(node --version) installed"
}

# Function to install PostgreSQL 15
install_postgresql() {
    print_status "Installing PostgreSQL 15..."
    
    if command_exists psql; then
        print_warning "PostgreSQL is already installed"
        return
    fi
    
    # Add PostgreSQL official repository
    sudo wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
    sudo apt update
    
    # Install PostgreSQL
    sudo apt install -y postgresql-15 postgresql-client-15 postgresql-contrib-15
    
    # Start and enable PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    print_success "PostgreSQL 15 installed and started"
}

# Function to install Redis
install_redis() {
    print_status "Installing Redis..."
    
    if command_exists redis-server; then
        print_warning "Redis is already installed"
        return
    fi
    
    sudo apt install -y redis-server
    
    # Configure Redis
    sudo sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
    sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
    sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    
    # Restart Redis to apply configuration
    sudo systemctl restart redis-server
    
    # Start and enable Redis
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    print_success "Redis installed and configured"
}

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    if command_exists nginx; then
        print_warning "Nginx is already installed"
        return
    fi
    
    sudo apt install -y nginx
    
    # Start and enable Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx installed and started"
}

# Function to install PM2
install_pm2() {
    print_status "Installing PM2..."
    
    if command_exists pm2; then
        print_warning "PM2 is already installed"
        return
    fi
    
    sudo npm install -g pm2
    
    # Setup PM2 startup (commented out as we'll use systemd service instead)
    # sudo pm2 startup systemd -u $USER --hp $HOME
    # sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
    
    print_success "PM2 installed and configured"
}

# Function to create application user
create_app_user() {
    print_status "Creating application user..."
    
    if id "$APP_USER" &>/dev/null; then
        print_warning "User $APP_USER already exists"
    else
        sudo useradd -r -s /bin/bash -d $APP_DIR $APP_USER
        print_success "User $APP_USER created"
    fi
}

# Function to setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $APP_DIR/uploads
    sudo chown -R $USER:$APP_USER $APP_DIR
    sudo chmod 755 $APP_DIR
    sudo chmod 755 $APP_DIR/uploads
    
    print_success "Application directory setup complete"
}

# Function to install application dependencies
install_app_dependencies() {
    print_status "Installing application dependencies..."
    
    if [ -d "$APP_DIR" ] && [ -f "$APP_DIR/package.json" ]; then
        cd $APP_DIR
        sudo -u $APP_USER npm ci --production
        print_success "Application dependencies installed"
    else
        print_warning "package.json not found in $APP_DIR. Please ensure the application files are copied first."
    fi
}

# Function to setup PostgreSQL database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Create database and user with error handling
    sudo -u postgres psql << EOF
DO \$\$
BEGIN
    -- Create database if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'election_portal') THEN
        CREATE DATABASE election_portal;
    END IF;
    
    -- Create user if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'election_user') THEN
        CREATE USER election_user WITH ENCRYPTED PASSWORD 'election_secure_password_2024';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE election_portal TO election_user;
ALTER USER election_user CREATEDB;
\q
EOF
    
    # Wait a moment for database to be ready
    sleep 2
    
    print_success "PostgreSQL database and user created"
}

# Function to create environment file
create_env_file() {
    print_status "Creating production environment file..."
    
    cat > $APP_DIR/.env.production << EOF
# Production Environment Configuration
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://election_user:election_secure_password_2024@localhost:5432/election_portal"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Next.js Configuration
NEXTAUTH_URL="https://neic-bd.org"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Application Configuration
APP_NAME="BD Election Commission Portal"
APP_URL="https://neic-bd.org"

# File Upload Configuration
MAX_FILE_SIZE="25MB"
UPLOAD_DIR="/opt/election-portal/uploads"

# Security Configuration
ENABLE_RATE_LIMITING="true"
RATE_LIMIT_WINDOW="15"
RATE_LIMIT_MAX_REQUESTS="100"

# Email Configuration (Configure with your SMTP settings)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@neic-bd.org"

# reCAPTCHA Configuration (Add your keys)
RECAPTCHA_SITE_KEY=""
RECAPTCHA_SECRET_KEY=""

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/election-portal/app.log"

# SSL Configuration
SSL_REDIRECT="true"
EOF
    
    sudo chown $APP_USER:$APP_USER $APP_DIR/.env.production
    sudo chmod 640 $APP_DIR/.env.production
    
    print_success "Environment file created"
}

# Function to create Nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    sudo tee $NGINX_DIR/sites-available/$DOMAIN > /dev/null << EOF
server {
    listen 80;
    server_name neic-bd.org www.neic-bd.org;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name neic-bd.org www.neic-bd.org;
    
    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/neic-bd.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neic-bd.org/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    
    # Main Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # API Rate Limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Login Rate Limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static Files
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    # Security
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Block access to sensitive files
    location ~ \.(env|log|htaccess|htpasswd|ini|log|sh|sql|conf)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf $NGINX_DIR/sites-available/$DOMAIN $NGINX_DIR/sites-enabled/
    sudo rm -f $NGINX_DIR/sites-enabled/default
    
    # Test Nginx configuration
    if sudo nginx -t; then
        # Start nginx if not running, then reload
        sudo systemctl start nginx
        sudo systemctl reload nginx
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
    
    print_success "Nginx configuration created"
}

# Function to create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."
    
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=Election Portal Application
After=network.target postgresql.service redis.service
Requires=postgresql.service redis.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env.production
ExecStart=/usr/bin/node start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
    
    print_success "Systemd service created"
}

# Function to install Certbot for SSL
install_certbot() {
    print_status "Installing Certbot for SSL certificates..."
    
    if command_exists certbot; then
        print_warning "Certbot is already installed"
        return
    fi
    
    sudo apt install -y certbot python3-certbot-nginx
    
    print_success "Certbot installed"
}

# Function to setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Stop Nginx temporarily
    sudo systemctl stop nginx
    
    # Obtain SSL certificate
    sudo certbot --nginx -d neic-bd.org -d www.neic-bd.org --non-interactive --agree-tos --email admin@neic-bd.org --redirect
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    # Start Nginx
    sudo systemctl start nginx
    
    print_success "SSL certificate setup complete"
}

# Function to setup log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/$SERVICE_NAME > /dev/null << EOF
/var/log/election-portal/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $APP_USER $APP_USER
    postrotate
        systemctl reload $SERVICE_NAME
    endscript
}
EOF
    
    sudo mkdir -p /var/log/election-portal
    sudo chown $APP_USER:$APP_USER /var/log/election-portal
    
    print_success "Log rotation configured"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up UFW firewall..."
    
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Function to create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    sudo tee /usr/local/bin/backup-election-portal.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/election-portal"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/election-portal"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U election_user -d election_portal > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $APP_DIR uploads/

# Backup application files (excluding node_modules)
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR --exclude=node_modules --exclude=.next .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    sudo chmod +x /usr/local/bin/backup-election-portal.sh
    
    # Add to crontab for daily backups
    (sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-election-portal.sh") | sudo crontab -
    
    print_success "Backup script created"
}

# Function to create monitoring script
create_monitoring_script() {
    print_status "Creating monitoring script..."
    
    sudo tee /usr/local/bin/monitor-election-portal.sh > /dev/null << 'EOF'
#!/bin/bash
SERVICE_NAME="election-portal"
LOG_FILE="/var/log/election-portal/monitor.log"

# Check if service is running
if ! systemctl is-active --quiet $SERVICE_NAME; then
    echo "$(date): Service $SERVICE_NAME is down, restarting..." >> $LOG_FILE
    systemctl restart $SERVICE_NAME
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): Disk usage is ${DISK_USAGE}%, cleaning up..." >> $LOG_FILE
    # Clean up old logs
    find /var/log -name "*.log" -mtime +30 -delete
    # Clean up old backups
    find /opt/backups -name "*.tar.gz" -mtime +30 -delete
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "$(date): Memory usage is ${MEMORY_USAGE}%" >> $LOG_FILE
fi
EOF
    
    sudo chmod +x /usr/local/bin/monitor-election-portal.sh
    
    # Add to crontab for monitoring every 5 minutes
    (sudo crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-election-portal.sh") | sudo crontab -
    
    print_success "Monitoring script created"
}

# Function to display final instructions
display_final_instructions() {
    print_success "Production setup completed!"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Copy your application files to $APP_DIR"
    echo "2. Update the .env.production file with your actual configuration"
    echo "3. Run database migrations: cd $APP_DIR && npm run db:migrate"
    echo "4. Seed the database: cd $APP_DIR && npm run db:seed"
    echo "5. Start the application: sudo systemctl start $SERVICE_NAME"
    echo "6. Check application status: sudo systemctl status $SERVICE_NAME"
    echo ""
    echo -e "${BLUE}Important Files:${NC}"
    echo "- Application directory: $APP_DIR"
    echo "- Environment file: $APP_DIR/.env.production"
    echo "- Nginx config: $NGINX_DIR/sites-available/$DOMAIN"
    echo "- Service file: /etc/systemd/system/$SERVICE_NAME.service"
    echo "- Logs: /var/log/election-portal/"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "- Check service status: sudo systemctl status $SERVICE_NAME"
    echo "- View logs: sudo journalctl -u $SERVICE_NAME -f"
    echo "- Restart service: sudo systemctl restart $SERVICE_NAME"
    echo "- Check Nginx status: sudo systemctl status nginx"
    echo "- Test SSL: sudo certbot certificates"
    echo ""
    echo -e "${YELLOW}Security Notes:${NC}"
    echo "- Change default database password in .env.production"
    echo "- Update NEXTAUTH_SECRET with a secure random string"
    echo "- Configure SMTP settings for email functionality"
    echo "- Add your reCAPTCHA keys"
    echo "- Consider setting up fail2ban for additional security"
    echo ""
    echo -e "${GREEN}Your application will be available at: https://neic-bd.org${NC}"
}

# Main execution
main() {
    print_status "Starting production setup for BD Election Commission Portal..."
    print_status "Domain: $DOMAIN"
    print_status "Application Directory: $APP_DIR"
    echo ""
    
    # Check if running as root
    check_root
    
    # Check working directory
    check_working_directory
    
    # Update system
    update_system
    
    # Install essential packages
    install_essentials
    
    # Install Node.js
    install_nodejs
    
    # Install PostgreSQL
    install_postgresql
    
    # Install Redis
    install_redis
    
    # Install Nginx
    install_nginx
    
    # Install PM2
    install_pm2
    
    # Create application user
    create_app_user
    
    # Setup application directory
    setup_app_directory
    
    # Setup database
    setup_database
    
    # Create environment file
    create_env_file
    
    # Create Nginx configuration
    create_nginx_config
    
    # Create systemd service
    create_systemd_service
    
    # Install Certbot
    install_certbot
    
    # Setup SSL (commented out - requires domain to be pointing to server)
    # setup_ssl
    print_warning "SSL setup skipped. Run 'sudo certbot --nginx -d neic-bd.org -d www.neic-bd.org' after domain DNS is configured."
    
    # Setup log rotation
    setup_log_rotation
    
    # Setup firewall
    setup_firewall
    
    # Create backup script
    create_backup_script
    
    # Create monitoring script
    create_monitoring_script
    
    # Display final instructions
    display_final_instructions
}

# Run main function
main "$@"
