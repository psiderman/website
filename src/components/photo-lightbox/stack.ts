import { computed } from 'vue'

import { resetPointer } from './drag'
import { getPhotoRotation } from './rotations'
import { currentIndex, dragX, dragY, isDragging, outgoingCards } from './state'
import { BUFFER_AHEAD, BUFFER_BEHIND, type StackCard } from './types'

import type { GalleryImage } from '@/types'

export function useStack(getImages: () => GalleryImage[]) {
  const isEnded = computed(() => {
    return getImages().length > 0 && currentIndex.value >= getImages().length
  })

  const visibleCards = computed<StackCard[]>(() => {
    const total = getImages().length
    if (total === 0) return []

    const result: StackCard[] = []
    const seenIndices = new Set<number>()

    let dragProgress = 0
    if (isDragging.value) {
      const dist = Math.hypot(dragX.value, dragY.value)
      dragProgress = Math.min(1, dist / 120)
    }

    // Active stack cards ahead and current (from currentIndex to end of deck)
    const remaining = Math.max(0, total - currentIndex.value)
    const aheadCount = Math.min(remaining, BUFFER_AHEAD + 1)

    for (let depth = 0; depth < aheadCount; depth++) {
      const imgIndex = currentIndex.value + depth
      if (imgIndex >= total) break
      if (seenIndices.has(imgIndex)) continue
      seenIndices.add(imgIndex)

      const img = getImages()[imgIndex]
      const baseRot = getPhotoRotation(imgIndex)
      const dragTilt =
        depth === 0 && isDragging.value ? Math.max(-6, Math.min(6, dragX.value * 0.04)) : 0
      const visualDepth = Math.max(0, depth - dragProgress)
      const scale = depth === 0 ? 1 : Math.max(0.84, 1 - visualDepth * 0.04)

      result.push({
        depth,
        id: `${img.url}-${imgIndex}`,
        img,
        imgIndex,
        isBehind: false,
        rotate: baseRot + dragTilt,
        scale,
        x: depth === 0 ? dragX.value : 0,
        y: depth === 0 ? dragY.value : 0,
        zIndex: aheadCount - depth,
      })
    }

    // Pre-warmed buffer cards behind (seen cards that can be brought back)
    for (let b = 1; b <= BUFFER_BEHIND; b++) {
      const imgIndex = currentIndex.value - b
      if (imgIndex < 0) break
      if (seenIndices.has(imgIndex)) continue
      seenIndices.add(imgIndex)

      const img = getImages()[imgIndex]
      const baseRot = getPhotoRotation(imgIndex)

      result.push({
        depth: -b,
        id: `${img.url}-${imgIndex}`,
        img,
        imgIndex,
        isBehind: true,
        rotate: baseRot,
        scale: 1,
        x: 0,
        y: 0,
        zIndex: -1,
      })
    }

    return result
  })

  const nextCard = () => {
    const total = getImages().length
    if (isEnded.value || currentIndex.value >= total) return

    outgoingCards.value = []
    dragX.value = 0
    dragY.value = 0
    isDragging.value = false
    resetPointer()
    currentIndex.value++
  }

  const prevCard = () => {
    if (isEnded.value || currentIndex.value <= 0) return

    outgoingCards.value = []
    dragX.value = 0
    dragY.value = 0
    isDragging.value = false
    resetPointer()
    currentIndex.value--
  }

  return { isEnded, nextCard, prevCard, visibleCards }
}
