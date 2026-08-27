<template>
  <div
    class="bg-surface-secondary relative h-full w-full rounded-lg"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Images Carousel -->
    <div
      v-if="images && images.length > 0"
      ref="scrollContainer"
      class="noscrollbar relative flex h-full w-full snap-y snap-mandatory flex-col overflow-x-hidden overflow-y-auto scroll-smooth"
      tabindex="-1"
      @touchstart="handleInteraction"
      @wheel="handleInteraction"
      @scroll="onScroll"
    >
      <div
        v-for="(img, idx) in images"
        :key="`${img}-${idx}`"
        class="h-full w-full shrink-0 snap-center"
      >
        <img
          v-lazy="img"
          class="h-full w-full object-cover"
          :alt="title ? `${title} ${idx + 1}` : `Image ${idx + 1}`"
          width="300"
          height="500"
          draggable="false"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Custom Side Indicator -->
    <CarouselIndicator
      v-if="originalLength > 1"
      class="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
      :active-index="activeIndex"
      :count="originalLength"
      orientation="vertical"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import CarouselIndicator from '../CarouselIndicator.vue'

const props = defineProps<{
  images: string[]
  title?: string
}>()

const activeIndex = ref(0)
const isHovered = ref(false)
const isInteracting = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

let autoPlayInterval: null | number = null
let interactionTimeout: null | number = null

const originalLength = computed(() => props.images?.length || 0)

const handleInteraction = () => {
  isInteracting.value = true

  if (interactionTimeout) clearTimeout(interactionTimeout)

  interactionTimeout = window.setTimeout(() => {
    isInteracting.value = false
  }, 3000)
}

const handleScroll = () => {
  if (scrollContainer.value) {
    const index = Math.round(scrollContainer.value.scrollTop / scrollContainer.value.clientHeight)
    activeIndex.value = index
  }
}

const onScroll = () => {
  handleScroll()
  handleInteraction()
}

const scrollToNext = () => {
  if (!scrollContainer.value || originalLength.value <= 1) return
  const behavior = prefersReducedMotion ? 'auto' : 'smooth'

  const { clientHeight, scrollHeight, scrollTop } = scrollContainer.value

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    scrollContainer.value.scrollTo({ behavior, top: 0 })
  } else {
    scrollContainer.value.scrollBy({ behavior, top: clientHeight })
  }
}

const scrollToPrev = () => {
  if (!scrollContainer.value || originalLength.value <= 1) return
  const behavior = prefersReducedMotion ? 'auto' : 'smooth'

  const { clientHeight, scrollTop } = scrollContainer.value

  if (scrollTop <= 10) {
    scrollContainer.value.scrollTo({ behavior, top: scrollContainer.value.scrollHeight })
  } else {
    scrollContainer.value.scrollBy({ behavior, top: -clientHeight })
  }
}

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  const activeEl = document.activeElement
  if (!activeEl) return

  if (scrollContainer.value && activeEl.contains(scrollContainer.value)) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      scrollToNext()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      scrollToPrev()
    }
  }
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const startAutoPlay = () => {
  if (prefersReducedMotion) return
  if (autoPlayInterval) clearInterval(autoPlayInterval)
  autoPlayInterval = window.setInterval(() => {
    if (!isHovered.value && !isInteracting.value && originalLength.value > 1) {
      scrollToNext()
    }
  }, 4000)
}

const stopAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
  setTimeout(() => {
    startAutoPlay()
  }, 2000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
  stopAutoPlay()
  if (interactionTimeout) clearTimeout(interactionTimeout)
})
</script>
