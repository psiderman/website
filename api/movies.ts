import { XMLParser } from 'fast-xml-parser'

interface LetterboxdItem {
  description?: string
  guid?: string | { '#text'?: string }
  'letterboxd:memberRating'?: string
  'letterboxd:watchedDate'?: string
  link?: string
  pubDate?: string
  title?: string
}

const ALLOWED_HOSTNAMES = new Set(['127.0.0.1', 'localhost', 'psiderman.com', 'www.psiderman.com'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // Soft browser-only gate: missing Origin (same-origin/curl) is allowed,
  // a present Origin must be trusted. Referer is never trusted.
  const origin = req.headers.origin ?? ''
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const rssResponse = await fetch('https://letterboxd.com/_psiderman_/rss/')
    if (!rssResponse.ok) {
      return res.status(502).json({ error: `Letterboxd RSS failed: ${rssResponse.status}` })
    }
    const rssText = await rssResponse.text()

    const parser = new XMLParser({ ignoreAttributes: false })
    const rssJson = parser.parse(rssText)

    const itemsRaw = rssJson?.rss?.channel?.item as LetterboxdItem[] | undefined
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return res.status(500).json({ error: 'Invalid RSS format or no items found' })
    }

    const topItems = itemsRaw.slice(0, 10)

    const movies = topItems.map((item) => {
      const guid = item.guid
      const id = typeof guid === 'string' ? guid : guid?.['#text']
      const rawTitle = item.title ?? ''

      const title = rawTitle.split(' - ')[0]
      const rating = item['letterboxd:memberRating']
        ? parseFloat(item['letterboxd:memberRating'])
        : null

      const coverMatch = item.description?.match(/<img src="([^"]+)"/)
      const cover = coverMatch ? coverMatch[1] : null

      let review: null | string =
        item.description
          ?.replace(/<p><img[^>]+><\/p>/g, '')
          .replace(/<p><em>This review may contain spoilers\.<\/em><\/p>/g, '')
          .replace(/<[^>]+>/g, '')
          .trim() ?? null
      if (!review || review === '') review = null

      const watched = item['letterboxd:watchedDate'] || item.pubDate
      return {
        cover,
        id,
        link: item.link,
        rating,
        review,
        title,
        watched_date: watched ? new Date(watched).toISOString() : null,
      }
    })

    // Cache at edge for 1 day since movies change rarely
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    return res.status(200).json(movies)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return res.status(500).json({ error: errorMessage })
  }
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}