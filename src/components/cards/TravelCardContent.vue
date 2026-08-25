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

    <TravelMap
      :travels-with-images="travelsWithImages"
      class="desktop:flex col-span-2 hidden h-full"
    />
  </div>
  <div class="pointer-events-auto absolute inset-0 bg-transparent"></div>
</template>

<script setup lang="ts">
import { useTravelsWithImages } from '@/composables/useTravel'

import TravelMap from '../TravelMap.vue'

const { error, isLoading, travelsWithImages } = useTravelsWithImages()
</script>
