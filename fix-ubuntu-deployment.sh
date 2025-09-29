#!/bin/bash

# Ubuntu Server Deployment Fix Script
# This script fixes common issues when deploying to Ubuntu server

echo "🔧 Fixing Ubuntu Server Deployment Issues..."

# 1. Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "📝 Creating .env.local file..."
    
    cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://election:SecureElectionDB2024!@db:5432/election"
POSTGRES_DB=election
POSTGRES_USER=election
POSTGRES_PASSWORD=SecureElectionDB2024!

# NextAuth Configuration
NEXTAUTH_SECRET="tKAHqkJashMMQU73d8xjsQRV3aQ0N0DsxldhedGa7yo="
NEXTAUTH_URL="http://localhost:3000"
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
NEXT_PUBLIC_RECAPTCHA_KEY_SECRET=6LdjsNArAsAAAAAM7WiOdCW0PIlLw3gkkEgxzemxQ

# Redis Configuration
REDIS_URL="redis://:SecureRedis2024!@redis:6379"
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USERNAME=neic
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
SENDGRID_API_KEY=SG.9310000000000000000000000000000000000000
FROM_EMAIL=

# Server Configuration
APP_HTTP_PORT=3000
EOF
    
    echo "✅ .env.local file created!"
else
    echo "✅ .env.local file exists"
fi

# 2. Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x docker/entrypoint.sh
chmod +x docker/uploads-backup.sh

# 3. Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# 4. Clean up any issues
echo "🧹 Cleaning up..."
docker system prune -f

# 5. Build and start services
echo "🚀 Building and starting services..."
docker-compose up --build -d

# 6. Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# 7. Check if database is ready
echo "🗄️ Setting up database..."
docker-compose exec app npx prisma db push

# 8. Create admin users
echo "👤 Creating admin users..."
docker-compose exec app node scripts/create-admin.js

# 9. Restart application
echo "🔄 Restarting application..."
docker-compose restart app

# 10. Check status
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Deployment fix completed!"
echo ""
echo "📋 Service URLs:"
echo "   Application: http://localhost:3000"
echo "   Login: http://localhost:3000/en/login"
echo "   pgAdmin: http://localhost:5050"
echo ""
echo "🔑 Check user-credentials.json for login details"
echo ""
echo "📝 To view logs: docker-compose logs app -f"
echo "🛠️ To check status: docker-compose ps"
