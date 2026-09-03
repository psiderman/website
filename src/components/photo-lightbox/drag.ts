import { reactive } from 'vue'

import { getPhotoRotation } from './rotations'
import { currentIndex, dragX, dragY, isDragging, outgoingCards } from './state'

import type { OutgoingCard } from './types'
import type { GalleryImage } from '@/types'

let activePointerId: null | number = null
let startX = 0
let startY = 0
let lastMoveTime = 0
let lastMoveX = 0
let lastMoveY = 0
let velocityX = 0
let velocityY = 0

export function resetPointer() {
  activePointerId = null
}

export function useDrag(getImages: () => GalleryImage[]) {
  const onPointerDown = (depth: number, e: PointerEvent) => {
    if (depth !== 0) {
      currentIndex.value = currentIndex.value + depth
      dragX.value = 0
      dragY.value = 0
      outgoingCards.value = []
    }

    activePointerId = e.pointerId
    ;(e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId)
    startX = e.clientX
    startY = e.clientY
    lastMoveX = e.clientX
    lastMoveY = e.clientY
    lastMoveTime = performance.now()
    velocityX = 0
    velocityY = 0
  }

  const onPointerMove = (e: PointerEvent) => {
    if (activePointerId !== e.pointerId) return

    const now = performance.now()
    const dt = Math.max(1, now - lastMoveTime)
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    const currentVx = (e.clientX - lastMoveX) / dt
    const currentVy = (e.clientY - lastMoveY) / dt
    velocityX = velocityX * 0.4 + currentVx * 0.6
    velocityY = velocityY * 0.4 + currentVy * 0.6

    lastMoveX = e.clientX
    lastMoveY = e.clientY
    lastMoveTime = now

    if (!isDragging.value && Math.hypot(dx, dy) > 3) {
      isDragging.value = true
    }

    if (isDragging.value) {
      dragX.value = dx
      dragY.value = dy
    }
  }

  const onPointerUp = () => {
    if (activePointerId === null) return
    activePointerId = null

    if (!isDragging.value) return
    isDragging.value = false

    const total = getImages().length
    if (currentIndex.value >= total) {
      dragX.value = 0
      dragY.value = 0
      return
    }

    const distance = Math.hypot(dragX.value, dragY.value)
    const speed = Math.hypot(velocityX, velocityY)

    const isFling = (distance > 100 || (speed > 0.45 && distance > 25)) && total > 1

    if (isFling) {
      const currentImg = getImages()[currentIndex.value]
      const baseRot = getPhotoRotation(currentIndex.value)

      let dirX = speed > 0.45 ? velocityX / (speed || 1) : dragX.value / (distance || 1)
      let dirY = speed > 0.45 ? velocityY / (speed || 1) : dragY.value / (distance || 1)

      if (Math.abs(dirX) < 0.1 && Math.abs(dirY) < 0.1) {
        dirX = 1
        dirY = 0
      }

      const throwDist = Math.max(260, Math.min(420, distance * 1.5 + speed * 150))
      const spin = Math.max(-8, Math.min(8, dirX * 6))

      const outgoing = reactive<OutgoingCard>({
        id: `out-${Date.now()}-${Math.random()}`,
        img: currentImg,
        isExiting: false,
        rotate: baseRot + (isDragging.value ? Math.max(-6, Math.min(6, dragX.value * 0.04)) : 0),
        x: dragX.value,
        y: dragY.value,
      })
      outgoingCards.value.push(outgoing)

      currentIndex.value++
      dragX.value = 0
      dragY.value = 0

      requestAnimationFrame(() => {
        outgoing.isExiting = true
        outgoing.x = outgoing.x + dirX * throwDist
        outgoing.y = outgoing.y + dirY * (throwDist * 0.4)
        outgoing.rotate = baseRot + spin
      })

      setTimeout(() => {
        const idx = outgoingCards.value.findIndex((c) => c.id === outgoing.id)
        if (idx !== -1) outgoingCards.value.splice(idx, 1)
      }, 420)
    } else {
      dragX.value = 0
      dragY.value = 0
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}
