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
export function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // HSTS for HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
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

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
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
