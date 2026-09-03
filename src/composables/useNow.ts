// /now content backed by public Supabase storage bucket `now`.
// Layout: now/<slug>/<slug>.md + now/<slug>/*.webp.

import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

import { type NowEntry, type NowGalleryImage, parseFrontmatter } from '@/data/now'
import { queryKeys } from '@/queryKeys'
import { getStorageUrl, supabase } from '@/supabase'
import { throwIfError } from '@/utils'

const IMAGE_EXT = /\.(?:webp|jpg|jpeg|png)$/i

const isFile = (name: string) => /\.[a-z0-9]+$/i.test(name)

interface RemoteNowEntry {
  date: string
  images: NowGalleryImage[]
  markdown: string
  title: string
}

export function useNow() {
  const {
    data: remoteEntries,
    error,
    isLoading,
  } = useQuery({
    gcTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const entries = await listNowBucket()
      return entries
    },
    queryKey: queryKeys.now,
    staleTime: 1000 * 60 * 5, // 5 mins
  })

  const entries = computed<NowEntry[]>(() => {
    const remote = remoteEntries.value ?? []
    return remote
      .map((e) => ({
        date: e.date,
        images: e.images,
        markdown: e.markdown,
        title: e.title,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  })

  const images = computed<NowGalleryImage[]>(() => entries.value[0]?.images ?? [])

  return { entries, error, images, isLoading }
}

async function fetchNowFile(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('now').download(path)
  if (!error && data) {
    return data.text()
  }

  const res = await fetch(getStorageUrl('now', path))
  if (!res.ok) throw new Error(`Failed to fetch now/${path}: ${error?.message || res.statusText}`)
  return res.text()
}

async function listNowBucket(): Promise<RemoteNowEntry[]> {
  const { data: folders, error } = await supabase.storage.from('now').list('', {
    limit: 200,
    sortBy: { column: 'name', order: 'asc' },
  })
  throwIfError(error)
  if (!folders) return []

  const validFolders = folders.filter((folder) => !isFile(folder.name))

  const entries = await Promise.all(
    validFolders.map(async (folder) => {
      const slug = folder.name
      const { data: files, error: filesError } = await supabase.storage.from('now').list(slug, {
        limit: 200,
        sortBy: { column: 'name', order: 'asc' },
      })
      throwIfError(filesError)
      if (!files || files.length === 0) return null

      const mdName = files.find((f) => f.name.endsWith('.md'))?.name
      if (!mdName) return null
      const parsed = parseFrontmatter(await fetchNowFile(`${slug}/${mdName}`))

      const images: NowGalleryImage[] = files
        .filter((f) => IMAGE_EXT.test(f.name))
        .map((f) => {
          const url = getStorageUrl('now', slug, f.name)
          return {
            name: f.name,
            placeholder: getStorageUrl('now', `thumb/${slug}/${f.name}`),
            url,
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map((img, idx) => ({ caption: parsed?.captions[idx] ?? '', ...img }))

      return {
        date: parsed?.date || slug.replace(/_/g, '-'),
        images,
        markdown: parsed?.body || '',
        title: parsed?.title ?? '',
      }
    }),
  )

  return entries.filter((e): e is RemoteNowEntry => e !== null)
}
