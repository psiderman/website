import { marked } from 'marked'

import type { FilterGroupId } from '@/types'

export interface DescriptionContent {
  content: string[]
  id: FilterGroupId
  title: string
}

// Import all markdown files as raw strings
const markdownFiles = import.meta.glob('@/data/descriptions/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

export const descriptionContent: DescriptionContent[] = Object.entries(markdownFiles).map(
  ([path, rawContent]) => {
    // Extract ID from filename (e.g., /src/data/descriptions/personal_finance.md -> personal_finance)
    const id = path.split('/').pop()?.replace('.md', '') as FilterGroupId

    // Simple markdown parsing
    const lines = (rawContent as string)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const titleRaw = lines[0].replace(/^#\s*/, '')
    const title = marked.parseInline(titleRaw) as string

    const content = lines.slice(1).map((p) => marked.parseInline(p) as string)

    return {
      content,
      id,
      title,
    }
  },
)
