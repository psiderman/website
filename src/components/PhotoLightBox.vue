<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50 select-none" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-overlay fixed inset-0 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="relative flex max-w-full items-center justify-center">
              <!-- End screen card sitting at the bottom of the stack -->
              <div
                v-if="currentTripSlug && nextTrip"
                class="bg-surface-primary border-border-primary absolute inset-1/2 mx-auto flex size-100 -translate-1/2 flex-col items-center justify-between gap-4 rounded-xl border p-6 text-center shadow-lg select-none"
                :class="[isEnded ? 'pointer-events-auto' : 'pointer-events-none']"
                :style="{
                  zIndex: 0,
                  transform: 'translate(0, 0) rotate(1.2deg)',
                  transformOrigin: 'center center',
                  transition: 'transform 0.4s ease-out, opacity 0.3s ease-out',
                }"
              >
                <p class="text-h2 text-text-primary">Up next: {{ nextTripTitle }}</p>

                <div
                  class="bg-surface-tertiary relative min-h-0 w-full flex-1 overflow-hidden rounded-lg p-2"
                >
                  <div
                    v-if="nextTripThumbnails.length === 1"
                    class="relative size-full overflow-hidden p-1"
                  >
                    <img
                      :src="nextTripThumbnails[0]"
                      alt=""
                      draggable="false"
                      loading="eager"
                      decoding="async"
                      class="pointer-events-none size-full rounded-xs object-cover select-none"
                    />
                  </div>
                  <div
                    v-else-if="nextTripThumbnails.length > 0"
                    class="grid size-full grid-cols-3 grid-rows-2 gap-3 overflow-hidden p-1"
                  >
                    <div
                      v-for="(url, idx) in nextTripThumbnails"
                      :key="idx"
                      class="bg-surface-tertiary outline-dark-5p relative overflow-hidden rounded-xs shadow-sm"
                      :style="{
                        transform: `rotate(${THUMB_ROTATIONS[idx % THUMB_ROTATIONS.length]}deg)`,
                      }"
                    >
                      <img
                        :src="url"
                        alt=""
                        draggable="false"
                        loading="eager"
                        decoding="async"
                        class="border-light pointer-events-none size-full border-6 border-b-12 object-cover select-none"
                      />
                    </div>
                  </div>
                  <div
                    v-else
                    class="text-text-tertiary flex size-full items-center justify-center text-xs"
                  >
                    No preview
                  </div>
                </div>

                <div class="flex w-full flex-col justify-center gap-2">
                  <button type="button" class="btn primary grow" @click="goToNextTrip">
                    <span>Next</span>
                    <ArrowRight :size="16" />
                  </button>
                  <button type="button" class="btn stroke grow" @click="startOver">
                    <Undo2 :size="16" />
                    <span>Replay</span>
                  </button>
                </div>
              </div>

              <!-- Active stack cards -->
              <div
                v-for="card in visibleCards"
                :key="card.id"
                class="bg-light border-border-primary absolute inset-1/2 mx-auto flex h-fit w-fit -translate-1/2 touch-none flex-col rounded-lg border p-6 pb-4 shadow-lg select-none"
                :class="[
                  card.isBehind ? 'pointer-events-none' : 'pointer-events-auto',
                  card.depth === 0 && isDragging ? 'cursor-grabbing' : 'cursor-grab',
                ]"
                :style="{
                  zIndex: card.zIndex,
                  transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotate}deg) scale(${card.scale})`,
                  transformOrigin: 'center center',
                  transition:
                    card.isBehind || (card.depth === 0 && isDragging)
                      ? 'none'
                      : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.15), opacity 0.3s ease-out',
                  opacity: card.isBehind ? 0 : 1,
                }"
                @pointerdown="onPointerDown(card.depth, $event)"
                @pointermove="onPointerMove($event)"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
              >
                <div class="relative">
                  <img
                    v-lazy="{ src: card.img.url, placeholder: card.img.thumbnailUrl }"
                    :alt="card.img.caption ?? ''"
                    draggable="false"
                    :style="
                      card.img.width && card.img.height
                        ? { aspectRatio: `${card.img.width}/${card.img.height}` }
                        : undefined
                    "
                    class="desktop:max-w-[40svw] pointer-events-none block h-auto max-h-[calc(100svh-10rem)] w-auto max-w-[80svw] rounded-xs object-contain select-none"
                  />
                  <!-- Green star badge for 'the list' -->
                  <TheListIndicator
                    v-if="isHighClearance(card.img.clearance)"
                    size="lg"
                    tooltip
                    class="absolute top-2 right-2"
                  />
                </div>
                <div
                  class="flex min-h-12 w-0 min-w-full items-center justify-center pt-3 text-center"
                >
                  <p
                    v-if="card.img.caption"
                    class="text-dark font-handwriting text-p pointer-events-none leading-6 select-none"
                  >
                    {{ card.img.caption }}
                  </p>
                </div>
              </div>

              <!-- Exiting cards flying away smoothly -->
              <div
                v-for="card in outgoingCards"
                :key="card.id"
                class="bg-light border-border-primary pointer-events-none absolute inset-1/2 mx-auto flex h-fit w-fit -translate-1/2 touch-none flex-col rounded-lg border p-6 pb-4 shadow-lg select-none"
                :style="{
                  zIndex: 999,
                  transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotate}deg) scale(1)`,
                  transformOrigin: 'center center',
                  transition:
                    'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: card.isExiting ? 0 : 1,
                }"
              >
                <div class="relative">
                  <img
                    v-lazy="{ src: card.img.url, placeholder: card.img.thumbnailUrl }"
                    :alt="card.img.caption ?? ''"
                    draggable="false"
                    :style="
                      card.img.width && card.img.height
                        ? { aspectRatio: `${card.img.width}/${card.img.height}` }
                        : undefined
                    "
                    class="desktop:max-w-[40svw] pointer-events-none block h-auto max-h-[calc(100svh-10rem)] w-auto max-w-[85svw] rounded-xs object-contain select-none"
                  />
                  <TheListIndicator
                    v-if="isHighClearance(card.img.clearance)"
                    size="lg"
                    class="absolute top-2 right-2"
                  />
                </div>
                <div
                  class="flex min-h-12 w-0 min-w-full items-center justify-center pt-3 text-center"
                >
                  <p
                    v-if="card.img.caption"
                    class="font-handwriting text-p pointer-events-none line-clamp-3 leading-6 select-none"
                  >
                    {{ card.img.caption }}
                  </p>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ArrowRight, Undo2 } from '@lucide/vue'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'

