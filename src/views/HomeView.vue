<template>
  <div class="flex w-full flex-col items-center gap-0">
    <!-- About me -->
    <div
      ref="aboutMeRef"
      data-sync="about-me"
      class="max-w-container desktop:p-20 desktop:flex-row flex w-full flex-col items-center justify-center gap-8 p-6"
    >
      <img
        v-reveal="50"
        src="@/assets/public.webp"
        alt="karan sanas"
        class="border-border-primary dark:border-light/20 aspect-auto h-50 rounded-[4.16rem] border"
        width="140"
        height="200"
      />
      <div
        class="desktop:w-120 desktop:items-start flex w-full flex-col items-center justify-center gap-4"
      >
        <div
          class="text-ui text-text-secondary desktop:items-start desktop:text-left flex flex-col items-center gap-2 text-center"
        >
          <p v-reveal="100">@psiderman</p>
          <h1 v-reveal="150" class="text-display text-text-primary -mt-2">hi, i’m karan</h1>
          <p v-reveal="200" class="text-ui">
            i’m still searching for a one-liner to sum me up.
            <br class="desktop:block hidden" />
            until then my life is a bento box of endless interests,
            <br class="desktop:block hidden" />
            neatly packed for display on my ever-evolving personal website.
          </p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div
      ref="filterBarRef"
      class="bg-background border-border-primary noscrollbar desktop:h-20 sticky top-0 z-20 mb-10 flex w-full items-end justify-center overflow-x-scroll overflow-y-visible border-b"
    >
      <div
        ref="tabContainerRef"
        role="tablist"
        class="max-w-container desktop:justify-center desktop:px-20 relative flex w-full flex-row items-start justify-between gap-1"
      >
        <button
          v-for="(grp, idx) in filterGroups"
          :key="grp.id"
          :ref="(el) => setTabRef(grp.id, el)"
          v-reveal="Math.min(idx * 50, 350)"
          type="button"
          role="tab"
          :aria-selected="selectedTabIndex === idx"
          :aria-label="grp.label"
          class="text-ui font-sans-alt focus-visible:bg-hover desktop:shrink-0 desktop:px-5 focus-visible:border-surface-tertiary relative flex shrink cursor-pointer flex-row items-center justify-center gap-2 rounded-t-xl border border-b-0 border-transparent p-4 transition-colors duration-200 focus-visible:outline-0!"
          :class="[
            selectedTabIndex === idx
              ? 'text-text-primary font-normal'
              : 'text-text-secondary hover:bg-hover opacity-60 hover:opacity-100',
          ]"
          @click="handleTabClick(grp.id)"
          @keydown="handleTabKeydown"
        >
          <div v-reveal class="flex h-6 items-center justify-center">
            <component :is="grp.icon" :size="20" aria-hidden="true" />
          </div>
          <div
            class="desktop:grid hidden transition-all duration-500 ease-out"
            :class="
              selectedTabIndex === idx
                ? 'grid-cols-[1fr] opacity-100'
                : 'pointer-events-none -ml-2 grid-cols-[0fr] opacity-0'
            "
          >
            <p class="overflow-hidden whitespace-nowrap">
              {{ grp.label }}
            </p>
          </div>
        </button>

        <!-- Smooth moving indicator -->
        <div
          class="bg-surface-inverted pointer-events-none absolute bottom-0 left-0 h-1.5 rounded-t-lg transition-all duration-500 ease-out"
          :style="{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.ready ? 1 : 0,
          }"
        ></div>
      </div>
    </div>

    <!-- Grid -->
    <div
      ref="gridRef"
      class="max-w-container desktop:px-20 desktop:grid-cols-12 relative z-0 grid min-h-[calc(100dvh-5rem)] w-full grid-flow-row-dense auto-rows-36 grid-cols-2 gap-8 px-4"
    >
      <!-- Description Card -->
      <div
        v-if="activeFilter !== 'home' && activeDescription"
        :key="activeFilter"
        v-reveal
        class="border-border-primary bg-surface-primary desktop:col-span-4 pointer-events-auto col-span-2 row-span-3 flex h-124 flex-col gap-2 rounded-xl border p-2 transition-colors duration-200"
      >
        <div class="aspect-video">
          <img
            v-lazy="{ src: activeDescription.cover, placeholder: activeDescription.placeholder }"
            class="border-border-primary size-full rounded-lg border object-cover"
            :alt="activeFilter"
            width="800"
            height="450"
          />
        </div>
        <div
          class="text-p text-text-secondary noscrollbar flex size-full flex-col gap-5 overflow-scroll italic"
        >
          <p class="text-text-primary -mb-1 font-semibold" v-html="activeDescription.title"></p>
          <p v-for="(p, i) in activeDescription.body" :key="i" v-html="p"></p>
        </div>
      </div>
      <!-- All Cards -->
      <CardContainer
        v-for="(card, idx) in filteredCards"
        :key="card.id"
        v-slot="{ isIconHovered }"
        v-reveal="Math.min(idx * 50, 350)"
        :class="card.span"
        :title="card.title"
        :arrow="card.arrow"
        :size="card.size"
        :focusable="card.focusable"
        :bg-class="card.bgClass"
        :img="card.size === 'sm' ? card.imageUrl : undefined"
        :link="card.link"
        @activate="handleCardClick(card)"
        @click="handleCardClick(card)"
      >
        <component
          :is="card.content"
          v-if="card.content"
          v-bind="card.id === 'guestbook' ? { 'show-help': isIconHovered } : {}"
        />
        <CardCarousel
          v-else-if="card.carousel"
          :images="card.images"
          :interactive="card.lightbox"
          :is-error="card.isError"
          :is-loading="card.isLoading"
          :title="card.title"
          @click-image="(idx: number) => handleCarouselClick(card, idx)"
        />
        <template v-else-if="card.size === 'md'">
          <video
            v-if="card.coverVid"
            :src="card.coverVid"
            class="pointer-events-none size-full object-cover"
            :autoplay="!prefersReducedMotion"
            :loop="!prefersReducedMotion"
            muted
            playsinline
          />
          <img
            v-else-if="card.imageUrl"
            v-lazy="card.imageUrl"
            class="pointer-events-none size-full object-cover"
            :alt="card.title"
            width="800"
            height="450"
          />
        </template>
      </CardContainer>
    </div>
    <div class="max-w-container w-full">
      <ContactForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardCarousel from '@/components/cards/CardCarousel.vue'
