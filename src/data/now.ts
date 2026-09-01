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

    const numericKey = /^(\d+):\s*(.*)$/.exec(line)
    if (numericKey) {
      const index = parseInt(numericKey[1], 10) - 1
      captions[index] = numericKey[2].trim().replace(/^["']|["']$/g, '')
      continue
    }

    const dateMatch = /^date:\s*(.+)$/.exec(line)
    if (dateMatch) {
      date = dateMatch[1].trim().replace(/^["']|["']$/g, '')
      continue
    }

    const titleMatch = /^title:\s*(.+)$/.exec(line)
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '')
    }
  }

  return { body, captions, date, title }
}
