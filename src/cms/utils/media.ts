import { getStorageUrl } from '@/supabase'

export function getTripThumbnailUrl(storagePath: string) {
  return getStorageUrl('travel', `thumb/${storagePath}`)
}

export function getWorkPersonUrl(orgId: string, filename?: string) {
  if (!filename) return ''
  const name = filename.replace(/\.[^/.]+$/, '')
  return getStorageUrl('webp', orgId, `${name}.webp`)
}