import CardContainer from '@/components/home/CardContainer.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import { openLightbox, openPhotoLightbox } from '@/composables/useGlobal'
import { useNow } from '@/composables/useNow'
import { type ExtraCard, extraCards as staticExtraCards } from '@/data/extraCards'
import { type Card, intros, cards as staticCards } from '@/data/homeCards'
import { FILTER_GROUPS } from '@/types'
import { trackEvent } from '@/utils/analytics'

import type { FilterGroupId } from '@/types'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const extraCards = ref<Partial<Record<FilterGroupId, ExtraCard[]>>>(staticExtraCards)

const { error: nowError, images: nowImages, isLoading: isNowLoading } = useNow()
const filterGroups = FILTER_GROUPS

const getHtmlElement = (el: unknown): HTMLElement | null => {
  if (!el) return null
  if (el instanceof HTMLElement) return el
  const candidate = (el as { $el?: unknown; el?: unknown }).$el ?? (el as { el?: unknown }).el
  if (candidate instanceof HTMLElement) return candidate
  if (
    candidate &&
    typeof candidate === 'object' &&
    'value' in candidate &&
    (candidate as { value: unknown }).value instanceof HTMLElement
  ) {
    return (candidate as { value: HTMLElement }).value
  }
  return null
}

const filterBarRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const tabContainerRef = ref<HTMLElement | null>(null)
const tabRefs = ref<Record<string, HTMLElement>>({})

const setTabRef = (id: string, el: unknown) => {
  const domEl = getHtmlElement(el)
  if (domEl) {
    tabRefs.value[id] = domEl
  }
}

const aboutMeRef = ref<HTMLElement | null>(null)

const getFilterBarTargetTop = (): number => {
  if (aboutMeRef.value) {
    return Math.round(aboutMeRef.value.getBoundingClientRect().bottom + window.scrollY)
  }
  if (filterBarRef.value) {
    return Math.round(filterBarRef.value.getBoundingClientRect().top + window.scrollY)
  }
  return 0
}

