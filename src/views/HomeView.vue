<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <!-- About me -->
    <div
      data-sync="about-me"
      class="desktop:p-20 desktop:flex-row flex w-full flex-col items-center justify-center gap-8 p-6"
    >
      <img
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
          <p>@psiderman</p>
          <h1 class="text-display text-text-primary -mt-2">hi, i’m karan</h1>
          <p class="text-ui">
            i’m still searching for a one-liner to sum me up.
            <br class="desktop:block hidden" />
            until then my life is a bento box of endless interests,
            <br class="desktop:block hidden" />
            neatly packed for display on my ever-evolving personal website.
          </p>
        </div>
      </div>
    </div>
    <!-- Grid -->
    <div
      class="desktop:px-20 desktop:grid-cols-12 relative grid w-full grid-flow-row-dense grid-cols-2 gap-8 px-4"
    >
      <!-- Filters -->
      <div
        class="desktop:h-0 desktop:-mt-5 desktop:col-span-12 col-span-2 flex flex-wrap justify-center gap-1"
      >
        <button
          v-for="emj in emojis"
          :key="emj.id"
          v-tooltip="{ group: 'filter', placement: 'top', content: emj.label }"
          :aria-label="emj.label"
          class="emoji-filter group"
          :class="{
            default: !activeFilter,
            active: activeFilter === emj.id,
            inactive: activeFilter && activeFilter !== emj.id,
          }"
          @click="activeFilter = activeFilter === emj.id ? null : emj.id"
        >
          <span class="text-center">
            {{ emj.emoji }}
          </span>
        </button>
      </div>
      <!-- Description Card -->
      <div
        v-if="activeFilter && activeDescription.id"
        class="border-border-primary bg-surface-primary desktop:col-span-4 pointer-events-auto col-span-2 row-span-3 flex h-124 flex-col gap-2 rounded-xl border p-2 transition-colors duration-200"
      >
        <div class="aspect-video">
          <img
            :src="getImageUrl(activeDescription.id)"
            class="border-border-primary h-full w-full rounded-lg border object-cover"
            :alt="activeDescription.id"
            width="800"
            height="450"
          />
        </div>
        <div
          class="text-p text-text-secondary flex h-full w-full flex-col gap-5 overflow-scroll italic"
        >
          <p class="text-text-primary -mb-1 font-semibold" v-html="activeDescription.title"></p>
          <p v-for="(p, i) in activeDescription.content" :key="i" v-html="p"></p>
        </div>
      </div>
      <!-- All Cards -->
      <CardContainer
        v-for="card in filteredCards"
        :key="card.id"
        v-slot="{ isIconHovered }"
        :class="card.span"
        :title="card.title"
        :arrow="card.arrow"
        :size="card.size"
        :bg-class="card.bgClass"
        :img="card.isExtra && card.size === 'md' ? undefined : card.imageUrl"
        :link="card.link"
        @click="handleCardClick(card)"
      >
        <component :is="card.content" v-if="card.content" :show-help="isIconHovered" />
        <template v-else-if="card.isExtra && card.size === 'md'">
          <video
            v-if="card.coverVid"
            :src="card.coverVid"
            class="pointer-events-none h-full w-full object-cover"
            :autoplay="!prefersReducedMotion"
            :loop="!prefersReducedMotion"
            muted
            playsinline
          />
          <img
            v-else-if="card.imageUrl"
            :src="card.imageUrl"
            class="pointer-events-none h-full w-full object-cover"
            :alt="card.title"
          />
        </template>
      </CardContainer>
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

import CardContainer from '@/components/home/CardContainer.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import { isLightBoxOpen, lightBoxData } from '@/composables/useGlobal'
import { type ExtraCard, extraCards as staticExtraCards } from '@/data/extraCards'
import { type Card, cards as staticCards } from '@/data/homeCards'
import { EMOJI_GROUPS } from '@/types'

import type { EmojiGroupId } from '@/types'

