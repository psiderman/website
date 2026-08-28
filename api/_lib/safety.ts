import { lookup } from 'node:dns/promises'

// SSRF-safe outbound fetch for Vercel serverless functions.
//
// `safeFetch` blocks requests to internal/private ranges and refuses to
// follow redirects, so a user-supplied URL can never be bounced onto the
// metadata endpoint (169.254.169.254), localhost, or other internal hosts.

/**
 * Outbound fetch that blocks internal/private destinations and redirects.
 * Throws on unsafe URLs so callers can fall back gracefully.
 */
export async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  const parsed = new URL(url)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Unsupported URL scheme')
  }
  if (await resolvesToInternal(parsed.hostname)) {
    throw new Error('URL resolves to a private/internal address')
  }

  const res = await fetch(parsed.toString(), { ...init, redirect: 'manual' })
  if (res.status >= 300 && res.status < 400) {
    throw new Error('Redirects are not allowed')
  }
  return res
}

function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    // Conservatively block loopback/ULA/link-local/multicast IPv6.
    const v6 = ip.toLowerCase()
    return (
      v6 === '::1' ||
      v6.startsWith('fc') ||
      v6.startsWith('fd') ||
      v6.startsWith('fe8') ||
      v6.startsWith('fe9') ||
      v6.startsWith('fea') ||
      v6.startsWith('feb') ||
      v6.startsWith('ff')
    )
  }

  const parts = ip.split('.').map((n) => Number(n))
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true

  const [a, b] = parts
  return (
    a === 0 || // 0.0.0.0/8
    a === 10 || // 10/8
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64/10
    (a === 169 && b === 254) || // link-local / metadata
    (a === 172 && b >= 16 && b <= 31) || // 172.16/12
    (a === 192 && b === 168) || // 192.168/16
    a >= 224 // multicast + reserved
  )
}

async function resolvesToInternal(hostname: string): Promise<boolean> {
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return true
  }
  // hostname is already an IP literal
  if (/^[\d.]+$/.test(hostname) || hostname.includes(':')) return isPrivateIp(hostname)

  try {
    const addresses = await lookup(hostname, { all: true })
    if (addresses.length === 0) return true
    return addresses.some((a) => isPrivateIp(a.address))
  } catch {
    // DNS resolution failed — deny closed
    return true
  }
}
