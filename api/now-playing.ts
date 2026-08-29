import { getSwatches } from 'colorthief'

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
    const nowPlaying = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    // Always set cache header before sending a response
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate')

    if (nowPlaying.status === 204 || nowPlaying.status >= 400) {
      return res.status(200).json({ isPlaying: false })
    }

    const song = (await nowPlaying.json()) as {
      is_playing?: boolean
      item?: null | {
        album?: { images?: { url?: string }[]; name?: string }
        artists?: { name?: string }[]
        duration_ms?: number
        explicit?: boolean
        external_urls?: { spotify?: string }
        name?: string
      }
    }

    if (!song?.item) {
      return res.status(200).json({ isPlaying: false })
    }

    const albumImageUrl = song.item.album?.images?.[0]?.url || ''
    let vividColor = '#000000'
    if (albumImageUrl) {
      try {
        vividColor = await getDominantColorHex(albumImageUrl)
      } catch {
        vividColor = '#000000'
      }
    }

    return res.status(200).json({
      album: song.item.album?.name,
      albumImageUrl,
      artist: song.item.artists?.[0]?.name,
      duration: song.item.duration_ms,
      explicit: song.item.explicit,
      isPlaying: song.is_playing,
      songUrl: song.item.external_urls?.spotify,
      title: song.item.name,
      vividColor,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}

// Album-art URL comes straight from Spotify's own response. Keep the fetch
// conservative anyway: https only and no redirects.
async function getDominantColorHex(imageUrl: string): Promise<string> {
  const parsed = new URL(imageUrl)
  if (parsed.protocol !== 'https:') throw new Error('Unsupported URL scheme')

  const response = await fetch(parsed.toString(), { redirect: 'manual' })
  if (response.status >= 300 && response.status < 400) throw new Error('Redirects are not allowed')
  if (!response.ok) throw new Error('Image fetch failed')

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const swatches = await getSwatches(buffer)
  const targetSwatch = swatches.Vibrant || swatches.LightVibrant || swatches.DarkVibrant
  const chosen = targetSwatch || Object.values(swatches).find(Boolean)

  if (!chosen) throw new Error('Failed to extract colors from image')
  return chosen.color.hex()
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