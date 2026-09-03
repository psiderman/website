import { currentIndex } from './state'

import type { GalleryImage } from '@/types'

const preloadedUrls = new Set<string>()

export function usePreload(getImages: () => GalleryImage[]) {
  const preloadUrl = (url?: null | string) => {
    if (!url || preloadedUrls.has(url)) return
    preloadedUrls.add(url)
    const img = new Image()
    img.src = url
  }

  const preloadAdjacentImages = () => {
    const total = getImages().length
    if (total === 0) return

    const images = getImages()
    const offsets = [-2, -1, 1, 2, 3, 4]
    for (const offset of offsets) {
      const index = currentIndex.value + offset
      if (index >= 0 && index < total) {
        const img = images[index]
        if (img) {
          preloadUrl(img.thumbnailUrl)
          preloadUrl(img.url)
        }
      }
    }
  }

  return { preloadAdjacentImages, preloadUrl }
}
