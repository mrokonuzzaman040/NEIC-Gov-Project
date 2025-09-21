import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, securityHeadersMiddleware, rateLimitMiddleware } from './lib/middleware';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'bn'],

  // Used when no locale matches
  defaultLocale: 'bn'
});

export default async function middleware(request: NextRequest) {
  // Apply rate limiting first
  const rateLimitResponse = rateLimitMiddleware(request, 100, 15 * 60 * 1000);
  if (!rateLimitResponse.headers.get('x-middleware-next')) {
    return securityHeadersMiddleware(request, rateLimitResponse);
  }

  // Apply authentication middleware for admin routes
  const authResponse = await authMiddleware(request);
  if (!authResponse.headers.get('x-middleware-next')) {
    return securityHeadersMiddleware(request, authResponse);
  }

  // Apply internationalization middleware
  const intlResponse = intlMiddleware(request);
  const resolvedResponse = intlResponse instanceof Promise ? await intlResponse : intlResponse;
  return securityHeadersMiddleware(request, resolvedResponse);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(bn|en)/:path*',
    
    // Admin routes
    '/admin/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
