# CSS Issues Fix Guide

This guide addresses common CSS and static file serving issues in Docker deployments.

## 🎨 Common CSS Issues

### 1. CSS Not Loading
- **Symptoms**: Website appears without styling, looks like plain HTML
- **Causes**: Static file serving issues, build problems, cache issues

### 2. 404 Errors for CSS Files
- **Symptoms**: Browser shows 404 errors for `/_next/static/css/` files
- **Causes**: Incorrect static file serving, build artifacts missing

### 3. CSS Loading Slowly
- **Symptoms**: Website loads but CSS appears after a delay
- **Causes**: Network issues, large CSS files, server performance

## 🛠️ Fix Scripts

### Complete Reset (Recommended)
```bash
# Run the complete reset script
./complete-docker-reset.sh
```

### CSS-Specific Fix
```bash
# Run the CSS fix script
./fix-css-issues.sh
```

## 🔧 Manual Fixes

### 1. Check Container Status
```bash
docker-compose ps
```

### 2. Check Static Files in Container
```bash
docker-compose exec app ls -la /app/.next/static/css/
```

### 3. Rebuild Application
```bash
docker-compose exec app rm -rf /app/.next
docker-compose exec app npm run build
docker-compose restart app
```

### 4. Check CSS Accessibility
```bash
curl -I http://localhost:3000/_next/static/css/
```

### 5. View Application Logs
```bash
docker-compose logs app -f
```

## 🌐 Browser Troubleshooting

### 1. Hard Refresh
- **Chrome/Firefox**: `Ctrl + F5` or `Ctrl + Shift + R`
- **Safari**: `Cmd + Shift + R`

### 2. Clear Browser Cache
- **Chrome**: Settings → Privacy → Clear browsing data
- **Firefox**: Settings → Privacy → Clear Data
- **Safari**: Develop → Empty Caches

### 3. Check Developer Tools
1. Open browser developer tools (`F12`)
2. Go to **Network** tab
3. Reload the page
4. Look for CSS files with 404 errors
5. Check if CSS files are being served correctly

### 4. Test in Incognito Mode
- Open incognito/private browsing window
- Navigate to http://localhost:3000
- Check if CSS loads properly

## 🔍 Debugging Commands

### Check Static File Serving
```bash
# Test CSS endpoint
curl -I http://localhost:3000/_next/static/css/

# Test main page
curl -I http://localhost:3000/

# Test login page
curl -I http://localhost:3000/en/login
```

### Check Container File System
```bash
# List static files
docker-compose exec app find /app/.next/static -name "*.css"

# Check build output
docker-compose exec app ls -la /app/.next/

# Check if CSS files exist
docker-compose exec app ls -la /app/.next/static/css/
```

### Check Application Logs
```bash
# View recent logs
docker-compose logs app --tail=50

# Follow logs in real-time
docker-compose logs app -f

# Check for static file errors
docker-compose logs app | grep -i "static\|css\|404"
```

## 🚨 Emergency Fixes

### Complete Reset
```bash
# Stop everything
docker-compose down

# Remove all Docker data
docker system prune -a -f --volumes

# Run complete reset script
./complete-docker-reset.sh
```

### Quick Restart
```bash
# Restart just the application
docker-compose restart app

# Or restart all services
docker-compose restart
```

### Rebuild Application
```bash
# Rebuild and restart
docker-compose up --build -d

# Or just rebuild the app service
docker-compose up --build app
```

## 📋 Verification Checklist

- [ ] Containers are running (`docker-compose ps`)
- [ ] Application is accessible (`curl -I http://localhost:3000/`)
- [ ] CSS files exist in container (`docker-compose exec app ls -la /app/.next/static/css/`)
- [ ] CSS endpoint is accessible (`curl -I http://localhost:3000/_next/static/css/`)
- [ ] No errors in logs (`docker-compose logs app`)
- [ ] Browser shows CSS (hard refresh with `Ctrl+F5`)

## 🎯 Common Solutions

### Solution 1: Hard Refresh Browser
- Most common fix
- Use `Ctrl+F5` or `Cmd+Shift+R`

### Solution 2: Clear Browser Cache
- Clear all browsing data
- Try incognito mode

### Solution 3: Rebuild Application
```bash
docker-compose exec app npm run build
docker-compose restart app
```

### Solution 4: Complete Reset
```bash
./complete-docker-reset.sh
```

## 📞 Support

If CSS issues persist after trying all solutions:

1. **Check logs**: `docker-compose logs app -f`
2. **Verify static files**: `docker-compose exec app ls -la /app/.next/static/`
3. **Test endpoints**: `curl -I http://localhost:3000/_next/static/css/`
4. **Browser dev tools**: Check Network tab for 404 errors

## 🎉 Success Indicators

- ✅ Website loads with proper styling
- ✅ No 404 errors for CSS files in browser dev tools
- ✅ CSS files are accessible via curl
- ✅ Application logs show no static file errors
- ✅ All containers are running and healthy

---

**Last Updated**: $(date)  
**Status**: ✅ CSS Issues Resolved
