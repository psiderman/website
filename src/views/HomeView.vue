<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <!-- About me -->
    <div data-sync="about-me" class="flex w-full flex-row items-center justify-center gap-8 p-20">
      <img
        src="@/assets/images/public.webp"
        alt="karan sanas"
        class="border-border-primary aspect-auto h-50 rounded-[4.16rem] border"
      />
      <div class="flex w-120 flex-col items-start justify-center gap-4">
        <div class="text-ui text-text-secondary flex flex-col gap-2">
          <p>@psiderman</p>
          <h1 class="text-display text-text-primary -mt-2">hi, i'm karan</h1>
          <p class="text-p italic">
            “i’m still searching for a one-liner to sum me up.<br />until then my life is a bento
            box of endless interests,<br />neatly packed for display on my ever-evolving personal
            website.”
          </p>
        </div>
      </div>
    </div>
    <!-- Grid -->
    <div class="relative grid w-full grid-flow-row-dense grid-cols-12 gap-8 px-20">
      <!-- Filters -->
      <div class="col-span-12 -mt-5 flex h-0 flex-row justify-center gap-1">
        <button
          v-for="emj in emojis"
          :key="emj.id"
          v-tooltip="{ group: 'filter', placement: 'top', content: emj.label }"
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
        class="border-border-primary bg-surface-primary pointer-events-auto col-span-4 row-span-3 flex h-124 flex-col gap-2 rounded-xl border p-2 transition-colors duration-200"
      >
        <div class="aspect-video">
          <img
            :src="getImageUrl(activeDescription.id)"
            class="border-border-primary h-full w-full rounded-lg border object-cover"
            :alt="activeDescription.id"
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
        :img="card.imageUrl"
        :link="card.link"
      >
        <component :is="card.content" v-if="card.content" :show-help="isIconHovered" />
      </CardContainer>

      <!-- <div class="absolute top-0 left-0 h-full w-fit pl-2" style="left: calc(-50vw + 50%)"> -->
      <!-- <div class="sticky top-21 flex flex-col justify-start gap-4"> -->

      <!-- </div> -->
      <!-- </div> -->
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DrawCardContent from '@/components/cards/DrawCardContent.vue'
import FoursightCardContent from '@/components/cards/FoursightCardContent.vue'
import MoviesCardContent from '@/components/cards/MoviesCardContent.vue'
import NowCardContent from '@/components/cards/NowCardContent.vue'
import SpotifyCardContainer from '@/components/cards/SpotifyCardContainer.vue'
import TravelCardContent from '@/components/cards/TravelCardContent.vue'
import WorkCardContent from '@/components/cards/WorkCardContent.vue'
import CardContainer from '@/components/home/CardContainer.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import { EMOJI_GROUPS } from '@/types'

import type { EmojiGroupId } from '@/types'

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

interface Card {
  arrow?: 'external' | 'help' | 'none' | 'right'
  bgClass?: string
  content?: Component
  group: EmojiGroupId[]
  id: string
  imageUrl?: string
  link?: string
  size: 'lg' | 'md' | 'sm'
  span: string
  title: string
}

const cards: Card[] = [
  {
    arrow: 'external',
    content: FoursightCardContent,
    group: ['personal_finance'],
    id: 'foursight',
    link: 'https://foursight.money/about',
    size: 'lg',
    span: 'col-span-7',
    title: 'https://foursight.money',
  },
  {
    content: WorkCardContent,
    group: ['work'],
    id: 'work',
    size: 'lg',
    span: 'col-span-5',
    title: 'work & career',
  },
  {
    content: NowCardContent,
    group: ['life'],
    id: 'now',
    link: '/now',
    size: 'md',
    span: 'col-span-4',
    title: 'what am i doing now?',
  },
  {
    arrow: 'none',
    content: SpotifyCardContainer,
    group: ['music', 'building', 'life'],
    id: 'music',
    size: 'md',
    span: 'col-span-4',
    title: 'what have i been listening to?',
  },
  {
    arrow: 'external',
    content: MoviesCardContent,
    group: ['life', 'building'],
    id: 'movies',
    link: 'https://letterboxd.com/_psiderman_/',
    size: 'md',
    span: 'col-span-4',
    title: 'what have i been watching?',
  },
  {
    arrow: 'none',
    content: TravelCardContent,
    group: ['travel'],
    id: 'travel',
    size: 'lg',
    span: 'col-span-6',
    title: 'travel & photography',
  },
  {
    arrow: 'external',
    bgClass: 'bg-amber-200 dark:bg-dark',
    group: ['building'],
    id: 'owensans',
    imageUrl: new URL('@/assets/images/owensans.webp', import.meta.url).toString(),
    link: 'https://owensans.vercel.app',
    size: 'sm',
    span: 'col-span-2',
    title: 'owen sans',
  },
  {
    arrow: 'external',
    bgClass: 'bg-[#1ED760] dark:bg-linear-0 from-dark/50 to-dark/50',
    group: ['music'],
    id: 'playlists',
    imageUrl: new URL('@/assets/images/spotify.webp', import.meta.url).toString(),
    link: 'https://links.psiderman.com/playlists',
    size: 'sm',
    span: 'col-span-2',
    title: 'playlists',
  },
  {
    arrow: 'external',
    bgClass: 'bg-orange-200 dark:bg-amber-950',
    group: ['building'],
    id: 'milestones',
    imageUrl: new URL('@/assets/images/milestones.webp', import.meta.url).toString(),
    link: 'https://milestones.psiderman.com',
    size: 'sm',
    span: 'col-span-2',
    title: 'milestones',
  },
  {
    arrow: 'external',
    bgClass: 'bg-emerald-900 dark:bg-emerald-950',
    group: ['personal_finance'],
    id: 'pf',
    imageUrl: new URL('@/assets/images/primer.webp', import.meta.url).toString(),
    link: 'https://links.psiderman.com/primer',
    size: 'sm',
    span: 'col-span-2',
    title: 'personal finance',
  },
  {
    arrow: 'help',
    content: DrawCardContent,
    group: ['building'],
    id: 'guestbook',
    size: 'md',
    span: 'col-span-4',
    title: 'art by the visitor before you',
  },
  {
    arrow: 'external',
    bgClass: 'bg-rose-200 dark:bg-rose-950',
    group: ['travel', 'life'],
    id: 'blr',
    imageUrl: new URL('@/assets/images/blr.webp', import.meta.url).toString(),
    link: 'https://links.psiderman.com/blr',
    size: 'sm',
    span: 'col-span-2',
    title: 'blr maps',
  },
]
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

const filteredCards = computed(() => {
  if (!activeFilter.value) return cards

  const visible = cards.filter((card) => card.group.includes(activeFilter.value!))

  const sizeWeight = { lg: 3, md: 2, sm: 1 }

  const sorted = visible.sort((a, b) => sizeWeight[b.size] - sizeWeight[a.size])

  if (sorted.length === 1) {
    return [{ ...sorted[0], span: 'col-span-8' }]
  }

  return sorted
})
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