// Convert extraCards to reactive ref
const extraCards = ref<Partial<Record<EmojiGroupId, ExtraCard[]>>>(staticExtraCards)

const emojis = EMOJI_GROUPS

const route = useRoute()
const router = useRouter()

const activeFilter = computed<EmojiGroupId | null>({
  get: () => (route.query.filter as EmojiGroupId) || null,
  set: (val) => {
    router.replace({
      query: {
        ...route.query,
        filter: val || undefined,
      },
    })
  },
})

import { descriptionContent } from '@/data/homeDescriptions'

const activeDescription = computed(() => {
  if (activeFilter.value) return descriptionContent.filter((a) => a.id === activeFilter.value)[0]
  else
    return {
      content: null,
      id: null,
    }
})

const getImageUrl = (id: string) => {
  return new URL(`../data/descriptions/${id}.webp`, import.meta.url).href
}

// Watch global lightbox state is no longer needed to reset isOpen

// Extended interface of Card that includes extra card properties
interface GridCard extends Card {
  coverVid?: string
  extraIndex?: number
  extraKey?: string
  isExtra?: boolean
}

const filteredCards = computed<GridCard[]>(() => {
  if (!activeFilter.value) return staticCards

  const visible = staticCards.filter((card) => card.group.includes(activeFilter.value!))

  const sizeWeight = { lg: 3, md: 2, sm: 1 }

  let sorted = visible.sort((a, b) => sizeWeight[b.size] - sizeWeight[a.size])

  if (sorted.length === 1) {
    sorted = [{ ...sorted[0], span: 'col-span-2 desktop:col-span-8' }]
  }

  // Filter extra cards for the active filter
  const matchingExtras = extraCards.value[activeFilter.value]

  if (matchingExtras && matchingExtras.length > 0) {
    const extraGridCards = matchingExtras.map((extra, idx) => {
      const extraCard: GridCard = {
        arrow:
          extra.size === 'sm' ? 'external' : extra.title && extra.description ? 'right' : 'none',
        bgClass: extra.bgClass,
        coverVid: extra.coverVid,
        extraIndex: idx,
        extraKey: activeFilter.value!,
        group: [activeFilter.value!],
        id: `extra_${activeFilter.value}_${idx}`,
        imageUrl:
          extra.cover || (extra.images && extra.images.length > 0 ? extra.images[0] : undefined),
        isExtra: true,
        link: extra.link,
        size: extra.size || 'sm',
        span:
          extra.size === 'sm'
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

const handleCardClick = (card: GridCard) => {
  if (card.isExtra && card.size === 'md' && card.extraKey && card.extraIndex !== undefined) {
    const extra = extraCards.value[card.extraKey as EmojiGroupId]?.[card.extraIndex]
    if (extra) {
      lightBoxData.value = {
        description: extra.description || '',
        images: extra.images || [],
        tags: extra.tags,
        title: extra.title || '',
        videos: extra.videos || [],
      }
      isLightBoxOpen.value = true
    }
  }
}
</script>

<style scoped>
@reference "@/style.css";
.emoji-filter {
  @apply bg-background text-ui relative flex size-12 cursor-pointer items-center justify-center rounded-full bg-linear-0 transition-colors duration-200 ease-in-out;

  & span {
    @apply flex w-4.25 items-center justify-center text-center leading-none;
  }

  &.default {
    @apply hover:from-hover hover:to-hover active:from-press active:to-press group-hover:opacity-100;
  }

  &.active {
    @apply hover:from-hover-inverted hover:to-hover-inverted active:from-press-inverted active:to-press-inverted;
  }

  &.inactive {
    @apply hover:from-hover hover:to-hover active:from-press active:to-press;

    span {
      @apply opacity-30 mix-blend-luminosity;
    }

    &:hover span {
      @apply opacity-75;
    }

    &:active span {
      @apply opacity-100 mix-blend-normal;
    }
  }
}
</style>
