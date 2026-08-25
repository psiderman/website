import { type Component } from 'vue'

import DrawCardContent from '@/components/cards/DrawCardContent.vue'
import FoursightCardContent from '@/components/cards/FoursightCardContent.vue'
import MoviesCardContent from '@/components/cards/MoviesCardContent.vue'
import NowCardContent from '@/components/cards/NowCardContent.vue'
import SpotifyCardContainer from '@/components/cards/SpotifyCardContainer.vue'
import TravelCardContent from '@/components/cards/TravelCardContent.vue'
import WorkCardContent from '@/components/cards/WorkCardContent.vue'

import type { EmojiGroupId } from '@/types'

export interface Card {
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

export const cards: Card[] = [
  {
    arrow: 'external',
    content: FoursightCardContent,
    group: ['personal_finance'],
    id: 'foursight',
    link: 'https://foursight.money/about',
    size: 'lg',
    span: 'desktop:col-span-7 col-span-2',
    title: 'https://foursight.money',
  },
  {
    arrow: 'none',
    content: WorkCardContent,
    group: ['work'],
    id: 'work',
    size: 'lg',
    span: 'desktop:col-span-5 col-span-2',
    title: 'work & career',
  },
  {
    content: NowCardContent,
    group: ['life'],
    id: 'now',
    link: '/now',
    size: 'md',
    span: 'desktop:col-span-4 col-span-2',
    title: 'what am i doing now?',
  },
  {
    arrow: 'none',
    content: SpotifyCardContainer,
    group: ['music', 'building', 'life'],
    id: 'music',
    size: 'md',
    span: 'desktop:col-span-4 col-span-2',
    title: 'what have i been listening to?',
  },
  {
    arrow: 'external',
    content: MoviesCardContent,
    group: ['life', 'building'],
    id: 'movies',
    link: 'https://letterboxd.com/_psiderman_/',
    size: 'md',
    span: 'desktop:col-span-4 col-span-2',
    title: 'what have i been watching?',
  },
  {
    arrow: 'none',
    content: TravelCardContent,
    group: ['travel'],
    id: 'travel',
    link: '/travel',
    size: 'lg',
    span: 'desktop:col-span-6 col-span-2',
    title: 'travel & photography',
  },
  {
    arrow: 'external',
    bgClass: 'bg-amber-200 dark:bg-dark',
    group: ['building'],
    id: 'owensans',
    imageUrl: new URL('../assets/home/owensans.webp', import.meta.url).href,
    link: 'https://owensans.vercel.app',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'owen sans',
  },
  {
    arrow: 'external',
    bgClass: 'bg-[#1ED760] dark:bg-linear-0 from-dark/50 to-dark/50',
    group: ['music'],
    id: 'playlists',
    imageUrl: new URL('../assets/home/spotify.webp', import.meta.url).href,
    link: 'https://links.psiderman.com/playlists',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'playlists',
  },
  {
    arrow: 'external',
    bgClass: 'bg-orange-200 dark:bg-amber-950',
    group: ['building'],
    id: 'milestones',
    imageUrl: new URL('../assets/home/milestones.webp', import.meta.url).href,
    link: 'https://milestones.psiderman.com',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'milestones',
  },
  {
    arrow: 'external',
    bgClass: 'bg-emerald-900 dark:bg-emerald-950',
    group: ['personal_finance'],
    id: 'pf',
    imageUrl: new URL('../assets/home/primer.webp', import.meta.url).href,
    link: 'https://links.psiderman.com/primer',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'personal finance',
  },
  {
    arrow: 'help',
    content: DrawCardContent,
    group: ['building'],
    id: 'guestbook',
    size: 'md',
    span: 'desktop:col-span-4 col-span-2',
    title: 'art by the visitor before you',
  },
  {
    arrow: 'external',
    bgClass: 'bg-rose-200 dark:bg-rose-950',
    group: ['travel', 'life'],
    id: 'blr',
    imageUrl: new URL('../assets/home/blr.webp', import.meta.url).href,
    link: 'https://links.psiderman.com/blr',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'blr maps',
  },
]
