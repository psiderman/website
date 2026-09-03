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
import { onUnmounted, watch } from 'vue'

import TheListIndicator from '@/components/TheListIndicator.vue'
import { isHighClearance } from '@/composables/useTravel'
import { trackEvent } from '@/utils/analytics'

import { useDrag } from './drag'
import { useNextTrip } from './next-trip'
import { usePreload } from './preload'
import { resetRotations } from './rotations'
import { useStack } from './stack'
import { currentIndex, isDragging, outgoingCards } from './state'
import { THUMB_ROTATIONS } from './types'

import type { GalleryImage } from '@/types'

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

const getImages = () => props.images
const getCurrentTripSlug = () => props.currentTripSlug
const getTripTitle = () => props.tripTitle

const { isEnded, nextCard, prevCard, visibleCards } = useStack(getImages)
const { onPointerDown, onPointerMove, onPointerUp } = useDrag(getImages)
const { preloadAdjacentImages } = usePreload(getImages)
const { goToNextTrip, nextTrip, nextTripThumbnails, nextTripTitle, startOver } = useNextTrip({
  getCurrentTripSlug,
  getTripTitle,
  preloadAdjacentImages,
})

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
      resetRotations(props.images.length)
      currentIndex.value = props.initialIndex || 0
      outgoingCards.value = []
      isDragging.value = false
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