import TheListIndicator from '@/components/TheListIndicator.vue'
import { photoLightBoxData } from '@/composables/useGlobal'
import { isHighClearance, useTravelsWithImages } from '@/composables/useTravel'
import type { GalleryImage } from '@/types'
import { trackEvent } from '@/utils/analytics'

const props = withDefaults(
  defineProps<{
    currentTripSlug?: string
    images?: GalleryImage[]
    initialIndex?: number
    isOpen: boolean
    tripTitle?: string
  }>(),
  {
    currentTripSlug: '',
    images: () => [],
    initialIndex: 0,
    tripTitle: '',
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const photoRotations = ref<number[]>([])

function getPhotoRotation(imgIndex: number): number {
  if (photoRotations.value[imgIndex] !== undefined) {
    return photoRotations.value[imgIndex]
  }
  const sign = Math.random() < 0.5 ? -1 : 1
  const magnitude = 1 + Math.random() * 2.5
  const rot = Number((sign * magnitude).toFixed(1))
  photoRotations.value[imgIndex] = rot
  return rot
}

const currentIndex = ref(0)
const dragX = ref(0)
const dragY = ref(0)
const isDragging = ref(false)

interface OutgoingCard {
  id: string
  img: GalleryImage
  isExiting: boolean
  rotate: number
  x: number
  y: number
}

const outgoingCards = ref<OutgoingCard[]>([])

const BUFFER_BEHIND = 2
const BUFFER_AHEAD = 3

interface StackCard {
  depth: number
  id: string
  img: GalleryImage
  imgIndex: number
  isBehind: boolean
  rotate: number
  scale: number
  x: number
  y: number
  zIndex: number
}

const isEnded = computed(() => {
  return props.images.length > 0 && currentIndex.value >= props.images.length
})

const { travelsWithImages } = useTravelsWithImages()

const validTrips = computed(() => {
  return (travelsWithImages.value ?? []).filter((t) => t.images && t.images.length > 0)
})

const nextTrip = computed(() => {
  if (!props.currentTripSlug) return null
  const list = validTrips.value
  if (list.length === 0) return null
  const currentIdx = list.findIndex((t) => t.slug === props.currentTripSlug)
  const nextIdx = currentIdx !== -1 && currentIdx < list.length - 1 ? currentIdx + 1 : 0
  return list[nextIdx] ?? null
})

const nextTripTitle = computed(() => {
  return nextTrip.value?.title ?? null
})

const THUMB_ROTATIONS = [-2.5, 3, -1.8, 2.2, -3, 2]

const nextTripThumbnails = computed(() => {
  const trip = nextTrip.value
  if (!trip || !trip.images || trip.images.length === 0) return []

  return trip.images
    .map((img) => img.thumbnailUrl || img.url)
    .filter(Boolean)
    .slice(0, 6) as string[]
})

function goToNextTrip() {
  const target = nextTrip.value
  if (!target) return

  trackEvent(
    'trip_lightbox_action',
    {
      action: 'next_trip',
      from_trip: props.currentTripSlug,
      to_trip: target.slug,
    },
    { force: true },
  )

  const targetImages = target.images.map((img) => ({
    caption: img.caption,
    clearance: img.clearance,
    height: img.height,
    thumbnailUrl: img.thumbnailUrl,
    url: img.url,
    width: img.width,
  }))

  photoLightBoxData.value = {
    currentTripSlug: target.slug,
    images: targetImages,
    initialIndex: 0,
    tripTitle: target.title,
  }

  startOver()
}

function startOver() {
  trackEvent(
    'trip_lightbox_action',
    {
      action: 'replay',
      trip_slug: props.currentTripSlug,
    },
    { force: true },
  )
  outgoingCards.value = []
  dragX.value = 0
  dragY.value = 0
  isDragging.value = false
  currentIndex.value = 0
  preloadAdjacentImages()
}

const visibleCards = computed<StackCard[]>(() => {
  const total = props.images.length
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

    const img = props.images[imgIndex]
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

    const img = props.images[imgIndex]
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

function nextCard() {
  const total = props.images.length
  if (isEnded.value || currentIndex.value >= total) return

  outgoingCards.value = []
  dragX.value = 0
  dragY.value = 0
  isDragging.value = false
  activePointerId = null
  currentIndex.value++
}

function prevCard() {
  if (isEnded.value || currentIndex.value <= 0) return

  outgoingCards.value = []
  dragX.value = 0
  dragY.value = 0
  isDragging.value = false
  activePointerId = null
  currentIndex.value--
}

let activePointerId: null | number = null
let startX = 0
let startY = 0
let lastMoveTime = 0
let lastMoveX = 0
let lastMoveY = 0
let velocityX = 0
let velocityY = 0

function onPointerDown(depth: number, e: PointerEvent) {
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

function onPointerMove(e: PointerEvent) {
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

function onPointerUp() {
  if (activePointerId === null) return
  activePointerId = null

  if (!isDragging.value) return
  isDragging.value = false

  const total = props.images.length
  if (currentIndex.value >= total) {
    dragX.value = 0
    dragY.value = 0
    return
  }

  const distance = Math.hypot(dragX.value, dragY.value)
  const speed = Math.hypot(velocityX, velocityY)

  const isFling = (distance > 100 || (speed > 0.45 && distance > 25)) && total > 1

  if (isFling) {
    const currentImg = props.images[currentIndex.value]
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

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen || isEnded.value) return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextCard()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevCard()
  }
}

const preloadedUrls = new Set<string>()

function preloadAdjacentImages() {
  const total = props.images.length
  if (total === 0) return

  const offsets = [-2, -1, 1, 2, 3, 4]
  for (const offset of offsets) {
    const idx = currentIndex.value + offset
    if (idx >= 0 && idx < total) {
      const img = props.images[idx]
      if (img) {
        preloadUrl(img.thumbnailUrl)
        preloadUrl(img.url)
      }
    }
  }
}

function preloadUrl(url?: null | string) {
  if (!url || preloadedUrls.has(url)) return
  preloadedUrls.add(url)
  const img = new Image()
  img.src = url
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }
  },
  { immediate: true },
)

watch(
  [() => props.isOpen, () => props.images],
  ([isOpen]) => {
    if (isOpen) {
      photoRotations.value = props.images.map(() => {
        const sign = Math.random() < 0.5 ? -1 : 1
        const magnitude = 1 + Math.random() * 2.5
        return Number((sign * magnitude).toFixed(1))
      })
      currentIndex.value = props.initialIndex || 0
      dragX.value = 0
      dragY.value = 0
      isDragging.value = false
      outgoingCards.value = []
      preloadAdjacentImages()
    }
  },
  { immediate: true },
)

watch(currentIndex, () => {
  if (props.isOpen) {
    preloadAdjacentImages()
  }
})

let autoCloseTimer: null | number = null

watch(isEnded, (ended) => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }

  if (ended) {
    trackEvent('trip_lightbox_end', {
      count: props.images.length,
      trip_slug: props.currentTripSlug,
      trip_title: props.tripTitle,
    })
  }

  if (ended && props.isOpen && (!props.currentTripSlug || !nextTrip.value)) {
    if (outgoingCards.value.length > 0) {
      autoCloseTimer = window.setTimeout(() => {
        if (isEnded.value && props.isOpen && (!props.currentTripSlug || !nextTrip.value)) {
          closeModal()
        }
      }, 350)
    } else {
      closeModal()
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
})

const closeModal = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  if (isEnded.value) {
    trackEvent(
      'trip_lightbox_action',
      {
        action: 'close',
        trip_slug: props.currentTripSlug,
      },
      { force: true },
    )
  }
  emit('update:isOpen', false)
}
</script>

<style scoped>
@reference "@/style.css";
</style>
