import { getSwatches } from 'colorthief'

import { assertAllowedOrigin } from './_lib/origin'
import { safeFetch } from './_lib/safety'

import type { VercelRequest, VercelResponse } from './_lib/http'

const ALLOWED_HOSTS = new Set(['i.scdn.co', 'lh3.googleusercontent.com'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!assertAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const param = req.query.url
  if (!param) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }
  const url = Array.isArray(param) ? param[0] : param

  try {
    const parsed = new URL(url)
    if (
      !ALLOWED_HOSTS.has(parsed.hostname) ||
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
    ) {
      return res.status(400).json({ error: 'URL not allowed' })
    }

    const response = await safeFetch(url)
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
