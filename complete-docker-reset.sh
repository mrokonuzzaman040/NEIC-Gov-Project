#!/bin/bash

# Complete Docker Reset and Reinstall Script
# This script completely clears Docker and reinstalls everything to fix CSS and other issues

echo "🧹 Starting Complete Docker Reset and Reinstall..."
echo "=================================================="

# 1. Stop all running containers
echo "🛑 Step 1: Stopping all running containers..."
docker-compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# 2. Remove all containers
echo "🗑️ Step 2: Removing all containers..."
docker container prune -f
docker rm -f $(docker ps -aq) 2>/dev/null || true

# 3. Remove all images
echo "🖼️ Step 3: Removing all images..."
docker image prune -a -f
docker rmi -f $(docker images -aq) 2>/dev/null || true

# 4. Remove all volumes
echo "💾 Step 4: Removing all volumes..."
docker volume prune -f
docker volume rm $(docker volume ls -q) 2>/dev/null || true

# 5. Remove all networks
echo "🌐 Step 5: Removing all networks..."
docker network prune -f
docker network rm $(docker network ls -q) 2>/dev/null || true

# 6. Complete system cleanup
echo "🧽 Step 6: Complete system cleanup..."
docker system prune -a -f --volumes
docker builder prune -a -f

# 7. Show space freed
echo "📊 Step 7: Checking space freed..."
docker system df

# 8. Create fresh .env.local file
echo "📝 Step 8: Creating fresh environment configuration..."
cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://election:change_me@db:5432/election
POSTGRES_DB=election
POSTGRES_USER=election
POSTGRES_PASSWORD=change_me

# NextAuth Configuration
NEXTAUTH_SECRET=tKAHqkJashMMQU73d8xjsQRV3aQ0N0DsxldhedGa7yo=
NEXTAUTH_URL=http://localhost:3000
HASH_SALT=replace-with-long-random-secret

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info
UPLOAD_DIR=/app/uploads/submissions
SEED_DATABASE=false

# Public Configuration
NEXT_PUBLIC_APP_NAME=BD Election Commission Portal
NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB=25
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB2Ao953YsjaZPlN_H1QR9yd0W60UP7uLE
NEXT_PUBLIC_RECAPTCHA_KEY=6LdjsNArAAAAAEWKWxEGhg_Dbq9T_JmdOvPtA8_j
NEXT_PUBLIC_RECAPTCHA_KEY_SECRET=6LdjsNArAAAAAAM7WiOdCW0PIlLw3gkkEgxzemxQ

# Redis Configuration
REDIS_URL=redis://:change_me_redis@redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=change_me_redis
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
EOF

# 9. Create fresh .env file
echo "📝 Step 9: Creating fresh .env file..."
cat > .env << 'EOF'
DATABASE_URL=postgresql://election:change_me@db:5432/election
NEXTAUTH_SECRET=tKAHqkJashMMQU73d8xjsQRV3aQ0N0DsxldhedGa7yo=
NEXTAUTH_URL=http://localhost:3000
HASH_SALT=replace-with-long-random-secret
REDIS_URL=redis://:change_me_redis@redis:6379
REDIS_PASSWORD=change_me_redis
EOF

# 10. Make scripts executable
echo "🔧 Step 10: Making scripts executable..."
chmod +x docker/entrypoint.sh
chmod +x docker/uploads-backup.sh
chmod +x scripts/create-admin.js

# 11. Clean any existing build artifacts
echo "🧹 Step 11: Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf temp-uploads/*

# 12. Test environment variables
echo "🔍 Step 12: Testing environment variables..."
source .env.local
if [ -z "$DATABASE_URL" ] || [ -z "$NEXTAUTH_URL" ]; then
    echo "❌ Environment variables not loaded correctly!"
    exit 1
fi
echo "✅ Environment variables loaded correctly"

# 13. Test docker-compose configuration
echo "🔍 Step 13: Testing docker-compose configuration..."
docker-compose config --quiet
if [ $? -ne 0 ]; then
    echo "❌ Docker Compose configuration is invalid!"
    exit 1
fi
echo "✅ Docker Compose configuration is valid"

# 14. Build and start services
echo "🚀 Step 14: Building and starting services..."
docker-compose up --build -d

# 15. Wait for services to be ready
echo "⏳ Step 15: Waiting for services to be ready..."
sleep 30

# 16. Check service status
echo "📊 Step 16: Checking service status..."
docker-compose ps

# 17. Wait for database to be ready
echo "🗄️ Step 17: Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec db pg_isready -U election -d election >/dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    fi
    echo "⏳ Waiting for database... ($i/30)"
    sleep 2
done

# 18. Setup database schema
echo "🗄️ Step 18: Setting up database schema..."
docker-compose exec app npx prisma db push

# 19. Create admin users
echo "👤 Step 19: Creating admin users..."
docker-compose exec app node scripts/create-admin.js

# 20. Restart application to ensure everything is loaded
echo "🔄 Step 20: Restarting application..."
docker-compose restart app

# 21. Wait for application to be ready
echo "⏳ Step 21: Waiting for application to be ready..."
sleep 15

# 22. Final status check
echo "📊 Step 22: Final status check..."
docker-compose ps

# 23. Test application endpoints
echo "🔍 Step 23: Testing application endpoints..."
echo "Testing main page..."
curl -I http://localhost:3000/ 2>/dev/null | head -1 || echo "❌ Main page not accessible"

echo "Testing login page..."
curl -I http://localhost:3000/en/login 2>/dev/null | head -1 || echo "❌ Login page not accessible"

echo "Testing static files..."
curl -I http://localhost:3000/_next/static/ 2>/dev/null | head -1 || echo "❌ Static files not accessible"

# 24. Show logs for any issues
echo "📋 Step 24: Checking application logs..."
docker-compose logs app --tail=20

echo ""
echo "🎉 Complete Docker Reset and Reinstall Finished!"
echo "=================================================="
echo ""
echo "📋 Service URLs:"
echo "   🌐 Application: http://localhost:3000"
echo "   🔐 Login: http://localhost:3000/en/login"
echo "   🗄️ pgAdmin: http://localhost:5050"
echo ""
echo "🔑 Login Credentials:"
echo "   Check user-credentials.json for generated passwords"
echo ""
echo "🔍 Troubleshooting Commands:"
echo "   📊 Check status: docker-compose ps"
echo "   📋 View logs: docker-compose logs app -f"
echo "   🔧 Restart app: docker-compose restart app"
echo "   🗄️ Check database: docker-compose exec db psql -U election -d election"
echo ""
echo "✅ If CSS is still not loading, check:"
echo "   1. Browser cache (Ctrl+F5 or Cmd+Shift+R)"
echo "   2. Network tab in browser dev tools"
echo "   3. Application logs for static file errors"
echo ""
echo "🚀 Your application should now be running without CSS issues!"
