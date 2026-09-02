import { respondWithError } from './_lib/http.js'
import { isAllowedRequest } from './_lib/origin.js'
import { getSpotifyAccessToken } from './_lib/spotify.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (!isAllowedRequest(req)) {
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
    return respondWithError(res, err)
  }
}
