const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

const ALLOWED_HOSTNAMES = new Set(['127.0.0.1', 'localhost', 'psiderman.com', 'www.psiderman.com'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Soft browser-only gate: missing Origin (same-origin/curl) is allowed,
  // a present Origin must be trusted. Referer is never trusted.
  const origin = req.headers.origin ?? ''
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  let access_token: string
  try {
    access_token = await getSpotifyAccessToken()
  } catch (err: unknown) {
    console.error('Get access token failed:', err instanceof Error ? err.message : err)
    return res.status(500).json({ error: 'Failed to authenticate with Spotify' })
  }

  try {
    const recentlyPlayed = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=25',
      { headers: { Authorization: `Bearer ${access_token}` } },
    )

    // Cache at edge for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

    if (!recentlyPlayed.ok) {
      return res.status(recentlyPlayed.status).json({
        error: 'Failed to fetch recently played from Spotify',
      })
    }

    const data = (await recentlyPlayed.json()) as {
      items?: {
        played_at?: string
        track?: {
          artists?: { name?: string }[]
          duration_ms?: number
          explicit?: boolean
          external_urls?: { spotify?: string }
          id?: string
          name?: string
        }
      }[]
    }

    const tracks = (data.items || []).map((item) => ({
      artist: (item.track?.artists || []).map((a) => a.name).join(', '),
      duration: item.track?.duration_ms,
      explicit: item.track?.explicit,
      played_at: item.played_at,
      song_url: item.track?.external_urls?.spotify,
      title: item.track?.name,
      track_id: item.track?.id,
    }))

    return res.status(200).json(tracks)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

async function getSpotifyAccessToken(): Promise<string> {
  if (!client_id || !client_secret || !refresh_token) {
    throw new Error('Missing Spotify credentials')
  }

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token }),
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!tokenResponse.ok) {
    throw new Error(`Spotify token refresh failed: ${tokenResponse.status}`)
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string }
  if (!tokenData.access_token) {
    throw new Error('Access token missing in response')
  }
  return tokenData.access_token
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}