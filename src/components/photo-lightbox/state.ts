import { ref } from 'vue'

import type { OutgoingCard } from './types'

export const currentIndex = ref(0)
export const dragX = ref(0)
export const dragY = ref(0)
export const isDragging = ref(false)
export const outgoingCards = ref<OutgoingCard[]>([])

export function resetStackState() {
  dragX.value = 0
  dragY.value = 0
  isDragging.value = false
  outgoingCards.value = []
}
