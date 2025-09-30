const MAPS_DOMAINS = [
  'https://maps.googleapis.com',
  'https://maps.gstatic.com',
  'https://maps.google.com'
];

const CDN_DOMAINS = [
  'https://cdn.jsdelivr.net'
];

export function buildCsp(nonce: string) {
  // Adjust CSP as needed (remove 'unsafe-inline' once all inline styles/scripts gone).
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${MAPS_DOMAINS.join(' ')} ${CDN_DOMAINS.join(' ')}`,
    `style-src 'self' https://fonts.googleapis.com ${CDN_DOMAINS.join(' ')}`,
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: ${MAPS_DOMAINS.join(' ')} https://www.gstatic.com ${CDN_DOMAINS.join(' ')}`,
    `connect-src 'self' ${MAPS_DOMAINS.join(' ')} ${CDN_DOMAINS.join(' ')}`,
    `frame-src 'self' ${MAPS_DOMAINS.join(' ')}`,
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
