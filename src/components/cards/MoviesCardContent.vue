<template>
  <div
    ref="scrollContainer"
    class="bg-surface-primary noscrollbar relative flex h-full w-full snap-x snap-mandatory flex-row gap-2 overflow-x-auto scroll-smooth"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @touchstart="handleInteraction"
    @wheel="handleInteraction"
    @scroll="handleInteraction"
    @keydown.right.prevent="focusSibling(1)"
    @keydown.left.prevent="focusSibling(-1)"
  >
    <div
      v-if="loading"
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <GenericLoader />
    </div>

    <template v-else-if="movies">
      <div
        v-for="(movie, idx) in movies"
        :key="movie.id"
        v-tooltip="{
          content: `${movie.title}, ${formatDistanceToNowStrict(movie.watched_date)} ago`,
          group: 'movies',
        }"
        class="group border-border-primary dark:border-surface-tertiary outline-surface-inverted relative block aspect-2/3 h-full shrink-0 snap-start snap-always overflow-hidden rounded-lg border"
      >
        <a
          v-if="movie.link"
          :href="movie.link"
          target="_blank"
          rel="noopener noreferrer"
          data-focusable
          class="absolute inset-0 z-0 cursor-pointer focus-visible:opacity-80 focus-visible:outline-none"
          :tabindex="activeFocusIndex === idx ? 0 : -1"
          :aria-label="`Open ${movie.title} on Letterboxd`"
          @focus="activeFocusIndex = idx"
        />
        <img
          v-lazy="movie.cover"
          :alt="`poster for ${movie.title}`"
          class="h-full w-full object-cover"
          :class="{
            'group-hover:blur-xs': movie.review,
            'blur-xs': activeReviewId === movie.id,
          }"
          width="600"
          height="900"
        />
        <div
          v-if="movie.review"
          class="bg-dark/70 text-p pointer-events-none absolute inset-0 flex flex-col justify-between p-3 transition-opacity duration-200 group-hover:opacity-100"
          :class="activeReviewId === movie.id ? 'opacity-100' : 'opacity-0'"
        >
          <p class="text-light/80 font-handwriting line-clamp-8 text-ellipsis">
            “{{ movie.review }}”
          </p>
        </div>
        <div
          class="bg-surface-primary border-border-primary dark:border-surface-tertiary pointer-events-none absolute bottom-1 left-1 mx-auto flex w-fit flex-row items-center justify-center gap-1 rounded-sm border px-1.5 py-1"
        >
          <Star :size="12" class="-ml-0.5 fill-amber-500" stroke-width="0" />
          <span class="text-mono text-text-primary">
            {{ movie.rating?.toFixed(1) }}
          </span>
        </div>
        <button
          v-if="movie.review"
          type="button"
          :aria-expanded="activeReviewId === movie.id"
          :aria-label="activeReviewId === movie.id ? 'Hide review' : 'Show review'"
          class="bg-surface-primary border-border-primary dark:border-surface-tertiary text-text-primary desktop:hidden absolute right-1 bottom-1 z-10 mx-auto flex w-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border px-1 py-1 after:absolute after:top-1/2 after:left-1/2 after:h-12 after:w-12 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
          @click.stop="toggleReview(movie.id)"
        >
          <TextAlignStart :size="12" />
        </button>
      </div>
    </template>

    <div
      v-else
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert, Star, TextAlignStart } from '@lucide/vue'
import { useQuery } from '@tanstack/vue-query'
import { formatDistanceToNowStrict } from 'date-fns'
import { onMounted, onUnmounted, ref } from 'vue'

import GenericLoader from '../GenericLoader.vue'

interface Movie {
  cover: string
  id: string
  link: null | string
  rating: null | number
  review: null | string
  title: string
  watched_date: string
}

const { data: movies, isLoading: loading } = useQuery({
  queryFn: async () => {
    const res = await fetch('/api/movies')
    if (!res.ok) throw new Error('Failed to fetch movies')
    return (await res.json()) as Movie[]
  },
  queryKey: ['movies'],
})

const scrollContainer = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const isInteracting = ref(false)
const activeReviewId = ref<null | string>(null)

const toggleReview = (id: string) => {
  activeReviewId.value = activeReviewId.value === id ? null : id
}

let autoPlayInterval: null | number = null
let interactionTimeout: null | number = null

const handleInteraction = () => {
  isInteracting.value = true
  if (interactionTimeout) clearTimeout(interactionTimeout)
  interactionTimeout = window.setTimeout(() => {
    isInteracting.value = false
  }, 4000)
}

const scrollToNext = () => {
  if (!scrollContainer.value || (movies.value?.length ?? 0) <= 1) return

  const { clientWidth, scrollLeft, scrollWidth } = scrollContainer.value
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  if (scrollLeft + clientWidth >= scrollWidth - 10) {
    scrollContainer.value.scrollTo({ behavior, left: 0 })
  } else {
    // Scroll by an amount large enough to trigger the next snap point.
    scrollContainer.value.scrollBy({ behavior, left: 150 })
  }
}

const startAutoPlay = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (autoPlayInterval) clearInterval(autoPlayInterval)
  autoPlayInterval = window.setInterval(() => {
    if (!isHovered.value && !isInteracting.value && (movies.value?.length ?? 0) > 1) {
      scrollToNext()
    }
  }, 4000)
}

const stopAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
}

const activeFocusIndex = ref(0)

const focusSibling = (direction: number) => {
  if (scrollContainer.value) {
    const focusable = Array.from(
      scrollContainer.value.querySelectorAll<HTMLElement>('[data-focusable]'),
    )
    if (focusable.length === 0) return
    const currentIndex = focusable.findIndex((el) => el === document.activeElement)
    const baseIndex = currentIndex !== -1 ? currentIndex : activeFocusIndex.value
    const nextIndex = baseIndex + direction
    if (nextIndex >= 0 && nextIndex < focusable.length) {
      focusable[nextIndex].focus()
    }
  }
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
