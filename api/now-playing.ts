import { getDominantColorHex } from './_lib/color'
import { assertAllowedOrigin } from './_lib/origin'
import { getSpotifyAccessToken } from './_lib/spotify'

import type { VercelRequest, VercelResponse } from './_lib/http'

interface NowPlayingResponse {
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

const BLACK = '#000000'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!assertAllowedOrigin(req)) {
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

    const song = (await nowPlaying.json()) as NowPlayingResponse

    if (!song?.item) {
      return res.status(200).json({ isPlaying: false })
    }

    const albumImageUrl = song.item.album?.images?.[0]?.url || ''
    let vividColor = BLACK
    if (albumImageUrl) {
      try {
        vividColor = await getDominantColorHex(albumImageUrl)
      } catch {
        vividColor = BLACK
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
