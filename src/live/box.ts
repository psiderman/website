import { type BoxRect, boxRects, isMobile, scrollY, windowWidth } from './state'

export const updateBoxRects = () => {
  const rects = new Map<string, BoxRect>()
  document.querySelectorAll('[data-sync]').forEach((el) => {
    const boxId = el.getAttribute('data-sync')
    if (boxId) {
      const rect = el.getBoundingClientRect()
      rects.set(boxId, {
        height: rect.height,
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
      })
    }
  })
  boxRects.value = rects
}

export const handleResize = () => {
  isMobile.value = window.matchMedia('(pointer: coarse)').matches
  windowWidth.value = window.innerWidth
  updateBoxRects()
}

export const handleScroll = () => {
  scrollY.value = window.scrollY
}

/** Resolve data-sync box coordinates from a pointer position. */
export function resolveInputCoords(
  target: Element | null,
  pageX: number,
  pageY: number,
  clientX: number,
  clientY: number,
  winW: number,
): { box: string; x: number; y: number } {
  const syncEl = target?.closest('[data-sync]')
  if (syncEl) {
    const boxId = syncEl.getAttribute('data-sync')
    if (boxId) {
      const rect = syncEl.getBoundingClientRect()
      return {
        box: boxId,
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
      }
    }
  }
  return { box: 'viewport', x: pageX / winW, y: pageY }
}
