const ALLOWED_HOSTNAMES = new Set(['127.0.0.1', 'localhost', 'psiderman.com', 'www.psiderman.com'])

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}

// Soft browser-only gate: missing Origin (same-origin/curl) is allowed,
// a present Origin must be trusted. Referer is never trusted.
export function isAllowedRequest(req: { headers: { origin?: unknown } }): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
  return origin === '' || isAllowedOrigin(origin)
}
