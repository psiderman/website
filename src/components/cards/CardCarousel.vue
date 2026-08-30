<template>
  <div
    class="bg-surface-secondary relative h-full w-full rounded-lg"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <GenericLoader />
    </div>

    <!-- Images Carousel -->
    <div
      v-else-if="!isError && images && images.length > 0"
      ref="scrollContainer"
      role="region"
      :aria-label="`${title ? title + ' carousel' : 'Image carousel'}`"
      class="noscrollbar desktop:flex-col desktop:snap-y desktop:overflow-x-hidden desktop:overflow-y-auto focus-visible:outline-text-primary relative flex h-full w-full snap-x snap-mandatory flex-row overflow-x-auto overflow-y-hidden scroll-smooth focus-visible:outline-2 focus-visible:-outline-offset-2"
      tabindex="0"
      @touchstart="handleInteraction"
      @wheel="handleInteraction"
      @scroll="onScroll"
    >
      <div
        v-for="(img, idx) in images"
        :key="`${img}-${idx}`"
        class="h-full w-full shrink-0 snap-center"
        :class="{ 'cursor-pointer': props.interactive, 'pointer-events-none': !props.interactive }"
        @click.stop="props.interactive && emit('click-image', idx)"
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

    <!-- Empty / Error State -->
    <div
      v-else
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>

    <!-- Custom Side Indicator (Desktop) -->
    <CarouselIndicator
      v-if="!isLoading && !isError && originalLength > 1"
      class="desktop:flex pointer-events-none absolute top-1/2 left-2 hidden -translate-y-1/2"
      :active-index="activeIndex"
      :count="originalLength"
      orientation="vertical"
    />
    <!-- Custom Bottom Indicator (Mobile) -->
    <CarouselIndicator
      v-if="!isLoading && !isError && originalLength > 1"
      class="desktop:hidden pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2"
      :active-index="activeIndex"
      :count="originalLength"
      orientation="horizontal"
    />
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import CarouselIndicator from '../CarouselIndicator.vue'
import GenericLoader from '../GenericLoader.vue'

const props = defineProps<{
  images?: string[]
  interactive?: boolean
  isError?: boolean
  isLoading?: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'click-image', index: number): void
}>()

const activeIndex = ref(0)
const isHovered = ref(false)
const isInteracting = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

let autoPlayInterval: null | number = null
let interactionTimeout: null | number = null

const originalLength = computed(() => props.images?.length || 0)

const isHorizontal = () => window.innerWidth < 1280

const handleInteraction = () => {
  isInteracting.value = true

  if (interactionTimeout) clearTimeout(interactionTimeout)

  interactionTimeout = window.setTimeout(() => {
    isInteracting.value = false
  }, 3000)
}

const handleScroll = () => {
  if (scrollContainer.value) {
    if (isHorizontal()) {
      const index = Math.round(scrollContainer.value.scrollLeft / scrollContainer.value.clientWidth)
      activeIndex.value = index
    } else {
      const index = Math.round(scrollContainer.value.scrollTop / scrollContainer.value.clientHeight)
      activeIndex.value = index
    }
  }
}

const onScroll = () => {
  handleScroll()
  handleInteraction()
}

const scrollToNext = () => {
  if (!scrollContainer.value || originalLength.value <= 1) return
  const behavior = prefersReducedMotion ? 'auto' : 'smooth'

  if (isHorizontal()) {
    const { clientWidth, scrollLeft, scrollWidth } = scrollContainer.value
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      scrollContainer.value.scrollTo({ behavior, left: 0 })
    } else {
      scrollContainer.value.scrollBy({ behavior, left: clientWidth })
    }
  } else {
    const { clientHeight, scrollHeight, scrollTop } = scrollContainer.value
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      scrollContainer.value.scrollTo({ behavior, top: 0 })
    } else {
      scrollContainer.value.scrollBy({ behavior, top: clientHeight })
    }
  }
}

const scrollToPrev = () => {
  if (!scrollContainer.value || originalLength.value <= 1) return
  const behavior = prefersReducedMotion ? 'auto' : 'smooth'

  if (isHorizontal()) {
    const { clientWidth, scrollLeft } = scrollContainer.value
    if (scrollLeft <= 10) {
      scrollContainer.value.scrollTo({ behavior, left: scrollContainer.value.scrollWidth })
    } else {
      scrollContainer.value.scrollBy({ behavior, left: -clientWidth })
    }
  } else {
    const { clientHeight, scrollTop } = scrollContainer.value
    if (scrollTop <= 10) {
      scrollContainer.value.scrollTo({ behavior, top: scrollContainer.value.scrollHeight })
    } else {
      scrollContainer.value.scrollBy({ behavior, top: -clientHeight })
    }
  }
}

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  const activeEl = document.activeElement
  if (!activeEl) return

  if (scrollContainer.value && activeEl.contains(scrollContainer.value)) {
    if (isHorizontal()) {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollToNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollToPrev()
      }
    } else {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        scrollToNext()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        scrollToPrev()
      }
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
