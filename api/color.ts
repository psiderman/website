import { getSwatches } from 'colorthief'

const ALLOWED_HOSTNAMES = new Set(['127.0.0.1', 'localhost', 'psiderman.com', 'www.psiderman.com'])

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}

const ALLOWED_IMAGE_HOSTS = new Set(['i.scdn.co', 'lh3.googleusercontent.com'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Soft browser-only gate: missing Origin (same-origin/curl) is allowed,
  // a present Origin must be trusted. Referer is never trusted.
  const origin = req.headers.origin ?? ''
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const param = req.query.url
  if (!param) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }
  const url = Array.isArray(param) ? param[0] : param

  try {
    const parsed = new URL(url)
    // Exact host allowlist + https only + no redirects: blocks SSRF via the
    // metadata endpoint and internal networks.
    if (
      !ALLOWED_IMAGE_HOSTS.has(parsed.hostname) ||
      parsed.protocol !== 'https:'
    ) {
      return res.status(400).json({ error: 'URL not allowed' })
    }

    const response = await fetch(parsed.toString(), { redirect: 'manual' })
    if (response.status >= 300 && response.status < 400) {
      return res.status(400).json({ error: 'URL not allowed' })
    }
    if (!response.ok) throw new Error('Image fetch failed')

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const swatches = await getSwatches(buffer)

    const targetSwatch = swatches.Vibrant || swatches.LightVibrant || swatches.DarkVibrant
    const color = targetSwatch ? targetSwatch.color : Object.values(swatches).find(Boolean)?.color

    if (!color) {
      return res.status(500).json({ error: 'No color found' })
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')
    return res.status(200).json({ hex: color.hex() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}