#!/bin/bash

# CSS Issues Fix Script
# This script specifically addresses CSS and static file serving issues

echo "🎨 Fixing CSS and Static File Issues..."
echo "======================================"

# 1. Check if containers are running
echo "🔍 Step 1: Checking container status..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ No containers are running. Please run complete-docker-reset.sh first"
    exit 1
fi

# 2. Check Next.js build
echo "🔍 Step 2: Checking Next.js build..."
docker-compose exec app ls -la /app/.next 2>/dev/null || echo "❌ Next.js build not found"

# 3. Check static files in container
echo "🔍 Step 3: Checking static files..."
docker-compose exec app find /app/.next/static -name "*.css" | head -5

# 4. Check if CSS files are accessible
echo "🔍 Step 4: Testing CSS file accessibility..."
CSS_TEST=$(curl -s -I http://localhost:3000/_next/static/css/ 2>/dev/null | head -1)
if [[ $CSS_TEST == *"200"* ]]; then
    echo "✅ CSS files are accessible"
else
    echo "❌ CSS files are not accessible"
fi

# 5. Rebuild Next.js application
echo "🔧 Step 5: Rebuilding Next.js application..."
docker-compose exec app rm -rf /app/.next
docker-compose exec app npm run build

# 6. Check build output
echo "🔍 Step 6: Checking build output..."
docker-compose exec app ls -la /app/.next/static/css/ 2>/dev/null || echo "❌ No CSS files in build"

# 7. Restart application
echo "🔄 Step 7: Restarting application..."
docker-compose restart app

# 8. Wait for restart
echo "⏳ Step 8: Waiting for application restart..."
sleep 15

# 9. Test CSS accessibility again
echo "🔍 Step 9: Testing CSS accessibility after rebuild..."
CSS_TEST=$(curl -s -I http://localhost:3000/_next/static/css/ 2>/dev/null | head -1)
if [[ $CSS_TEST == *"200"* ]]; then
    echo "✅ CSS files are now accessible"
else
    echo "❌ CSS files are still not accessible"
fi

# 10. Check application logs for static file errors
echo "📋 Step 10: Checking for static file errors in logs..."
docker-compose logs app --tail=50 | grep -i "static\|css\|404" || echo "No static file errors found"

# 11. Test main page
echo "🔍 Step 11: Testing main page..."
MAIN_PAGE=$(curl -s -I http://localhost:3000/ 2>/dev/null | head -1)
if [[ $MAIN_PAGE == *"200"* ]]; then
    echo "✅ Main page is accessible"
else
    echo "❌ Main page is not accessible"
fi

# 12. Check if CSS is being served
echo "🔍 Step 12: Checking CSS content..."
CSS_CONTENT=$(curl -s http://localhost:3000/_next/static/css/ 2>/dev/null | head -1)
if [[ $CSS_CONTENT == *"css"* ]] || [[ $CSS_CONTENT == *"text/css"* ]]; then
    echo "✅ CSS content is being served"
else
    echo "❌ CSS content is not being served properly"
fi

echo ""
echo "🎨 CSS Fix Complete!"
echo "==================="
echo ""
echo "🔍 If CSS is still not loading, try:"
echo "   1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)"
echo "   2. Clear browser cache"
echo "   3. Check browser developer tools Network tab"
echo "   4. Try incognito/private browsing mode"
echo ""
echo "📋 Debugging Commands:"
echo "   📊 Check status: docker-compose ps"
echo "   📋 View logs: docker-compose logs app -f"
echo "   🔧 Restart app: docker-compose restart app"
echo "   🗄️ Check files: docker-compose exec app ls -la /app/.next/static/"
echo ""
echo "🌐 Test URLs:"
echo "   Main: http://localhost:3000"
echo "   Login: http://localhost:3000/en/login"
echo "   CSS: http://localhost:3000/_next/static/css/"
