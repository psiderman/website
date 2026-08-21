<template>
  <div
    class="bg-surface-secondary relative h-full w-full overflow-hidden rounded-lg"
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
      class="pointer-events-none relative h-full w-full overflow-hidden"
      @touchstart="handleInteraction"
      @wheel="handleInteraction"
    >
      <div
        class="flex h-full w-full flex-col transition-transform duration-500 ease-in-out"
        :style="{ transform: `translateY(-${activeIndex * 100}%)` }"
      >
        <div
          v-for="(img, idx) in images"
          :key="`${img.name}-${idx}`"
          class="h-full w-full shrink-0"
        >
          <img class="h-full w-full object-cover" :src="img.url" :alt="img.name" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2">
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>

    <!-- Custom Side Indicator -->
    <div
      v-if="!isLoadingImages && originalLength > 1"
      class="bg-overlay absolute top-1/2 left-2 flex w-4 -translate-y-1/2 flex-col items-center gap-1 rounded-full p-1 backdrop-blur-xs transition-opacity duration-1000"
    >
      <!-- The sliding active pill -->
      <div
        class="bg-light absolute z-10 mt-1 h-4 w-2 rounded-full shadow-sm transition-all duration-1000 ease-in-out"
        :style="{ top: `${activeIndex * 12}px` }"
      ></div>

      <!-- The background dots -->
      <div
        v-for="(_, index) in originalLength"
        :key="index"
        class="bg-light h-2 w-2 rounded-full transition-all duration-1000 ease-in-out"
        :class="activeIndex == index ? 'h-4 opacity-0' : 'h-2 opacity-40'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useNow } from '@/composables/useNow'

import GenericLoader from '../GenericLoader.vue'

const { images, isLoadingImages, isLoadingSlug } = useNow()

const activeIndex = ref(0)
const isHovered = ref(false)
const isInteracting = ref(false)

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

const scrollToNext = () => {
  if (originalLength.value <= 1) return
  activeIndex.value = (activeIndex.value + 1) % originalLength.value
}

const startAutoPlay = () => {
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
  setTimeout(() => {
    startAutoPlay()
  }, 2000)
})

onUnmounted(() => {
  stopAutoPlay()
  if (interactionTimeout) clearTimeout(interactionTimeout)
})
</script>
