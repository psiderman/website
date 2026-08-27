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
        class="desktop:grid desktop:px-0 desktop:grid-cols-[1fr_min(40%,400px)_min(60%,1020px)_1fr] noscrollbar border-border-primary relative z-0 h-full w-full gap-8 overflow-hidden border-t"
      >
        <div></div>
        <div
          id="card-list-scroll-container"
          class="noscrollbar desktop:flex-col desktop:gap-10 desktop:-mx-4 desktop:pb-20 desktop:pt-5 desktop:snap-y desktop:snap-mandatory pointer-events-none relative z-20 flex h-full snap-x snap-mandatory items-end gap-2 overflow-scroll scroll-smooth px-4 pb-4"
        >
          <div
            v-for="year in sortedYears"
            :key="year"
            class="desktop:gap-2 desktop:w-full pointer-events-auto left-0 flex flex-col gap-4"
          >
            <div
              class="dark:text-light/70 text-text-tertiary text-ui bg-background desktop:px-2 desktop:bg-transparent sticky -left-1 w-fit rounded-full px-3 py-1 tracking-wider backdrop-blur-xs"
            >
              {{ year }}
            </div>
            <div class="desktop:flex-col desktop:gap-10 desktop:w-full flex gap-2">
              <button
                v-for="travel in travelsByYear[year]"
                :key="travel.slug"
                :ref="(el) => setCardRef(el, travel.slug)"
                class="border-border-primary bg-surface-primary desktop:h-fit noscrollbar desktop:w-full desktop:snap-start desktop:scroll-mt-14 pointer-events-auto flex h-80 w-[90svw] snap-center snap-always flex-col overflow-y-scroll rounded-xl border p-0 transition-colors duration-200"
                :class="[
                  {
                    'ring-primary ring-2 ring-blue-500 ring-offset-2':
                      activeTripSlug === travel.slug,
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
                  class="bg-surface-secondary noscrollbar desktop:w-full sticky top-0 flex h-20 shrink-0 snap-x snap-mandatory flex-row overflow-x-auto scroll-smooth rounded-t-xl"
                >
                  <img
                    v-for="(img, idx) in travel.images"
                    :key="img.id"
                    v-lazy="img.thumbnailUrl"
                    :alt="img.name"
                    class="size-20 shrink-0 cursor-pointer snap-start object-cover transition-opacity hover:opacity-90"
                    width="80"
                    height="80"
                    @click.stop="triggerLightbox(travel, idx)"
                  />
                </div>

                <!-- Card Body -->
                <div class="desktop:p-6 flex flex-col gap-3">
                  <div
                    class="bg-surface-primary desktop:p-0 desktop:pb-4 desktop:w-full sticky flex flex-row items-start justify-between p-4"
                    :class="travel.images.length > 0 ? 'top-20' : 'top-0'"
                  >
                    <div class="flex flex-col gap-0 text-left">
                      <h2 class="text-h2 text-text-primary">{{ travel.title }}</h2>
                      <p class="text-ui text-text-secondary">{{ travel.subtitle }}</p>
                    </div>
                    <div class="-mt-2 -mr-2 flex flex-row">
                      <!-- Close Friends -->
                      <div
                        v-if="isHighClearance(travel.clearance)"
                        v-tooltip="{ content: 'you’re on “the list”' }"
                        class="flex size-10 shrink-0 items-center justify-center"
                      >
                        <div
                          class="flex size-5 items-center justify-center rounded-full bg-green-500"
                        >
                          <Star :size="12" fill="#fff" stroke-width="0" />
                        </div>
                      </div>
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
                        <Pin :size="16" />
                      </div>
                    </div>
                  </div>
                  <div
                    class="dark:text-text-secondary desktop:p-0 -mt-4 flex flex-col gap-3 p-4 pt-0 text-left"
                  >
                    <p v-for="(p, p_id) in travel.description" :key="p_id" class="text-p">
                      {{ p }}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <p
            class="text-text-tertiary desktop:inline-block hidden self-center text-center tracking-wider uppercase"
          >
            fin.
          </p>
        </div>

        <div
          v-if="!currentUser?.id"
          class="desktop:relative desktop:flex text-ui desktop:col-span-2 absolute inset-0 z-10 h-full w-full bg-blue-900"
        >
          <img
            v-if="previewUrl"
            v-lazy="previewUrl"
            alt="map view"
            class="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div
            class="bg-dark/70 desktop:pb-0 absolute inset-0 flex flex-col items-center justify-center pb-80 backdrop-blur-xs"
          >
            <div class="flex max-w-80 flex-col items-center justify-center gap-2 text-center">
              <span class="text-display">🎞️</span>
              <h2 class="text-h2 text-light">See where I took the pictures</h2>
              <p class="text-light/80 text-p">
                How convenient that I take pictures with a device that doubles up as a GPS.
              </p>
              <button
                class="btn stroke dark:primary mt-6 mb-2 w-fit"
                @click="isAuthModalOpen = true"
              >
                Load the map
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="desktop:relative desktop:flex desktop:col-span-2 absolute inset-0 z-10 h-full w-full bg-blue-900"
        >
          <TravelMap
            :active-trip-slug="activeTripSlug"
            :travels-with-images="travelsWithImages"
            data-sync="travel-map"
            @marker-click="handleTripClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, Repeat, RepeatOff, Star } from '@lucide/vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import TravelMap from '@/components/TravelMap.vue'
import { currentUser } from '@/composables/useAuth'
import { isAuthModalOpen } from '@/composables/useAuth'
import { isLightBoxOpen, lightBoxData } from '@/composables/useGlobal'
import { isHighClearance, useTravelsWithImages } from '@/composables/useTravel'
import { getStorageUrl } from '@/supabase'
import { openLink } from '@/utils'

const { error, isLoading, travelsWithImages } = useTravelsWithImages()
const activeTripSlug = ref<null | string>(null)

const previewUrl = computed(() => {
  return getStorageUrl('webp', 'map-preview.webp')
})

// Map to hold references to the DOM elements of the travel cards
const cardRefs = ref<Record<string, HTMLElement>>({})
const intersectingElements = new Set<Element>()
let observer: IntersectionObserver | null = null
let debounceTimer: null | number = null

function handleTripClick(slug: string) {
  if (!currentUser.value?.id) return
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  activeTripSlug.value = slug

  const el = cardRefs.value[slug]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
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
    caption: img.caption,
    clearance: img.clearance,
    height: img.height,
    thumbnailUrl: img.thumbnailUrl,
    url: img.url,
    width: img.width,
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

function setupIntersectionObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  intersectingElements.clear()

  const scrollContainer = document.querySelector('#card-list-scroll-container')
  if (!scrollContainer) return

  const rootMargin = '-10% -10% -10% -10%'

  observer = new IntersectionObserver(
    (entries) => {
      const isDesktop = window.matchMedia('(min-width: 1280px)').matches

      // Update our set of currently intersecting elements
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingElements.add(entry.target)
        } else {
          intersectingElements.delete(entry.target)
        }
      })

      // Zoom out to whole only if scrolled all the way back to the start
      if (scrollContainer && scrollContainer.scrollTop === 0 && scrollContainer.scrollLeft === 0) {
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        activeTripSlug.value = null
        return
      }

      if (!currentUser.value?.id) return

      if (intersectingElements.size > 0) {
        const containerRect = scrollContainer.getBoundingClientRect()

        const getSnapDist = (rect: DOMRect) => {
          if (isDesktop) {
            // Desktop snaps to top (with scroll margin)
            const targetTop = containerRect.top + 56
            return Math.abs(rect.top - targetTop)
          } else {
            // Mobile snaps to center
            const targetCenter = containerRect.left + containerRect.width / 2
            const rectCenter = rect.left + rect.width / 2
            return Math.abs(rectCenter - targetCenter)
          }
        }

        let bestElement: Element | null = null
        let minDistance = Infinity

        intersectingElements.forEach((el) => {
          const rect = el.getBoundingClientRect()
          const dist = getSnapDist(rect)
          if (dist < minDistance) {
            minDistance = dist
            bestElement = el
          }
        })

        if (bestElement) {
          const slug = (bestElement as Element).getAttribute('data-sync')
          if (slug) {
            if (debounceTimer) {
              clearTimeout(debounceTimer)
            }
            debounceTimer = window.setTimeout(() => {
              activeTripSlug.value = slug
            }, 500)
          }
        }
      }
    },
    {
      root: scrollContainer,
      rootMargin,
      threshold: 0.2,
    },
  )

  // Observe all current cards
  Object.values(cardRefs.value).forEach((el) => {
    observer?.observe(el)
  })
}

watch(
  () => travelsWithImages.value,
  async (newTravels) => {
    if (newTravels && newTravels.length > 0) {
      await nextTick()
      setupIntersectionObserver()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await nextTick()
  if (travelsWithImages.value && travelsWithImages.value.length > 0) {
    setupIntersectionObserver()
  }
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
  @apply hover:from-hover hover:to-hover active:from-press active:to-press flex size-10 cursor-pointer items-center justify-center rounded-full bg-linear-0 transition-colors;
}
</style>
