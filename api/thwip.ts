import { Redis } from '@upstash/redis'

const ALLOWED_HOSTNAMES = new Set(['127.0.0.1', 'localhost', 'psiderman.com', 'www.psiderman.com'])

let cachedRedis: null | Redis = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Soft browser-only gate: missing Origin (same-origin/curl) is allowed,
  // a present Origin must be trusted. Referer is never trusted.
  const origin = req.headers.origin ?? ''
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const redis = getRedis()

  if (req.method === 'GET') {
    try {
      const raw = await redis.get<null | number | string>('thwips')
      const count = raw !== null && raw !== undefined ? Number(raw) || 0 : 0
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      return res.status(200).json({ count })
    } catch (error) {
      console.error('Failed to get thwip count from Redis:', error)
      return res.status(500).json({ error: 'Failed to get thwip count' })
    }
  }

  if (req.method === 'POST') {
    try {
      let delta = 1
      if (req.body) {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        if (typeof body.delta === 'number' && Number.isFinite(body.delta)) {
          delta = Math.max(1, Math.min(100, Math.round(body.delta)))
        }
      }

      const count = await redis.incrby('thwips', delta)
      return res.status(200).json({ count: Number(count) || 0 })
    } catch (error) {
      console.error('Failed to increment thwip count in Redis:', error)
      return res.status(500).json({ error: 'Failed to increment thwip count' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
}

function getRedis(): Redis {
  if (cachedRedis) return cachedRedis

  const url =
    process.env.REDIS_KV_REST_API_URL ||
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL

  const token =
    process.env.REDIS_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    cachedRedis = new Redis({ token, url })
  } else {
    cachedRedis = Redis.fromEnv()
  }

  return cachedRedis
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}
