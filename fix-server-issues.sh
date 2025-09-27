#!/bin/bash

# Quick Fix Script for Server Issues
# This script fixes the specific issues encountered during setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Fix PostgreSQL database and user creation
fix_database_setup() {
    print_status "Fixing PostgreSQL database setup..."
    
    # Create database and user with proper error handling
    sudo -u postgres psql << 'EOF'
DO $$
BEGIN
    -- Create database if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'election_portal') THEN
        CREATE DATABASE election_portal;
        RAISE NOTICE 'Database election_portal created';
    ELSE
        RAISE NOTICE 'Database election_portal already exists';
    END IF;
    
    -- Create user if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'election_user') THEN
        CREATE USER election_user WITH ENCRYPTED PASSWORD 'election_secure_password_2024';
        RAISE NOTICE 'User election_user created';
    ELSE
        RAISE NOTICE 'User election_user already exists';
    END IF;
END
$$;

-- Grant privileges (these will work even if user/db already exist)
GRANT ALL PRIVILEGES ON DATABASE election_portal TO election_user;
ALTER USER election_user CREATEDB;
\q
EOF
    
    print_success "Database setup completed"
}

# Fix Nginx service
fix_nginx_service() {
    print_status "Fixing Nginx service..."
    
    # Start Nginx if not running
    if ! sudo systemctl is-active --quiet nginx; then
        print_status "Starting Nginx service..."
        sudo systemctl start nginx
    fi
    
    # Enable Nginx to start on boot
    sudo systemctl enable nginx
    
    # Reload Nginx configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        print_success "Nginx service fixed and reloaded"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Fix directory permissions
fix_directory_permissions() {
    print_status "Fixing directory permissions..."
    
    APP_DIR="/opt/election-portal"
    APP_USER="election"
    
    # Create directories if they don't exist
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $APP_DIR/uploads
    sudo mkdir -p /var/log/election-portal
    
    # Set proper ownership
    sudo chown -R $APP_USER:$APP_USER $APP_DIR
    sudo chown -R $APP_USER:$APP_USER /var/log/election-portal
    
    # Set proper permissions
    sudo chmod 755 $APP_DIR
    sudo chmod 755 $APP_DIR/uploads
    sudo chmod 755 /var/log/election-portal
    
    print_success "Directory permissions fixed"
}

# Test all services
test_services() {
    print_status "Testing all services..."
    
    # Test PostgreSQL
    if sudo systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
        sudo systemctl start postgresql
    fi
    
    # Test Redis
    if sudo systemctl is-active --quiet redis-server; then
        print_success "Redis is running"
    else
        print_error "Redis is not running"
        sudo systemctl start redis-server
    fi
    
    # Test Nginx
    if sudo systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
        sudo systemctl start nginx
    fi
    
    # Test database connection
    if PGPASSWORD=election_secure_password_2024 psql -h localhost -U election_user -d election_portal -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection test passed"
    else
        print_error "Database connection test failed"
    fi
    
    # Test Redis connection
    if redis-cli ping | grep -q "PONG"; then
        print_success "Redis connection test passed"
    else
        print_error "Redis connection test failed"
    fi
}

# Main execution
main() {
    print_status "Fixing server setup issues..."
    echo ""
    
    fix_database_setup
    fix_nginx_service
    fix_directory_permissions
    test_services
    
    echo ""
    print_success "All server issues have been fixed!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Copy your application files to /opt/election-portal/"
    echo "2. Install dependencies: cd /opt/election-portal && sudo -u election npm ci --production"
    echo "3. Build application: sudo -u election npm run build"
    echo "4. Run migrations: sudo -u election npm run db:migrate"
    echo "5. Seed database: sudo -u election npm run db:seed"
    echo "6. Start application: sudo systemctl start election-portal"
    echo ""
    echo -e "${GREEN}Your server is now ready for deployment!${NC}"
}

# Run main function
main "$@"
