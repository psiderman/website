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
        class="desktop:grid desktop:px-0 desktop:grid-cols-[1fr_min(40%,400px)_min(60%,1020px)_1fr] noscrollbar border-border-primary h-full w-full grid-cols-2 gap-8 overflow-hidden border-t"
      >
        <div></div>
        <div
          id="card-list-scroll-container"
          class="noscrollbar -mx-4 flex h-full flex-col gap-10 overflow-scroll px-4 pt-5 pb-20"
        >
          <div v-for="year in sortedYears" :key="year" class="flex flex-col gap-10">
            <div class="text-text-tertiary text-ui -mb-7 px-2 py-1 tracking-wider">
              {{ year }}
            </div>
            <button
              v-for="travel in travelsByYear[year]"
              :key="travel.slug"
              :ref="(el) => setCardRef(el, travel.slug)"
              class="border-border-primary bg-surface-primary pointer-events-auto flex h-fit flex-col gap-2 rounded-xl border p-0 transition-colors duration-200"
              :class="[
                {
                  'ring-primary ring-2 ring-blue-500 ring-offset-2': activeTripSlug === travel.slug,
                },
                currentUser?.id ? 'cursor-pointer hover:shadow-xs' : '',
              ]"
              :data-sync="travel.slug"
              @click="handleTripClick(travel.slug)"
              @focus="handleTripClick(travel.slug)"
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
                  @click.stop="triggerLightbox(travel, idx)"
                />
              </div>

              <!-- Card Body -->
              <div class="flex flex-col gap-3 p-6">
                <div class="flex w-full flex-row items-start justify-between">
                  <div class="flex flex-col gap-0 text-left">
                    <h2 class="text-h2 text-text-primary">{{ travel.title }}</h2>
                    <p class="text-ui text-text-secondary">{{ travel.subtitle }}</p>
                  </div>
                  <div class="-mt-1 flex flex-row">
                    <!-- Repeat status button -->
                    <div
                      v-if="travel.repeatVisit"
                      v-tooltip="{
                        content: 'Revisited',
                        group: travel.slug,
                      }"
                      class="action-btn cursor-help!"
                    >
                      <component :is="travel.repeatVisit ? Repeat : RepeatOff" :size="16" />
                    </div>

                    <!-- Instagram Link Button -->
                    <div
                      v-if="travel.instagramLink"
                      v-tooltip="{
                        content: 'See this on Instagram',
                        group: travel.slug,
                      }"
                      class="action-btn text-text-primary"
                      @click.stop="openLink(travel.instagramLink)"
                    >
                      <FA :icon="['fab', 'instagram']" class="text-ui" />
                    </div>

                    <!-- Google Maps list link button -->
                    <div
                      v-if="travel.mapsListLink"
                      v-tooltip="{
                        content: 'See my saved places on Google Maps',
                        group: travel.slug,
                      }"
                      class="action-btn text-text-primary"
                      @click.stop="openLink(travel.mapsListLink)"
                    >
                      <component :is="travel.mapsListLink ? Pin : PinOff" :size="16" />
                    </div>
                  </div>
                </div>
                <div class="dark:text-text-secondary flex flex-col gap-3 text-left">
                  <p v-for="(p, p_id) in travel.description" :key="p_id" class="text-p">
                    {{ p }}
                  </p>
                </div>
              </div>
            </button>
          </div>
          <p class="text-text-tertiary text-center tracking-wider uppercase">fin.</p>
        </div>

        <div
          v-if="!currentUser?.id"
          class="desktop:flex text-ui relative col-span-2 hidden h-full w-full bg-blue-900"
        >
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="map view"
            class="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div
            class="bg-overlay absolute inset-0 flex flex-col items-center justify-center backdrop-blur-xs"
          >
            <div class="flex max-w-80 flex-col items-center justify-center gap-2 text-center">
              <p class="text-h1">🗺️</p>
              <h2 class="text-h2 text-light">You’re not logged in</h2>
              <p class="text-light/75">Log in if you’d like to interact with the map.</p>
              <button
                class="btn stroke dark:primary mt-6 mb-2 w-fit"
                @click="isAuthModalOpen = true"
              >
                Log in
              </button>
            </div>
          </div>
        </div>

        <TravelMap
          v-else
          :active-trip-slug="activeTripSlug"
          :travels-with-images="travelsWithImages"
          class="desktop:flex col-span-2 hidden h-full w-full bg-blue-900"
          data-sync="travel-map"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, PinOff, Repeat, RepeatOff } from '@lucide/vue'
