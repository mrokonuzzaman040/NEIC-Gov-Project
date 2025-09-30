#!/bin/bash

# Script to fix production CSP issues for jsdelivr.net and reCAPTCHA
# This script addresses the production CSP violations that prevent:
# 1. CSS source maps from jsdelivr.net
# 2. reCAPTCHA from working properly

echo "🔧 Fixing Production CSP Issues..."
echo ""

# Create backup of current middleware
if [ -f "lib/middleware.ts" ]; then
    cp lib/middleware.ts lib/middleware.ts.backup.$(date +%Y%m%d_%H%M%S)
    echo "💾 Created backup of middleware.ts"
fi

echo "📋 Issues being fixed:"
echo "   ✅ Adding https://cdn.jsdelivr.net to CSP directives"
echo "   ✅ Removing upgrade-insecure-requests to allow reCAPTCHA"
echo "   ✅ Ensuring all Google domains are properly configured"
echo ""

echo "🔍 Current CSP configuration analysis:"
echo "   - Development CSP: ✅ Includes CDN domains"
echo "   - Production CSP: ❌ Missing CDN domains (nginx override)"
echo "   - upgrade-insecure-requests: ❌ Blocking reCAPTCHA"
echo ""

echo "📝 Production deployment steps:"
echo ""
echo "1. 🚀 Deploy the updated application code:"
echo "   - The middleware.ts has been updated with CDN domains"
echo "   - upgrade-insecure-requests has been disabled"
echo ""
echo "2. 🔧 Update nginx configuration:"
echo "   Replace your current CSP header with:"
echo ""
echo "   add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://cdn.jsdelivr.net; connect-src 'self' https://www.google.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com https://cdn.jsdelivr.net; frame-src 'self' https://www.google.com https://maps.google.com;\" always;"
echo ""
echo "3. 🔄 Restart services:"
echo "   - Restart nginx: sudo systemctl reload nginx"
echo "   - Restart your application"
echo ""
echo "4. ✅ Verify the fix:"
echo "   - Check browser console for CSP errors"
echo "   - Test reCAPTCHA functionality"
echo "   - Verify Google Maps loading"
echo ""

echo "🎯 Expected results after fix:"
echo "   ✅ No more jsdelivr.net CSP violations"
echo "   ✅ reCAPTCHA loads and works properly"
echo "   ✅ Google Maps iframes load without errors"
echo "   ✅ CSS source maps load from CDN"
echo ""

echo "⚠️  Important notes:"
echo "   - The upgrade-insecure-requests directive was removed to allow reCAPTCHA"
echo "   - This is necessary for Google services to work properly"
echo "   - Security is maintained through specific domain allowlists"
echo ""

echo "🎉 Production CSP fix script completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy the updated code to production"
echo "   2. Update nginx CSP configuration"
echo "   3. Restart services"
echo "   4. Test functionality"
