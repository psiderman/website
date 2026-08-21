import { getSwatches } from 'colorthief'

const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

export async function getDominantColorHex(imageUrl: string) {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Image fetch failed')
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get semantic color swatches
    const swatches = await getSwatches(buffer)

    // Attempt to get the Vibrant color, fallback to other options if it doesn't exist
    const targetSwatch = swatches.Vibrant || swatches.LightVibrant || swatches.DarkVibrant

    if (!targetSwatch) {
      // Fallback to the first available swatch if no vibrant swatches exist
      const firstAvailable = Object.values(swatches).find(Boolean)
      if (firstAvailable) return firstAvailable.color.hex()
      throw new Error('Failed to extract colors from image')
    }

    return targetSwatch.color.hex()
  } catch (err: unknown) {
    if (err instanceof Error) console.error('Color extraction failed:', err.message)
    return '#000000'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || req.headers.referer || ''
  if (origin && !origin.includes('psiderman.com') && !origin.includes('localhost')) {
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
    const nowPlaying = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    // Always set cache header before sending a response
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate')

    if (nowPlaying.status === 204 || nowPlaying.status >= 400) {
      return res.status(200).json({ isPlaying: false })
    }

    const song = await nowPlaying.json()

    if (!song?.item) {
      return res.status(200).json({ isPlaying: false })
    }

    const albumImageUrl = song.item?.album?.images?.[0]?.url || ''
    const vividColor = albumImageUrl ? await getDominantColorHex(albumImageUrl) : '#000000'

    return res.status(200).json({
      album: song.item.album.name,
      albumImageUrl,
      artist: song.item.artists[0].name,
      duration: song.item.duration_ms,
      explicit: song.item.explicit,
      isPlaying: song.is_playing,
      songUrl: song.item.external_urls.spotify,
      title: song.item.name,
      vividColor,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
