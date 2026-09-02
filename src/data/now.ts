// /now types and frontmatter parser for posts stored in Supabase storage bucket `now`.

export interface NowEntry {
  date: string // yyyy-MM-dd
  images: NowGalleryImage[]
  markdown: string
  title: string
}

export interface NowGalleryImage extends NowImage {
  caption: string
}

export interface NowImage {
  name: string
  url: string
}

interface ParsedFrontmatter {
  body: string
  captions: string[]
  date: string
  title: string
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  const frontmatterText = block?.[1] ?? ''
  const body = block ? raw.slice(block[0].length).replace(/^\s+/, '') : raw

  const captions: string[] = []
  let date = ''
  let title = ''

  for (const rawLine of frontmatterText.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    const value = line
      .slice(colonIndex + 1)
      .trim()
      .replace(/^["']/, '')
      .replace(/["']$/, '')

    if (/^\d+$/.test(key)) {
      const index = parseInt(key, 10) - 1
      captions[index] = value
    } else if (key === 'date') {
      date = value
    } else if (key === 'title') {
      title = value
    }
  }

  return { body, captions, date, title }
}
