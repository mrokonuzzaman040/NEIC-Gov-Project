#!/bin/bash

# Script to remove server-level CSP headers that conflict with application CSP
# This allows the Next.js application to handle CSP via middleware

echo "🔧 Removing Server-Level CSP Configuration..."
echo "This will allow your Next.js application to handle CSP via middleware"
echo ""

# Common nginx configuration locations
NGINX_CONFIGS=(
    "/etc/nginx/sites-available/election"
    "/etc/nginx/conf.d/election.conf"
    "/etc/nginx/nginx.conf"
    "/usr/local/etc/nginx/sites-available/election"
    "/opt/nginx/conf/nginx.conf"
)

# Apache configuration locations
APACHE_CONFIGS=(
    "/etc/apache2/sites-available/election.conf"
    "/etc/httpd/conf/httpd.conf"
    "/etc/apache2/apache2.conf"
)

echo "🔍 Searching for server configuration files..."

# Check nginx configurations
for config in "${NGINX_CONFIGS[@]}"; do
    if [ -f "$config" ]; then
        echo "📝 Found nginx configuration at $config"
        
        # Backup the configuration
        cp "$config" "$config.backup.$(date +%Y%m%d_%H%M%S)"
        echo "💾 Created backup: $config.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Remove CSP headers (both old and new versions)
        sed -i '/add_header Content-Security-Policy/d' "$config"
        echo "✅ Removed CSP headers from $config"
        
        # Test nginx configuration
        if command -v nginx >/dev/null 2>&1; then
            echo "🧪 Testing nginx configuration..."
            if nginx -t 2>/dev/null; then
                echo "✅ Nginx configuration is valid"
                echo "🔄 Reloading nginx..."
                if systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null; then
                    echo "✅ Nginx reloaded successfully"
                else
                    echo "⚠️  Could not reload nginx automatically. Please reload manually."
                fi
            else
                echo "❌ Nginx configuration test failed. Please check the configuration."
                echo "💾 Restore from backup if needed: cp $config.backup.* $config"
            fi
        else
            echo "⚠️  Nginx not found. Please test and reload manually."
        fi
        
        echo ""
    fi
done

# Check apache configurations
for config in "${APACHE_CONFIGS[@]}"; do
    if [ -f "$config" ]; then
        echo "📝 Found apache configuration at $config"
        
        # Backup the configuration
        cp "$config" "$config.backup.$(date +%Y%m%d_%H%M%S)"
        echo "💾 Created backup: $config.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Remove CSP headers
        sed -i '/Header always set Content-Security-Policy/d' "$config"
        echo "✅ Removed CSP headers from $config"
        
        echo "⚠️  Please restart apache manually: systemctl restart apache2"
        echo ""
    fi
done

# Check docker-compose.yml for any CSP-related environment variables
if [ -f "docker-compose.yml" ]; then
    echo "🐳 Checking docker-compose.yml for CSP configuration..."
    if grep -q "Content-Security-Policy\|CSP" docker-compose.yml; then
        echo "⚠️  Found CSP configuration in docker-compose.yml"
        echo "📝 Please manually review and remove CSP headers from docker-compose.yml"
    else
        echo "✅ No CSP configuration found in docker-compose.yml"
    fi
fi

echo ""
echo "🎉 Server-level CSP removal completed!"
echo ""
echo "📋 What was removed:"
echo "   - Old CSP: frame-src 'self' https://www.google.com"
echo "   - New CSP: frame-src 'self' https://www.google.com https://maps.google.com"
echo ""
echo "✅ Your Next.js application will now handle CSP via middleware"
echo "✅ The application-level CSP includes all necessary Google Maps domains"
echo ""
echo "🔄 Next steps:"
echo "   1. Restart your web server if not done automatically"
echo "   2. Test the website: curl -I https://your-domain.com | grep CSP"
echo "   3. Verify Google Maps works without CSP errors"
echo ""
echo "⚠️  If you need to restore the backup:"
echo "   cp /path/to/config.backup.* /path/to/config"


