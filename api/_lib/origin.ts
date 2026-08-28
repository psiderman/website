// Shared origin check for Vercel serverless functions.
//
// This is a soft browser-only gate: browsers send `Origin` on cross-origin
// requests, but the header is trivially spoofable by any non-browser client,
// so these endpoints must be treated as public. It exists to cut down on
// casual cross-site scraping, not as an auth boundary. `Referer` is NOT
// used, since it is fully attacker-controlled.
const ALLOWED_HOSTNAMES = new Set(['127.0.0.1', 'localhost', 'psiderman.com', 'www.psiderman.com'])

/**
 * Gate a request: true when the request carries an Origin header we trust.
 * When no Origin is present (same-origin requests, curl, server-to-server)
 * we allow it — this is a soft browser-side protection, not auth.
 */
export function assertAllowedOrigin(req: {
  headers: Record<string, string | string[] | undefined>
}): boolean {
  const origin = req.headers.origin ?? ''
  if (!origin) return true
  const value = Array.isArray(origin) ? origin[0] : origin
  return isAllowedOrigin(value)
}

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}
