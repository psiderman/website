// @ts-expect-error - npm imports are valid in Deno but not in standard TypeScript
import { createClient } from 'jsr:@supabase/supabase-js@2'

// @ts-expect-error - Deno is a global in the Edge Runtime
const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID')!
// @ts-expect-error - Deno is a global in the Edge Runtime
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET')!
// @ts-expect-error - Deno is a global in the Edge Runtime
const SPOTIFY_REFRESH_TOKEN = Deno.env.get('SPOTIFY_REFRESH_TOKEN')!

// @ts-expect-error - Deno is a global in the Edge Runtime
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// @ts-expect-error - Deno is a global in the Edge Runtime
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getAccessToken() {
  const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
  const response = await fetch('https://accounts.spotify.com/api/token', {
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch access token')
  }

  const data = await response.json()
  return data.access_token
}

// @ts-expect-error - Deno is a global in the Edge Runtime
Deno.serve(async (_req) => {
  try {
    const accessToken = await getAccessToken()

    const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=30', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Spotify API Error:', errorText)
      throw new Error('Failed to fetch recently played tracks')
    }

    const data = await res.json()
    const items = data.items

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ count: 0, success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records = items.map((item: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      artist: item.track.artists.map((a: any) => a.name).join(', '),
      duration: item.track.duration_ms,
      played_at: item.played_at,
      song_url: item.track.external_urls.spotify,
      title: item.track.name,
      track_id: item.track.id,
    }))

    // Upsert into Supabase
    const { error } = await supabase
      .from('spotify_recently_played')
      .upsert(records, { onConflict: 'track_id' })

    if (error) {
      console.error('Supabase Upsert Error:', error)
      throw error
    }

    // Cleanup: Only keep the most recent 20 tracks
    const { data: keepData } = await supabase
      .from('spotify_recently_played')
      .select('played_at')
      .order('played_at', { ascending: false })
      .limit(20)

    if (keepData && keepData.length === 20) {
      const thresholdDate = keepData[19].played_at
      await supabase.from('spotify_recently_played').delete().lt('played_at', thresholdDate)
    }

    return new Response(JSON.stringify({ count: records.length, success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
