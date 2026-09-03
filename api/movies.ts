import { XMLParser } from 'fast-xml-parser'

import { respondWithError } from './_lib/http.js'
import { isAllowedRequest } from './_lib/origin.js'

interface LetterboxdItem {
  description?: string
  guid?: string | { '#text'?: string }
  'letterboxd:memberLike'?: string
  'letterboxd:memberRating'?: string
  'letterboxd:rewatch'?: string
  'letterboxd:watchedDate'?: string
  link?: string
  pubDate?: string
  title?: string
}

// Letterboxd RSS wraps descriptions in CDATA, so entities like &#039; (') are
// never decoded by the XML parser. This is our own content shown as plain text
// ({{ }} interpolation, never v-html), so just unescape the common forms.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (!isAllowedRequest(req)) {
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

      const title = decodeEntities(rawTitle.split(' - ')[0] ?? '')
      const rating = item['letterboxd:memberRating']
        ? parseFloat(item['letterboxd:memberRating'])
        : null
      const like =
        item['letterboxd:memberLike'] && item['letterboxd:memberLike'] === 'Yes' ? true : false

      const rewatch =
        item['letterboxd:memberLike'] && item['letterboxd:rewatch'] === 'Yes' ? true : false

      const coverMatch = item.description?.match(/<img src="([^"]+)"/)
      const cover = coverMatch ? coverMatch[1] : null

      let review: null | string =
        item.description
          ?.replace(/<p><img[^>]+><\/p>/g, '')
          .replace(/<p><em>This review may contain spoilers\.<\/em><\/p>/g, '')
          .replace(/<[^>]+>/g, '')
          .trim() ?? null
      if (review) review = decodeEntities(review)
      if (!review || review === '') review = null

      const watched = item['letterboxd:watchedDate'] || item.pubDate
      return {
        cover,
        id,
        like,
        link: item.link,
        rating,
        review,
        rewatch,
        title,
        watched_date: watched ? new Date(watched).toISOString() : null,
      }
    })

    // Cache at edge for 1 day since movies change rarely
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    return res.status(200).json(movies)
  } catch (error) {
    return respondWithError(res, error)
  }
}

function decodeEntities(input: string): string {
  return input.replace(
    /&(#x?[\da-f]+|[a-z]+);/gi,
    (match, entity: string) => {
      if (entity[0] === '#') {
        const isHex = entity[1]?.toLowerCase() === 'x'
        const digits = isHex ? entity.slice(2) : entity.slice(1)
        const code = parseInt(digits, isHex ? 16 : 10)
        return Number.isFinite(code) && code >= 0 ? String.fromCodePoint(code) : match
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? match
    },
  )
}