const scrollToFilterBar = (behavior: ScrollBehavior = 'auto', force = false) => {
  const targetTop = getFilterBarTargetTop()
  if (force || window.scrollY > targetTop + 10) {
    window.scrollTo({ behavior, top: targetTop })
  }
}

const indicatorStyle = ref({
  left: 0,
  ready: false,
  width: 0,
})

const updateIndicator = () => {
  const container = getHtmlElement(tabContainerRef.value)
  const activeEl = tabRefs.value[activeFilter.value]
  if (!container || !activeEl) return

  const containerRect = container.getBoundingClientRect()
  const activeRect = activeEl.getBoundingClientRect()

  indicatorStyle.value = {
    left: activeRect.left - containerRect.left,
    ready: true,
    width: activeRect.width,
  }
}

let resizeObserver: null | ResizeObserver = null
let settleTimeoutId: null | ReturnType<typeof setTimeout> = null
// rAF-guard: coalesce all resize notifications in a frame into a single
// indicator pass. Running the sync layout reads/writes here would otherwise
// feed straight back into the observer (the label-width transition resizes
// the tabs every frame), tripping "ResizeObserver loop limit exceeded".
let rafScheduled = false
let scheduleIndicatorUpdate = () => {}

onMounted(() => {
  nextTick(() => {
    updateIndicator()
  })
  window.addEventListener('resize', updateIndicator)

  const tabContainerEl = getHtmlElement(tabContainerRef.value)
  if (tabContainerEl && typeof ResizeObserver !== 'undefined') {
    const run = () => {
      rafScheduled = false
      updateIndicator()
    }
    scheduleIndicatorUpdate = () => {
      if (rafScheduled) return
      rafScheduled = true
      window.requestAnimationFrame(run)
    }
    resizeObserver = new ResizeObserver(scheduleIndicatorUpdate)
    // Observe the container only — button sizes are derived from it, so
    // watching each tab individually only multiplies the churn.
    resizeObserver.observe(tabContainerEl)
  }
})

onUnmounted(() => {
  if (settleTimeoutId) clearTimeout(settleTimeoutId)
  window.removeEventListener('resize', updateIndicator)
  resizeObserver?.disconnect()
  scheduleIndicatorUpdate = () => {}
})

const route = useRoute()
const router = useRouter()

const activeFilter = computed<FilterGroupId>(() => {
  const p = route.query.p as FilterGroupId
  return filterGroups.some((g) => g.id === p) ? p : 'home'
})

const selectedTabIndex = computed(() => filterGroups.findIndex((g) => g.id === activeFilter.value))

const handleTabClick = (id: FilterGroupId) => {
  if (activeFilter.value === id) {
    scrollToFilterBar(prefersReducedMotion ? 'auto' : 'smooth', true)
    return
  }
  router.replace({
    query: {
      ...route.query,
      p: id === 'home' ? undefined : id,
    },
  })
}

// Arrow-key navigation across the filter tabs. Tab itself steps through each
// button (all are tabbable); arrows offer the usual tablist roving as well.
const handleTabKeydown = (event: KeyboardEvent) => {
  const current = selectedTabIndex.value
  let next = -1
  switch (event.key) {
    case 'ArrowLeft':
      next = (current - 1 + filterGroups.length) % filterGroups.length
      break
    case 'ArrowRight':
      next = (current + 1) % filterGroups.length
      break
    case 'End':
      next = filterGroups.length - 1
      break
    case 'Home':
      next = 0
      break
  }
  if (next > -1) {
    event.preventDefault()
    const id = filterGroups[next]!.id
    router.replace({
      query: {
        ...route.query,
        p: id === 'home' ? undefined : id,
      },
    })
    void nextTick(() => tabRefs.value[id]?.focus({ preventScroll: true }))
  }
}

watch(activeFilter, async (newTab) => {
  trackEvent('switch_home_tab', { tab: newTab })
  if (settleTimeoutId) clearTimeout(settleTimeoutId)
  await nextTick()
  updateIndicator()
  const targetTop = getFilterBarTargetTop()
  window.scrollTo({ behavior: 'auto', top: targetTop })
  settleTimeoutId = setTimeout(() => {
    updateIndicator()
    settleTimeoutId = null
  }, 320)
})

const activeDescription = computed(() => intros[activeFilter.value] ?? null)

// Watch global lightbox state is no longer needed to reset isOpen

