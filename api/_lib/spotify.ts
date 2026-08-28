// Shared Spotify OAuth token refresh for Vercel serverless functions.
export async function getSpotifyAccessToken(): Promise<string> {
  const client_id = process.env.SPOTIFY_CLIENT_ID
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

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
