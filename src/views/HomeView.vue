<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <AboutMe v-model:filter="activeFilter" :group-counts="groupCounts" />
    <div class="grid w-full grid-flow-row-dense grid-cols-12 gap-8 px-20">
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
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { type Component, computed, ref } from 'vue'

import DrawCardContent from '@/components/cards/DrawCardContent.vue'
import FoursightCardContent from '@/components/cards/FoursightCardContent.vue'
import MoviesCardContent from '@/components/cards/MoviesCardContent.vue'
import NowCardContent from '@/components/cards/NowCardContent.vue'
import SpotifyCardContainer from '@/components/cards/SpotifyCardContainer.vue'
import TravelCardContent from '@/components/cards/TravelCardContent.vue'
import WorkCardContent from '@/components/cards/WorkCardContent.vue'
import AboutMe from '@/components/home/AboutMe.vue'
import CardContainer from '@/components/home/CardContainer.vue'
import ContactForm from '@/components/home/ContactForm.vue'

import type { EmojiGroupId } from '@/types'

const activeFilter = ref<EmojiGroupId | null>(null)

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
    group: ['personal_finance', 'work'],
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

const filteredCards = computed(() => {
  if (!activeFilter.value) return cards

  const visible = cards.filter((card) => card.group.includes(activeFilter.value!))

  const sizeWeight = { lg: 3, md: 2, sm: 1 }

  return visible.sort((a, b) => sizeWeight[b.size] - sizeWeight[a.size])
})

const groupCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const card of cards) {
    for (const g of card.group) {
      counts[g] = (counts[g] || 0) + 1
    }
  }
  return counts
})
</script>

<style scoped>
@reference "@/style.css";
</style>
