const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || req.headers.referer || ''
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  if (!client_id || !client_secret || !refresh_token) {
    return res.status(500).json({ error: 'Missing Spotify credentials' })
  }

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')

  let access_token: string
  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    if (!tokenResponse.ok) {
      const errorDetails = await tokenResponse.text()
      return res.status(tokenResponse.status).json({
        details: errorDetails,
        error: 'Failed to fetch access token',
      })
    }

    const tokenData = await tokenResponse.json()
    access_token = tokenData.access_token

    if (!access_token) {
      return res.status(401).json({ error: 'Access token missing in response' })
    }
  } catch (err: unknown) {
    if (err instanceof Error) console.error('Get access token failed:', err.message)
    return res.status(500).json({ error: 'Failed to authenticate with Spotify' })
  }

  try {
    const recentlyPlayed = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=25',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )

    // Cache at edge for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

    if (!recentlyPlayed.ok) {
      return res.status(recentlyPlayed.status).json({
        error: 'Failed to fetch recently played from Spotify',
      })
    }

    const data = await recentlyPlayed.json()
    const items = data.items || []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracks = items.map((item: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      artist: item.track.artists.map((a: any) => a.name).join(', '),
      duration: item.track.duration_ms,
      explicit: item.track.explicit,
      played_at: item.played_at,
      song_url: item.track.external_urls.spotify,
      title: item.track.name,
      track_id: item.track.id,
    }))

    return res.status(200).json(tracks)
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
