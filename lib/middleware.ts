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
  
  // Skip middleware for public routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname === '/' ||
    pathname.startsWith('/bn') ||
    pathname.startsWith('/en') ||
    pathname.startsWith('/submit') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/reporting') ||
    pathname.startsWith('/commission') ||
    pathname.startsWith('/notice') ||
    pathname === '/login' ||
    pathname === '/admin/unauthorized'
  ) {
    return NextResponse.next();
  }

  // Check if it's an admin route
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is active
    if (!token.isActive) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'AccountDeactivated');
      return NextResponse.redirect(loginUrl);
    }

    // Check permissions for specific routes
    const requiredRole = routePermissions[pathname];
    if (requiredRole && !hasPermission(token.role as UserRole, requiredRole)) {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
    }
  }

  return NextResponse.next();
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

function buildContentSecurityPolicy() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...RECAPTCHA_DOMAINS
  ];

  if (!isProduction) {
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = [
    "'self'",
    ...RECAPTCHA_DOMAINS
  ];

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    ...RECAPTCHA_DOMAINS
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src ${imgSrc.join(' ')}`,
    "font-src 'self' https://fonts.gstatic.com data:",
    `connect-src ${connectSrc.join(' ')}`,
    `frame-src 'self' ${RECAPTCHA_DOMAINS.join(' ')}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:"
  ];

  if (isProduction) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

export function securityHeadersMiddleware(request: NextRequest, response: NextResponse) {
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
    return new NextResponse('Too Many Requests', { status: 429 });
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