// Extended interface of Card that includes extra card properties
interface GridCard extends Card {
  coverVid?: string
  extraIndex?: number
  extraKey?: string
  focusable?: boolean
  images?: Array<string | { placeholder?: string; src: string }>
  isError?: boolean
  isExtra?: boolean
  isLoading?: boolean
  lightbox?: boolean
}

const filteredCards = computed<GridCard[]>(() => {
  const baseCards = staticCards.map((card) => {
    if (card.id === 'now') {
      return {
        ...card,
        images: nowImages.value.map((img) => ({
          placeholder: img.placeholder,
          src: img.url,
        })),
        isError: !!nowError.value && nowImages.value.length === 0,
        isLoading: isNowLoading.value && nowImages.value.length === 0,
      }
    }
    return card
  })

  if (!activeFilter.value || activeFilter.value === 'home') return baseCards

  const visible = baseCards.filter((card) => card.group.includes(activeFilter.value))

  const sizeWeight = { lg: 3, md: 2, sm: 1 }

  const sorted = visible
    .sort((a, b) => sizeWeight[b.size] - sizeWeight[a.size])
    .map((card) => (card.hero ? { ...card, span: 'col-span-2 desktop:col-span-8' } : card))

  // Filter extra cards for the active filter
  const matchingExtras = extraCards.value[activeFilter.value]

  if (matchingExtras && matchingExtras.length > 0) {
    const extraGridCards = matchingExtras.map((extra, idx) => {
      const extraCard: GridCard = {
        arrow:
          extra.size === 'sm' ? 'external' : extra.title && extra.description ? 'right' : 'none',
        bgClass: extra.bgClass,
        carousel: extra.carousel,
        coverVid: extra.coverVid,
        extraIndex: idx,
        extraKey: activeFilter.value,
        focusable: extra.size === 'md' && !extra.link,
        group: [activeFilter.value],
        hero: extra.hero,
        id: `extra_${activeFilter.value}_${idx}`,
        images: extra.images,
        imageUrl:
          extra.cover ||
          (extra.images && extra.images.length > 0 ? toImgUrl(extra.images[0]) : undefined),
        isExtra: true,
        lightbox: extra.lightbox,
        link: extra.link,
        size: extra.size || 'sm',
        span: extra.hero
          ? 'col-span-2 desktop:col-span-8'
          : extra.size === 'sm'
            ? 'col-span-1 desktop:col-span-2'
            : 'col-span-2 desktop:col-span-4 cursor-pointer',
        title: extra.title || '',
      }
      return extraCard
    })
    return [...sorted, ...extraGridCards]
  }

  return sorted
})

type ExtraImg = string | { placeholder?: string; src: string }

function openCarouselPhotoLightbox(extra: ExtraCard, startIndex = 0) {
  if (!extra.images || extra.images.length === 0) return
  openPhotoLightbox(
    extra.images.map((img, i) => ({
      caption: extra.captions?.[i] || undefined,
      thumbnailUrl: toImgThumb(img),
      url: toImgUrl(img),
    })),
    { initialIndex: startIndex, title: extra.title || '' },
  )
}

function toImgThumb(img: ExtraImg): string {
  return typeof img === 'string' ? img : img.placeholder || img.src
}

function toImgUrl(img: ExtraImg): string {
  return typeof img === 'string' ? img : img.src
}

const handleCarouselClick = (card: GridCard, idx: number) => {
  if (card.isExtra && card.extraKey && card.extraIndex !== undefined) {
    const extra = extraCards.value[card.extraKey as FilterGroupId]?.[card.extraIndex]
    if (extra && extra.lightbox) {
      openCarouselPhotoLightbox(extra, idx)
    }
  }
}

const handleCardClick = (card: GridCard) => {
  if (card.isExtra && card.size === 'md' && card.extraKey && card.extraIndex !== undefined) {
    const extra = extraCards.value[card.extraKey as FilterGroupId]?.[card.extraIndex]
    if (extra) {
      if (extra.lightbox) {
        openCarouselPhotoLightbox(extra, 0)
      } else {
        openLightbox({
          description: extra.description || '',
          images:
            extra.images?.map((img) => ({ clearance: 'public' as const, url: toImgUrl(img) })) ||
            [],
          tags: extra.tags,
          title: extra.title || '',
          videos: extra.videos || [],
        })
      }
    }
  }
}
</script>
