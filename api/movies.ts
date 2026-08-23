import { XMLParser } from 'fast-xml-parser'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || req.headers.referer || ''
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const rssResponse = await fetch('https://letterboxd.com/_psiderman_/rss/')
    const rssText = await rssResponse.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
    })
    const rssJson = parser.parse(rssText)

    const itemsRaw = rssJson?.rss?.channel?.item
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return res.status(500).json({ error: 'Invalid RSS format or no items found' })
    }

    const topItems = itemsRaw.slice(0, 10)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const movies = topItems.map((item: any) => {
      const id = item.guid?.['#text'] || item.guid
      const rawTitle = item.title

      const title = rawTitle.split(' - ')[0]
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

    // Cache at edge for 15 minutes (900 seconds) since movies change rarely
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate')
    return res.status(200).json(movies)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return res.status(500).json({ error: errorMessage })
  }
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return (
      hostname === 'psiderman.com' ||
      hostname.endsWith('.psiderman.com') ||
      hostname === 'localhost'
    )
  } catch {
    return false
  }
}
