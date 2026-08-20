<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <AboutMe />
    <div class="grid w-full grid-cols-12 gap-8 px-20">
      <CardContainer
        v-for="card in cards"
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
import AboutMe from '@/components/home/AboutMe.vue'
import CardContainer from '@/components/home/CardContainer.vue'
import ContactForm from '@/components/home/ContactForm.vue'

import type { EmojiGroupId } from '@/types'

interface Card {
  arrow?: 'external' | 'none' | 'right'
  group?: EmojiGroupId
  id: string
  size: 'lg' | 'md' | 'sm'
  span: string
  title: string
}

const cards: Card[] = [
  {
    arrow: 'external',
    id: 'foursight',
    size: 'lg',
    span: 'col-span-7',
    title: 'https://foursight.money',
  },
  {
    id: 'work',
    size: 'lg',
    span: 'col-span-5',
    title: 'work & career',
  },
  {
    id: 'now',
    size: 'md',
    span: 'col-span-4',
    title: 'what am i doing now?',
  },
  {
    id: 'music',
    size: 'md',
    span: 'col-span-4',
    title: 'what have i been listening to?',
  },
  {
    id: 'movies',
    size: 'md',
    span: 'col-span-4',
    title: 'what have i been watching?',
  },
  {
    id: 'travel',
    size: 'lg',
    span: 'col-span-6',
    title: 'travel & photography',
  },
  {
    id: 'owensans',
    size: 'sm',
    span: 'col-span-2',
    title: 'owen sans',
  },
  {
    id: 'playlists',
    size: 'sm',
    span: 'col-span-2',
    title: 'playlists',
  },
  {
    id: 'milestones',
    size: 'sm',
    span: 'col-span-2',
    title: 'milestones',
  },
  {
    id: 'pf',
    size: 'sm',
    span: 'col-span-2',
    title: 'personal finance',
  },
  {
    arrow: 'none',
    id: 'guestbook',
    size: 'md',
    span: 'col-span-4',
    title: 'art by the visitor before you',
  },
  {
    id: 'gaming',
    size: 'sm',
    span: 'col-span-2',
    title: 'gaming',
  },
]
</script>

<style>
@reference "@/style.css";
</style>
