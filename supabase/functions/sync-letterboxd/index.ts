// @ts-expect-error - npm imports are valid in Deno but not in standard TypeScript
import { createClient } from 'npm:@supabase/supabase-js'
// @ts-expect-error - npm imports are valid in Deno but not in standard TypeScript
import { XMLParser } from 'npm:fast-xml-parser'

const supabase = createClient(
  // @ts-expect-error - Deno is a global in the Edge Runtime
  Deno.env.get('SUPABASE_URL') ?? '',
  // @ts-expect-error - Deno is a global in the Edge Runtime
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

// @ts-expect-error - Deno is a global in the Edge Runtime
Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  const cronHeader = req.headers.get('x-cron-secret')
  // @ts-expect-error - Deno is a global in the Edge Runtime
  const secret = Deno.env.get('CRON_SECRET')

  if (authHeader !== `Bearer ${secret}` && cronHeader !== secret) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const rssResponse = await fetch('https://letterboxd.com/_psiderman_/rss/')
    const rssText = await rssResponse.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
    })
    const rssJson = parser.parse(rssText)

    // 1. Validate structure hasn't changed dramatically
    const itemsRaw = rssJson?.rss?.channel?.item
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      throw new Error(
        'Invalid RSS format or no items found. Aborting to prevent overwriting with gibberish.',
      )
    }

    // 2. Only process the most recent 6 movies
    const topItems = itemsRaw.slice(0, 8)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moviesToInsert = topItems.map((item: any) => {
      const id = item.guid?.['#text'] || item.guid
      const rawTitle = item.title

      // If fundamental fields are missing, something is wrong with the feed
      if (!id || !rawTitle) {
        throw new Error('RSS Format changed: missing id or title in item.')
      }

      const title = rawTitle.split(' - ')[0]

      // We explicitly allow rating and review to be missing
      const rating = item['letterboxd:memberRating']
        ? parseFloat(item['letterboxd:memberRating'])
        : null

      const coverMatch = item.description?.match(/<img src="([^"]+)"/)
      const cover = coverMatch ? coverMatch[1] : null

      let review = item.description
        ?.replace(/<p><img[^>]+><\/p>/g, '')
        .replace(/<p><em>This review may contain spoilers\.<\/em><\/p>/g, '')
        .replace(/<[^>]+>/g, '') // Strip all remaining HTML tags
        .trim()
      if (!review || review === '') review = null

      return {
        cover,
        id,
        link: item.link,
        rating,
        review,
        title,
        watched_date: new Date(item['letterboxd:watchedDate'] || item.pubDate).toISOString(),
      }
    })

    // 3. Upsert the latest 6 movies
    const { error: upsertError } = await supabase
      .from('movies')
      .upsert(moviesToInsert, { onConflict: 'id' })

    if (upsertError) throw upsertError

    // 4. Cleanup old movies to prevent table inflation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestIds = moviesToInsert.map((m: any) => m.id)
    const { data: existingMovies } = await supabase.from('movies').select('id')

    if (existingMovies) {
      const idsToDelete = existingMovies
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => m.id)
        .filter((id: string) => !latestIds.includes(id))

      for (const id of idsToDelete) {
        await supabase.from('movies').delete().eq('id', id)
      }
    }

    return new Response(JSON.stringify({ count: moviesToInsert.length, success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
