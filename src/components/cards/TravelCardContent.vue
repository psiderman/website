<template>
  <div class="pointer-events-none relative h-full w-full grow">
    <img
      v-if="previewUrl"
      v-lazy="previewUrl"
      alt="map view"
      width="600"
      height="400"
      class="absolute inset-0 h-full w-full object-cover dark:opacity-80"
    />
  </div>
  <div class="pointer-events-auto absolute inset-0 bg-transparent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { getStorageUrl } from '@/supabase'

const previewUrl = computed(() => {
  return getStorageUrl('webp', 'map-preview.webp')
})
</script>
