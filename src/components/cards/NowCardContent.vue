<template>
  <div
    class="bg-surface-secondary relative h-full w-full rounded-lg"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Loading State -->
    <div
      v-if="isLoadingSlug || isLoadingImages"
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <GenericLoader />
    </div>

    <!-- Images Carousel -->
    <div
      v-else-if="images && images.length > 0"
      ref="scrollContainer"
      class="noscrollbar relative flex h-full w-full snap-y snap-mandatory flex-col overflow-x-hidden overflow-y-auto scroll-smooth"
      tabindex="-1"
      @touchstart="handleInteraction"
      @wheel="handleInteraction"
      @scroll="onScroll"
    >
      <div
        v-for="(img, idx) in images"
        :key="`${img.name}-${idx}`"
        class="h-full w-full shrink-0 snap-center"
      >
        <img
          class="h-full w-full object-cover"
          :src="img.url"
          :alt="img.name"
          width="300"
          height="500"
          draggable="false"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2">
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>

    <!-- Custom Side Indicator -->
    <CarouselIndicator
      v-if="!isLoadingImages && originalLength > 1"
      class="absolute top-1/2 left-2 -translate-y-1/2"
      :active-index="activeIndex"
      :count="originalLength"
      orientation="vertical"
    />
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useNow } from '@/composables/useNow'

import CarouselIndicator from '../CarouselIndicator.vue'
import GenericLoader from '../GenericLoader.vue'

const { images, isLoadingImages, isLoadingSlug } = useNow()

const activeIndex = ref(0)
const isHovered = ref(false)
const isInteracting = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

let autoPlayInterval: null | number = null
let interactionTimeout: null | number = null

const originalLength = computed(() => images.value?.length || 0)

// Pause auto-play when user interacts
const handleInteraction = () => {
  isInteracting.value = true

  if (interactionTimeout) clearTimeout(interactionTimeout)

  // Resume auto-play 3 seconds after the last interaction
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
