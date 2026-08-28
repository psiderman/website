import { getSwatches } from 'colorthief'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || req.headers.referer || ''
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { url } = req.query
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  try {
    const allowedHosts = ['i.scdn.co', 'lh3.googleusercontent.com']
    const parsed = new URL(url)
    if (!allowedHosts.includes(parsed.hostname)) {
      return res.status(400).json({ error: 'URL not allowed' })
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Image fetch failed')

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const swatches = await getSwatches(buffer)

    const targetSwatch = swatches.Vibrant || swatches.LightVibrant || swatches.DarkVibrant
    const color = targetSwatch ? targetSwatch.color : Object.values(swatches).find(Boolean)?.color

    if (!color) {
      return res.status(500).json({ error: 'No color found' })
    }

    return res.status(200).json({ hex: color.hex() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return (
      hostname === 'psiderman.com' ||
      hostname === 'www.psiderman.com' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    )
  } catch {
    return false
  }
}
