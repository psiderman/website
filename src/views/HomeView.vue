<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <AboutMe v-model:filter="activeFilter" />
    <div class="grid w-full grid-flow-row-dense grid-cols-12 gap-8 px-20">
      <CardContainer
        v-for="card in filteredCards"
        :key="card.id"
        :class="card.span"
        :title="card.title"
        :arrow="card.arrow"
        :size="card.size"
      >
        <component :is="card.content" />
      </CardContainer>
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { type Component, computed, ref } from 'vue'

import FoursightCardContent from '@/components/cards/FoursightCardContent.vue'
import AboutMe from '@/components/home/AboutMe.vue'
import CardContainer from '@/components/home/CardContainer.vue'
import ContactForm from '@/components/home/ContactForm.vue'

import type { EmojiGroupId } from '@/types'

const activeFilter = ref<EmojiGroupId | null>(null)

interface Card {
  arrow?: 'external' | 'none' | 'right'
  content: Component
  group: EmojiGroupId[]
  id: string
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
    size: 'lg',
    span: 'col-span-7',
    title: 'https://foursight.money',
  },
  {
    group: ['work'],
    id: 'work',
    size: 'lg',
    span: 'col-span-5',
    title: 'work & career',
  },
  {
    group: ['life'],
    id: 'now',
    size: 'md',
    span: 'col-span-4',
    title: 'what am i doing now?',
  },
  {
    group: ['music', 'building', 'life'],
    id: 'music',
    size: 'md',
    span: 'col-span-4',
    title: 'what have i been listening to?',
  },
  {
    group: ['life', 'building'],
    id: 'movies',
    size: 'md',
    span: 'col-span-4',
    title: 'what have i been watching?',
  },
  {
    group: ['travel'],
    id: 'travel',
    size: 'lg',
    span: 'col-span-6',
    title: 'travel & photography',
  },
  {
    group: ['building'],
    id: 'owensans',
    size: 'sm',
    span: 'col-span-2',
    title: 'owen sans',
  },
  {
    group: ['music'],
    id: 'playlists',
    size: 'sm',
    span: 'col-span-2',
    title: 'playlists',
  },
  {
    group: ['building'],
    id: 'milestones',
    size: 'sm',
    span: 'col-span-2',
    title: 'milestones',
  },
  {
    group: ['personal_finance'],
    id: 'pf',
    size: 'sm',
    span: 'col-span-2',
    title: 'personal finance',
  },
  {
    arrow: 'none',
    group: ['building'],
    id: 'guestbook',
    size: 'md',
    span: 'col-span-4',
    title: 'art by the visitor before you',
  },
  {
    group: ['gaming', 'life'],
    id: 'gaming',
    size: 'sm',
    span: 'col-span-2',
    title: 'gaming',
  },
]

const filteredCards = computed(() => {
  if (!activeFilter.value) return cards

  const visible = cards.filter((card) => card.group.includes(activeFilter.value!))

  const sizeWeight = { lg: 3, md: 2, sm: 1 }

  return visible.sort((a, b) => sizeWeight[b.size] - sizeWeight[a.size])
})
</script>

<style scoped>
@reference "@/style.css";
</style>
