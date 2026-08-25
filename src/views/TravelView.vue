<template>
  <div class="flex w-full flex-col gap-0">
    <div class="flex h-[calc(100svh-80px)] flex-col">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="max-w-container mx-auto flex h-full w-full items-center justify-center"
      >
        <GenericLoader />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="max-w-container bg-surface-secondary mx-auto flex h-full w-full items-center justify-center"
      >
        <p class="text-mono text-text-tertiary">Error loading travels.</p>
      </div>

      <!-- Main Layout -->
      <div
        v-else
        id="mapbox-bounds"
        class="desktop:grid desktop:px-0 desktop:grid-cols-[1fr_min(40%,400px)_min(60%,1020px)_1fr] noscrollbar border-border-primary h-full w-full grid-cols-2 gap-8 overflow-hidden border-t px-4"
      >
        <div></div>
        <div class="flex h-full flex-col gap-10 overflow-scroll pt-6 pb-10">
          <div class="-mb-6 flex flex-col gap-2">
            <h1 class="text-h2 text-text-primary -0">travel diaries</h1>
            <p class="text-p text-text-secondary italic">
              loads of people have told me that i should start putting my favorite places down
              somewhere.
            </p>
          </div>
          <div v-for="year in sortedYears" :key="year" class="flex flex-col gap-10">
            <div class="text-text-tertiary text-ui -mb-7 px-2 py-1 tracking-wider">
              {{ year }}
            </div>
            <div
              v-for="travel in travelsByYear[year]"
              :key="travel.slug"
              class="border-border-primary bg-surface-primary pointer-events-auto flex h-fit flex-col gap-2 rounded-xl border p-0 transition-colors duration-200"
              :data-sync="travel.slug"
            >
              <!-- Card Image Gallery Row -->
              <div
                v-if="travel.images && travel.images.length > 0"
                class="bg-surface-secondary noscrollbar flex h-20 flex-row overflow-x-auto rounded-t-xl"
              >
                <img
                  v-for="(img, idx) in travel.images"
                  :key="img.id"
                  :src="img.url"
                  :alt="img.name"
                  class="size-20 shrink-0 cursor-pointer object-cover transition-opacity hover:opacity-90"
                  width="100"
                  height="100"
                  @click="triggerLightbox(travel, idx)"
                />
              </div>

              <!-- Card Body -->
              <div class="flex flex-col gap-3 p-6">
                <div class="flex w-full flex-row items-start justify-between">
                  <div class="flex flex-col gap-0">
                    <h2 class="text-h2 text-text-primary">{{ travel.title }}</h2>
                    <p class="text-ui text-text-secondary">{{ travel.dateLabel }}</p>
                  </div>
                  <div class="-mt-1 flex flex-row">
                    <!-- Repeat status button -->
                    <div
                      v-tooltip="{
                        content: travel.repeatVisit ? 'repeat visit' : 'first visit',
                        group: travel.slug,
                      }"
                      class="action-btn"
                      :class="travel.repeatVisit ? 'text-text-primary' : 'text-text-tertiary'"
                    >
                      <component :is="travel.repeatVisit ? Repeat : RepeatOff" :size="16" />
                    </div>

                    <!-- Instagram Link Button -->
                    <div
                      v-if="travel.instagramLink"
                      v-tooltip="{
                        content: 'instagram post',
                        group: travel.slug,
                      }"
                      class="action-btn text-text-primary"
                      @click="openLink(travel.instagramLink)"
                    >
                      <FA :icon="['fab', 'instagram']" class="text-ui" />
                    </div>

                    <!-- Google Maps list link button -->
                    <div
                      v-if="travel.mapsListLink"
                      v-tooltip="{
                        content: 'google maps list',
                        group: travel.slug,
                      }"
                      class="action-btn text-text-primary"
                      @click="openLink(travel.mapsListLink)"
                    >
                      <component :is="travel.mapsListLink ? Pin : PinOff" :size="16" />
                    </div>
                  </div>
                </div>
                <div class="dark:text-text-secondary flex flex-col gap-3">
                  <p v-for="(p, p_id) in travel.description" :key="p_id" class="text-p">
                    {{ p }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <TravelMap
          :travels-with-images="travelsWithImages"
          class="desktop:flex col-span-2 hidden h-full"
          data-sync="travel-map"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, PinOff, Repeat, RepeatOff } from '@lucide/vue'
import { computed } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import TravelMap from '@/components/TravelMap.vue'
import { isLightBoxOpen, lightBoxData } from '@/composables/useGlobal'
import { useTravelsWithImages } from '@/composables/useTravel'
import { openLink } from '@/utils'

const { error, isLoading, travelsWithImages } = useTravelsWithImages()

// Group travels by year for efficient rendering (prevents layout trigger function calls in template)
const travelsByYear = computed(() => {
  const groups: Record<number, typeof travelsWithImages.value> = {}
  if (!travelsWithImages.value) return groups

  for (const travel of travelsWithImages.value) {
    const year = new Date(travel.date).getFullYear()
    if (!groups[year]) groups[year] = []
    groups[year].push(travel)
  }
  return groups
})

// Sorted list of years to loop over (descending)
const sortedYears = computed(() => {
  return Object.keys(travelsByYear.value)
    .map(Number)
    .sort((a, b) => b - a)
})

const triggerLightbox = (travel: any, clickedIdx: number) => {
  if (!travel.images || travel.images.length === 0) return

  const allUrls = travel.images.map((img: any) => img.url)
  // Reorder so that the clicked image starts at index 0 in the lightbox
  const orderedUrls = [
    allUrls[clickedIdx],
    ...allUrls.slice(0, clickedIdx),
    ...allUrls.slice(clickedIdx + 1),
  ]

  lightBoxData.value = {
    description: travel.dateLabel,
    images: orderedUrls,
    title: travel.title,
  }
  isLightBoxOpen.value = true
}
</script>

<style scoped>
@reference "@/style.css";

.action-btn {
  @apply hover:from-hover hover:to-hover active:from-press active:to-press flex size-8 cursor-pointer items-center justify-center rounded-full bg-linear-0 transition-colors;
}
</style>
