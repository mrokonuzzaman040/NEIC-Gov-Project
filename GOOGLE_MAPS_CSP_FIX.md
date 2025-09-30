# Google Maps CSP Fix

## Problem
The contact page was showing the following error:
```
Refused to frame 'https://maps.google.com/' because it violates the following Content Security Policy directive: "frame-src 'self' https://www.google.com".
```

## Root Cause
The Content Security Policy (CSP) configuration was only allowing `https://www.google.com` in the `frame-src` directive, but Google Maps iframes use `https://maps.google.com`.

## Solution
Updated the CSP configuration to include the necessary Google Maps domains:

### 1. Application Level (lib/middleware.ts)
The application-level CSP was already correctly configured with:
```typescript
const MAPS_DOMAINS = [
  'https://maps.googleapis.com',
  'https://maps.gstatic.com',
  'https://maps.google.com'
];
```

### 2. Server Level (nginx configuration)
Updated the nginx CSP header to include Google Maps domains:

**Before:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google.com; frame-src 'self' https://www.google.com;" always;
```

**After:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google.com https://maps.googleapis.com https://maps.gstatic.com https://maps.google.com; frame-src 'self' https://www.google.com https://maps.google.com;" always;
```

## Required Domains for Google Maps

### frame-src (for iframes)
- `https://www.google.com` - reCAPTCHA and other Google services
- `https://maps.google.com` - Google Maps iframe embeds

### script-src (for JavaScript)
- `https://www.google.com` - reCAPTCHA scripts
- `https://www.gstatic.com` - Google static resources
- `https://maps.googleapis.com` - Google Maps API
- `https://maps.gstatic.com` - Google Maps static resources
- `https://maps.google.com` - Google Maps scripts

### connect-src (for API calls)
- `https://www.google.com` - reCAPTCHA API calls
- `https://maps.googleapis.com` - Google Maps API calls
- `https://maps.gstatic.com` - Google Maps static resources
- `https://maps.google.com` - Google Maps API calls

## Implementation

### Option 1: Automatic Fix (Recommended)
Run the provided script:
```bash
./fix-google-maps-csp.sh
```

### Option 2: Manual Fix
1. Edit your nginx configuration file (usually `/etc/nginx/sites-available/election`)
2. Update the `Content-Security-Policy` header to include the Google Maps domains
3. Test the configuration: `nginx -t`
4. Reload nginx: `systemctl reload nginx`

## Verification
After applying the fix:
1. Clear browser cache
2. Navigate to the contact page
3. Check browser console for CSP errors
4. Verify that the Google Maps iframe loads correctly

## Files Modified
- `SERVER_SETUP_GUIDE.md` - Updated nginx configuration examples
- `fix-google-maps-csp.sh` - Created automated fix script
- `GOOGLE_MAPS_CSP_FIX.md` - This documentation

## Security Notes
The added domains are necessary for Google Maps functionality:
- `maps.google.com` - Required for iframe embeds
- `maps.googleapis.com` - Required for API calls
- `maps.gstatic.com` - Required for static resources

These domains are all official Google domains and are safe to include in the CSP.

