// Static /now content — ships with the bundle (no Supabase/DB). Edit
// src/data/now.md and drop images into src/assets/now/ to update.

const nowMarkdownRaw = (await import('@/data/now.md?raw')).default

export interface NowImage {
  name: string
  url: string
}

export const nowImages: NowImage[] = Object.entries(
  import.meta.glob<string>('@/assets/now/*.{webp,jpg,jpeg,png}', {
    eager: true,
    import: 'default',
  }),
)
  .map(([path, url]) => ({ name: path.split('/').pop() ?? path, url }))
  .sort((a, b) => a.name.localeCompare(b.name))

export const nowMarkdown = nowMarkdownRaw.replace(/^---[\s\S]*?---/, '')

// Frontmatter: updated: YYYY-MM
export const nowUpdated = /^updated:\s*(\d{4}-\d{2})/m.exec(nowMarkdownRaw)?.[1] ?? null
