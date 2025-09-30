#!/bin/bash

# Script to fix Google Maps CSP issue
# This script updates nginx configuration to allow Google Maps iframes

echo "🔧 Fixing Google Maps CSP Configuration..."

# Check if nginx config exists
NGINX_CONFIG="/etc/nginx/sites-available/election"
if [ -f "$NGINX_CONFIG" ]; then
    echo "📝 Found nginx configuration at $NGINX_CONFIG"
    
    # Backup the original configuration
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Created backup of nginx configuration"
    
    # Update the CSP header to include Google Maps domains
    sed -i 's/frame-src '\''self'\'' https:\/\/www\.google\.com/frame-src '\''self'\'' https:\/\/www.google.com https:\/\/maps.google.com/g' "$NGINX_CONFIG"
    
    # Also update script-src and connect-src to include Google Maps domains
    sed -i 's/script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\'' https:\/\/www\.google\.com https:\/\/www\.gstatic\.com/script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\'' https:\/\/www.google.com https:\/\/www.gstatic.com https:\/\/maps.googleapis.com https:\/\/maps.gstatic.com https:\/\/maps.google.com/g' "$NGINX_CONFIG"
    
    sed -i 's/connect-src '\''self'\'' https:\/\/www\.google\.com/connect-src '\''self'\'' https:\/\/www.google.com https:\/\/maps.googleapis.com https:\/\/maps.gstatic.com https:\/\/maps.google.com/g' "$NGINX_CONFIG"
    
    echo "✅ Updated nginx configuration with Google Maps domains"
    
    # Test nginx configuration
    echo "🧪 Testing nginx configuration..."
    if nginx -t; then
        echo "✅ Nginx configuration is valid"
        
        # Reload nginx
        echo "🔄 Reloading nginx..."
        systemctl reload nginx
        echo "✅ Nginx reloaded successfully"
    else
        echo "❌ Nginx configuration test failed. Please check the configuration."
        exit 1
    fi
else
    echo "⚠️  Nginx configuration not found at $NGINX_CONFIG"
    echo "📋 Please manually update your nginx configuration with the following CSP:"
    echo ""
    echo "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; frame-src 'self' https://www.google.com https://maps.google.com;\" always;"
fi

echo ""
echo "🎉 Google Maps CSP fix completed!"
echo "📝 The updated configuration now allows:"
echo "   - https://maps.google.com (for iframes)"
echo "   - https://maps.googleapis.com (for API calls)"
echo "   - https://maps.gstatic.com (for static resources)"
echo ""
echo "🔄 Please restart your application if needed."

