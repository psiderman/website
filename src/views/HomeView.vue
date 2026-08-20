<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <AboutMe v-model:filter="activeFilter" />
    <div class="grid w-full grid-cols-12 gap-8 px-20">
      <CardContainer
        v-for="card in filteredCards"
        :key="card.id"
        :class="card.span"
        :title="card.title"
        :arrow="card.arrow"
        :size="card.size"
      />
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import AboutMe from '@/components/home/AboutMe.vue'
import CardContainer from '@/components/home/CardContainer.vue'
import ContactForm from '@/components/home/ContactForm.vue'

import type { EmojiGroupId } from '@/types'

const activeFilter = ref<EmojiGroupId | null>(null)

interface Card {
  arrow?: 'external' | 'none' | 'right'
  group: EmojiGroupId[]
  id: string
  size: 'lg' | 'md' | 'sm'
  span: string
  title: string
}

const cards: Card[] = [
  {
    arrow: 'external',
    group: ['personal_finance', 'work', 'building'],
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
    group: ['music', 'building'],
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
    group: ['travel', 'life'],
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
  return cards.filter((card) => card.group.includes(activeFilter.value!))
})
</script>

<style scoped>
@reference "@/style.css";
</style>
