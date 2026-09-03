import { type Component } from 'vue'

import DrawCardContent from '@/components/cards/DrawCardContent.vue'
import FoursightCardContent from '@/components/cards/FoursightCardContent.vue'
import MoviesCardContent from '@/components/cards/MoviesCardContent.vue'
import SpotifyCardContainer from '@/components/cards/SpotifyCardContainer.vue'
import TravelCardContent from '@/components/cards/TravelCardContent.vue'
import WorkCardContent from '@/components/cards/WorkCardContent.vue'
import WritingCardContent from '@/components/cards/WritingCardContent.vue'

import type { FilterGroupId } from '@/types'

export interface Card {
  arrow?: 'external' | 'help' | 'none' | 'right'
  bgClass?: string
  carousel?: boolean
  content?: Component
  group: FilterGroupId[]
  hero?: boolean
  id: string
  images?: Array<string | { placeholder?: string; src: string }>
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
    group: ['money'],
    hero: true,
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
    hero: true,
    id: 'work',
    size: 'lg',
    span: 'desktop:col-span-5 col-span-2',
    title: 'work & career',
  },
  {
    carousel: true,
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
    arrow: 'right',
    content: TravelCardContent,
    group: ['travel'],
    id: 'travel',
    link: '/travel',
    size: 'md',
    span: 'desktop:col-span-4 col-span-2',
    title: 'travel & photography',
  },
  {
    arrow: 'help',
    content: DrawCardContent,
    group: ['building'],
    id: 'guestbook',
    size: 'md',
    span: 'desktop:col-span-4 col-span-2',
    title: 'artwork by guests',
  },
  {
    arrow: 'right',
    content: WritingCardContent,
    group: ['life'],
    id: 'words',
    link: '/words',
    size: 'md',
    span: 'desktop:col-span-4 col-span-2',
    title: 'what have i been writing?',
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
    group: [],
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
    group: ['money'],
    id: 'pf',
    imageUrl: new URL('../assets/home/primer.webp', import.meta.url).href,
    link: 'https://links.psiderman.com/primer',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'personal finance',
  },
  {
    arrow: 'external',
    bgClass: 'bg-rose-200 dark:bg-rose-950',
    group: ['life'],
    id: 'blr',
    imageUrl: new URL('../assets/home/blr.webp', import.meta.url).href,
    link: 'https://links.psiderman.com/blr',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'blr maps',
  },
  {
    arrow: 'right',
    bgClass: 'bg-blue-900 dark:bg-blue-950',
    group: ['life'],
    id: 'resume',
    imageUrl: new URL('../assets/home/tattoo.webp', import.meta.url).href,
    link: '/gaming',
    size: 'sm',
    span: 'desktop:col-span-2 col-span-1',
    title: 'gaming',
  },
]

export interface CardIntro {
  body: string[]
  cover: string
  title: string
}

export const intros: Partial<Record<FilterGroupId, CardIntro>> = {
  building: {
    body: [
      '“i’m a builder at heart and have no qualms investing 5 hours making something that brings someone joy, even if for only 5 seconds.',
      'what the internet people call delight, i call whimsy. we’re very short on whimsy as a species.',
      'those 5 seconds separate us from the machines, and i want you to have those 5 seconds today at least once.”',
    ],
    cover: new URL('../assets/home/intro/building.webp', import.meta.url).href,
    title: 'the joy of building something, anything',
  },
  life: {
    body: [
      '“i’ve always wanted to have a website that’s more than just my design portfolio. a website that’s an extension of me, and not just my work self.',
      'i think i’ve landed on an iteration that’s here to stay. i hope you find all the little easter eggs i’ve left in here.',
      'if there is something that you’d like to see on here, let me know.”',
    ],
    cover: new URL('../assets/home/intro/life.webp', import.meta.url).href,
    title: 'welcome to the psider-verse',
  },
  music: {
    body: [
      '“in hindsight, picking up a guitar at 14 to impress a girl was my canon event. music has been a recurring part of my identity.',
      'since then, i’ve taught myself enough guitar and keys, that i make covers for fun on my daw.',
      'i grew up in the mp3 era so i’ve never made a mixtape but my playlists are close enough.”',
    ],
    cover: new URL('../assets/home/intro/music.webp', import.meta.url).href,
    title: 'to the beat',
  },
  money: {
    body: [
      '“somewhere along the way, i became the person who friends would come to for spreadsheets, budgeting, and investment questions. i found myself further down the rabbit hole, and i enjoyed it.',
      'the kind of person i am, inevitably, i tried to translate my obsession for managing your money into a product.',
      'foursight is that attempt.”',
    ],
    cover: new URL('../assets/home/intro/money.webp', import.meta.url).href,
    title: 'on personal finance',
  },
  travel: {
    body: [
      '“in 2023, i took my first international trip to hong kong. the same year, i took an open-ended break from work to travel.',
      'it took me two months of solo one-bagging in south-east asia to realize i like slow travel in short bursts.',
      'travel is now part of my identity, and i try to have one flight booked in the next 6 months.”',
    ],
    cover: new URL('../assets/home/intro/travel.webp', import.meta.url).href,
    title: 'psiderman: far from home',
  },
  work: {
    body: [
      '“my career has taken me through ed-tech, b2b saas, and fin-tech. i started out designing features, then systems, and eventually found myself designing products end-to-end.',
      'code always seemed aspirational. i don’t know about you, but today, llms make it easier to be all about the design engineering life. so i guess now i can professionally make rectangles <strong>and divs</strong>.”',
    ],
    cover: new URL('../assets/home/intro/work.webp', import.meta.url).href,
    title: 'professional rectangle maker',
  },
}
