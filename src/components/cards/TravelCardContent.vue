<template>
  <div class="pointer-events-none relative h-full w-full grow">
    <div
      v-if="isLoading"
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <GenericLoader />
    </div>

    <div v-else-if="error" class="flex h-full w-full flex-col items-center justify-center gap-2">
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>

    <img
      v-if="previewUrl"
      :src="previewUrl"
      alt="map view"
      class="absolute inset-0 h-full w-full object-cover dark:opacity-80"
    />
  </div>
  <div class="pointer-events-auto absolute inset-0 bg-transparent"></div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { computed } from 'vue'

import { useTravelsWithImages } from '@/composables/useTravel.ts'
import { getStorageUrl } from '@/supabase.ts'

import GenericLoader from '../GenericLoader.vue'

const { error, isLoading } = useTravelsWithImages()
const previewUrl = computed(() => {
  return getStorageUrl('webp', 'map-preview.webp')
})
</script>
