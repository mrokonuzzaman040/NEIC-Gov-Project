export function buildCsp(nonce: string) {
  // Adjust CSP as needed (remove 'unsafe-inline' once all inline styles/scripts gone).
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  return csp.join('; ');
}

export function securityHeaders(nonce: string) {
  return {
    'Content-Security-Policy': buildCsp(nonce),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff'
  } as const;
}