import { computed } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import TravelMap from '@/components/TravelMap.vue'
import { currentUser } from '@/composables/useAuth'
import { isAuthModalOpen } from '@/composables/useAuth'
import { isLightBoxOpen, lightBoxData } from '@/composables/useGlobal'
import { useTravelsWithImages } from '@/composables/useTravel'
import { getStorageUrl } from '@/supabase'
import { openLink } from '@/utils'

const { error, isLoading, travelsWithImages } = useTravelsWithImages()
const activeTripSlug = ref<null | string>(null)

const previewUrl = computed(() => {
  return getStorageUrl('webp', 'map-preview.webp')
})

// Map to hold references to the DOM elements of the travel cards
const cardRefs = ref<Record<string, HTMLElement>>({})
let observer: IntersectionObserver | null = null
let debounceTimer: null | number = null

function handleTripClick(slug: string) {
  if (!currentUser.value?.id) return
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  activeTripSlug.value = slug
}

function setCardRef(el: any, slug: string) {
  if (el) {
    cardRefs.value[slug] = el.$el || el
  } else {
    delete cardRefs.value[slug]
  }
}

// Group travels by year for efficient rendering (prevents layout trigger function calls in template)
const travelsByYear = computed(() => {
  const groups: Record<number, typeof travelsWithImages.value> = {}
  if (!travelsWithImages.value) return groups

  for (const travel of travelsWithImages.value) {
    const year = new Date(travel.date).getFullYear()
    if (!groups[year]) groups[year] = []
    groups[year].push(travel)
  }

  // Sort each group descending by date
  for (const year in groups) {
    groups[year]!.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

  const allImages = travel.images.map((img: any) => ({
    closeFriends: img.closeFriends,
    url: img.url,
  }))
  // Reorder so that the clicked image starts at index 0 in the lightbox
  const orderedImages = [
    allImages[clickedIdx],
    ...allImages.slice(0, clickedIdx),
    ...allImages.slice(clickedIdx + 1),
  ]

  lightBoxData.value = {
    description: travel.dateLabel,
    images: orderedImages,
    title: travel.title,
  }
  isLightBoxOpen.value = true
}

onMounted(() => {
  const scrollContainer = document.querySelector('#card-list-scroll-container')

  // Set up intersection observer to detect when cards occupy the center viewport area
  observer = new IntersectionObserver(
    (entries) => {
      // Zoom out to whole only if scrolled all the way back up to 0
      if (scrollContainer && scrollContainer.scrollTop === 0) {
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        activeTripSlug.value = null
        return
      }

      if (!currentUser.value?.id) return

      const visibleEntries = entries.filter((e) => e.isIntersecting)
      if (visibleEntries.length > 0) {
        // Find the one closest to the center/top
        const target = visibleEntries.reduce((prev, curr) => {
          return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top)
            ? curr
            : prev
        })
        const slug = target.target.getAttribute('data-sync')
        if (slug) {
          if (debounceTimer) {
            clearTimeout(debounceTimer)
          }
          debounceTimer = window.setTimeout(() => {
            activeTripSlug.value = slug
          }, 1500) // Delay by 1.5 seconds of sustained presence
        }
      }
    },
    {
      root: scrollContainer,
      rootMargin: '-20% 0px -40% 0px', // Target the center section of the scrolling pane
      threshold: 0.2,
    },
  )

  // Observe all current cards
  Object.values(cardRefs.value).forEach((el) => {
    observer?.observe(el)
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<style scoped>
@reference "@/style.css";

.action-btn {
  @apply hover:from-hover hover:to-hover active:from-press active:to-press flex size-8 cursor-pointer items-center justify-center rounded-full bg-linear-0 transition-colors;
}
</style>
