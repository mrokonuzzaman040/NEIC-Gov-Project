import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define UserRole enum locally to avoid import issues
enum UserRole {
  ADMIN = 'ADMIN',
  MANAGEMENT = 'MANAGEMENT',
  SUPPORT = 'SUPPORT',
  VIEWER = 'VIEWER'
}

// Helper function to check user permissions (moved here to avoid Edge Runtime issues)
function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.VIEWER]: 0,
    [UserRole.SUPPORT]: 1,
    [UserRole.MANAGEMENT]: 2,
    [UserRole.ADMIN]: 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Define route permissions
const routePermissions: Record<string, UserRole> = {
  '/admin': UserRole.VIEWER,
  '/admin/dashboard': UserRole.SUPPORT,
  '/admin/submissions': UserRole.SUPPORT,
  '/admin/users': UserRole.MANAGEMENT,
  '/admin/settings': UserRole.ADMIN,
  '/admin/audit': UserRole.MANAGEMENT,
  '/admin/reports': UserRole.SUPPORT,
};

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // CRITICAL: Only handle admin routes - this middleware should ONLY be called for admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Skip authentication for admin login and unauthorized pages
  if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {
    return NextResponse.next();
  }

  // SECURITY: Get token with strict validation
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  // IMMEDIATE redirect if not authenticated - no content exposure
  if (!token) {
    const loginUrl = new URL('/bn/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    loginUrl.searchParams.set('error', 'AuthenticationRequired');
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is active - immediate redirect if inactive
  if (!token.isActive) {
    const loginUrl = new URL('/bn/login', request.url);
    loginUrl.searchParams.set('error', 'AccountDeactivated');
    return NextResponse.redirect(loginUrl);
  }

  // Validate token structure
  if (!token.role || !token.email) {
    const loginUrl = new URL('/bn/login', request.url);
    loginUrl.searchParams.set('error', 'InvalidToken');
    return NextResponse.redirect(loginUrl);
  }

  // Check permissions for specific routes
  const requiredRole = routePermissions[pathname];
  if (requiredRole && !hasPermission(token.role as UserRole, requiredRole)) {
    return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
  }

  // Add security headers for authenticated admin requests
  const response = NextResponse.next();
  response.headers.set('X-Admin-Access', 'authenticated');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  return response;
}

// Security headers middleware
const isProduction = process.env.NODE_ENV === 'production';

const RECAPTCHA_DOMAINS = [
  'https://www.google.com',
  'https://www.gstatic.com',
  'https://www.google.com/recaptcha/',
  'https://www.gstatic.com/recaptcha/',
  'https://www.recaptcha.net',
  'https://www.recaptcha.net/recaptcha/'
];

const MAPS_DOMAINS = [
  'https://maps.googleapis.com',
  'https://maps.gstatic.com',
  'https://maps.google.com'
];

const CDN_DOMAINS = [
  'https://cdn.jsdelivr.net'
];

function buildContentSecurityPolicy() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...RECAPTCHA_DOMAINS,
    ...MAPS_DOMAINS,
    ...CDN_DOMAINS
  ];

  if (!isProduction) {
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = [
    "'self'",
    ...RECAPTCHA_DOMAINS,
    ...MAPS_DOMAINS,
    ...CDN_DOMAINS
  ];

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    ...RECAPTCHA_DOMAINS,
    ...MAPS_DOMAINS,
    ...CDN_DOMAINS
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${CDN_DOMAINS.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    "font-src 'self' https://fonts.gstatic.com data:",
    `connect-src ${connectSrc.join(' ')}`,
    `frame-src 'self' ${[...RECAPTCHA_DOMAINS, ...MAPS_DOMAINS].join(' ')}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:"
  ];

  // Note: upgrade-insecure-requests removed to allow reCAPTCHA and Google Maps to work properly
  // The 'unsafe-inline' and specific domain allowlists provide sufficient security
  // if (isProduction) {
  //   directives.push('upgrade-insecure-requests');
  // }

  return directives.join('; ');
}

export function securityHeadersMiddleware(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  
  // Enhanced security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Permissions-Policy', 'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), microphone=(), midi=(), payment=(), usb=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy());

  // CRITICAL: Additional security for admin routes
  if (pathname.startsWith('/admin')) {
    // Prevent caching of admin pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Additional security headers for admin
    response.headers.set('X-Admin-Security', 'enabled');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
  }

  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(request: NextRequest, limit: number = 100, windowMs: number = 15 * 60 * 1000) {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname === '/rate-limit' ||
    /^\/(bn|en)\/rate-limit(?:\/|$)/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = request.ip || forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

  if (!ip || ip === 'unknown') {
    return NextResponse.next();
  }

  const now = Date.now();
  const windowStart = now - windowMs;
  
  const current = rateLimitMap.get(ip);
  
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(ip, { count: 1, resetTime: now });
    return NextResponse.next();
  }

  if (current.count >= limit) {
    const isApiRoute = pathname.startsWith('/api');

    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        }
      );
    }

    const localeMatch = pathname.match(/^\/(bn|en)(?:\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'bn';
    const redirectUrl = new URL(`/${locale}/rate-limit`, request.url);
    const response = NextResponse.redirect(redirectUrl, { status: 307 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  current.count++;
  current.resetTime = now;
  return NextResponse.next();
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (data.resetTime < now - 15 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
