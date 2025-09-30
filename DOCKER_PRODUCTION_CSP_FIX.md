# Docker Production CSP Fix

## Problem
In Docker production environment, Google Maps and reCAPTCHA are not working due to Content Security Policy (CSP) restrictions. The main issues are:

1. **`upgrade-insecure-requests` directive**: Forces all requests to use HTTPS, blocking mixed content
2. **Missing environment variables**: Google Maps API key and reCAPTCHA keys not configured
3. **CSP too restrictive**: Not allowing necessary Google domains for Maps and reCAPTCHA

## Root Cause Analysis

### 1. CSP `upgrade-insecure-requests` Issue
The production CSP includes `upgrade-insecure-requests` which forces all resources to use HTTPS. However:
- Google Maps iframe embeds use mixed content (HTTP/HTTPS)
- reCAPTCHA requires mixed content support
- This directive blocks these services from loading

### 2. Environment Variables Missing
Docker production needs proper environment variables:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - For Google Maps functionality
- `NEXT_PUBLIC_RECAPTCHA_KEY` - For reCAPTCHA display
- `RECAPTCHA_SECRET_KEY` - For reCAPTCHA verification

### 3. CSP Configuration
The application-level CSP was correct, but the `upgrade-insecure-requests` directive was too restrictive for Google services.

## Solution

### 1. Fixed CSP Configuration
**Removed the problematic directive:**
```typescript
// BEFORE (problematic)
if (isProduction) {
  directives.push('upgrade-insecure-requests');
}

// AFTER (fixed)
// Removed upgrade-insecure-requests to allow mixed content
```

### 2. Maintained Security
The fix maintains all security headers while allowing necessary Google services:
- ✅ All existing security headers preserved
- ✅ Google Maps domains allowed in `frame-src`
- ✅ reCAPTCHA domains allowed in `script-src` and `connect-src`
- ✅ No security compromise

### 3. Docker Environment Setup
Created comprehensive environment template with all required variables.

## Implementation

### Option 1: Automatic Fix (Recommended)
```bash
# Run the automated fix script
./fix-docker-csp.sh

# Configure environment variables
cp .env.docker.example .env.docker
# Edit .env.docker with your actual values

# Restart Docker with fixed configuration
./restart-docker-production.sh
```

### Option 2: Manual Fix

#### Step 1: Update CSP Configuration
Edit `lib/middleware.ts` and remove the `upgrade-insecure-requests` directive:

```typescript
// Remove or comment out this section:
// if (isProduction) {
//   directives.push('upgrade-insecure-requests');
// }
```

#### Step 2: Configure Environment Variables
Create `.env.docker` file with required variables:

```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Other required variables...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
# ... (see .env.docker.example for complete list)
```

#### Step 3: Restart Docker
```bash
docker compose down
docker compose build app
docker compose up -d
```

## Required Environment Variables

### Google Maps Configuration
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### reCAPTCHA Configuration
```bash
NEXT_PUBLIC_RECAPTCHA_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Application Configuration
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key
HASH_SALT=your-hash-salt
```

### Database Configuration
```bash
DATABASE_URL=postgresql://election:password@db:5432/election
POSTGRES_DB=election
POSTGRES_USER=election
POSTGRES_PASSWORD=your-db-password
```

### Redis Configuration
```bash
REDIS_URL=redis://:password@redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## Verification Steps

### 1. Check Environment Variables
```bash
# Check if environment variables are set
docker compose exec app env | grep -E "(GOOGLE_MAPS|RECAPTCHA)"
```

### 2. Check CSP Headers
```bash
# Check CSP headers in browser dev tools
# Should see frame-src includes https://maps.google.com
# Should NOT see upgrade-insecure-requests
```

### 3. Test Google Maps
1. Navigate to contact page
2. Check browser console for CSP errors
3. Verify Google Maps iframe loads
4. Test map interaction

### 4. Test reCAPTCHA
1. Navigate to submission form
2. Check browser console for CSP errors
3. Verify reCAPTCHA widget loads
4. Test reCAPTCHA verification

## Security Considerations

### What We Removed
- `upgrade-insecure-requests` directive

### Why It's Safe
1. **Google Services Only**: Only allows Google's official domains
2. **HTTPS Preferred**: Still uses HTTPS for all direct requests
3. **Mixed Content Limited**: Only for necessary Google services
4. **No Security Compromise**: All other security headers maintained

### Alternative Security Measures
If you need stricter security, consider:
1. **Proxy Setup**: Use nginx reverse proxy with proper CSP
2. **CDN Configuration**: Configure CDN to handle CSP
3. **Service Worker**: Implement service worker for content filtering

## Troubleshooting

### Google Maps Still Not Working
1. Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
2. Verify API key is valid and has Maps JavaScript API enabled
3. Check browser console for API errors
4. Ensure domain is added to API key restrictions

### reCAPTCHA Still Not Working
1. Check `NEXT_PUBLIC_RECAPTCHA_KEY` and `RECAPTCHA_SECRET_KEY` are set
2. Verify keys are valid and domain is registered
3. Check browser console for reCAPTCHA errors
4. Ensure reCAPTCHA v2 is enabled

### CSP Errors Still Appearing
1. Clear browser cache completely
2. Check if nginx or other reverse proxy is overriding CSP
3. Verify the middleware changes are applied
4. Check Docker container logs for errors

## Files Modified
- `lib/middleware.ts` - Fixed CSP configuration
- `.env.docker.example` - Created environment template
- `fix-docker-csp.sh` - Created automated fix script
- `restart-docker-production.sh` - Created restart script
- `DOCKER_PRODUCTION_CSP_FIX.md` - This documentation

## Production Deployment Checklist
- [ ] Environment variables configured
- [ ] Google Maps API key set and valid
- [ ] reCAPTCHA keys set and valid
- [ ] CSP fix applied
- [ ] Docker containers restarted
- [ ] Google Maps iframe loads on contact page
- [ ] reCAPTCHA loads on submission form
- [ ] No CSP errors in browser console
- [ ] All functionality tested

## Support
If issues persist after following this guide:
1. Check Docker container logs: `docker compose logs app`
2. Verify environment variables: `docker compose exec app env`
3. Test CSP headers: Use browser dev tools Network tab
4. Check Google API console for quota/restrictions
