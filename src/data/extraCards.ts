import { getStorageUrl } from '@/supabase'

import type { LightBoxTag } from '@/components/LightBox.vue'
import type { FilterGroupId } from '@/types'

export interface ExtraCard {
  bgClass?: string
  captions?: string[]
  carousel?: boolean
  cover?: string
  coverVid?: string
  description?: string
  hero?: boolean
  images?: Array<string | { placeholder: string; src: string }>
  lightbox?: boolean
  link?: string
  size: 'md' | 'sm'
  subtitle?: string
  tags?: LightBoxTag[]
  title: string
  videos?: string[]
}

export const extraCards: Partial<Record<FilterGroupId, ExtraCard[]>> = {
  music: [
    {
      size: 'md',
      title: 'covers from 2019',
    },
    {
      bgClass: 'bg-[#1ED760] dark:bg-linear-0 from-dark/50 to-dark/50',
      cover: new URL('../assets/home/spotify.webp', import.meta.url).href,
      link: 'https://links.psiderman.com/playlists',
      size: 'sm',
      title: 'playlists',
    },
  ],
  personal_finance: [
    {
      bgClass: 'bg-orange-500',
      cover: new URL('@/assets/logos/foursight.webp', import.meta.url).href,
      link: 'https://cal.com/foursight.money/onboarding-call',
      size: 'sm',
      title: 'talk foursight?',
    },
  ],
  travel: [
    {
      captions: [
        'tour eiffel',
        'blvd des italiens',
        'pont st. louis',
        'grande galerie',
        'galerie des batailles',
        'devant la statue du bailli de suffren',
        'j’ai essayé',
        'le cheval a bougé',
      ],
      carousel: true,
      images: Array.from({ length: 8 }, (_, i) => ({
        placeholder: getStorageUrl('webp', 'thumbs', 'dad_paris', `${i + 1}.webp`),
        src: getStorageUrl('webp', 'dad_paris', `${i + 1}.webp`),
      })),
      lightbox: true,
      size: 'md',
      title: 'dad in paris (25 yrs later)',
    },
    {
      captions: [
        'dotonbori, osaka, fujifilm ace',
        'tamagawa, osaka, fujifilm ace',
        'amerikamura, osaka, fujifilm ace',
        'hogwarts, fujifilm ace',
        'dotonbori, osaka, fujifilm ace',
        'ginkaku-ji, kyoto, fujifilm ace',
        'maruyama, kyoto, fujifilm ace',
        'back from otagi nenbutsu-ji, kyoto, fujifilm ace',
        'gion, kyoto, fujifilm ace',
        'kenrokuen, kanazawa, fujifilm ace',
        'kawaguchiko, mt.fuji, fujifilm ace',
        'fuji-q, mt. fuji, fujifilm ace',
        'tokyo ramen street, tokyo, fujifilm ace',
        'arakurayama sengen park, mt.fuji, fujifilm ace',
        'roppong, tokyo, fujifilm ace',
      ],
      carousel: true,
      images: Array.from({ length: 15 }, (_, i) => ({
        placeholder: getStorageUrl('webp', 'thumbs', 'japan_film', `${i + 1}.webp`),
        src: getStorageUrl('webp', 'japan_film', `${i + 1}.webp`),
      })),
      lightbox: true,
      size: 'md',
      title: 'japan on film',
    },
    {
      captions: [
        'camlica hill, istanbul',
        'budapest',
        'st. stephen’s basilica, budapest',
        'camlica hill, istanbul',
        'eminonu, istanbul',
        'elisabeth bridge, budapest',
        'moda park, istanbul',
        'central market hall, budapest',
        'fener, istanbul',
        'astoria, budapest',
        'gellert hill, budapest',
        'inner city, budapest',
      ],
      carousel: true,
      images: Array.from({ length: 12 }, (_, i) => ({
        placeholder: getStorageUrl('webp', 'thumbs', 'ist_bud', `${i + 1}.webp`),
        src: getStorageUrl('webp', 'ist_bud', `${i + 1}.webp`),
      })),
      lightbox: true,
      size: 'md',
      title: 'olympus superzoom 80g + kodak ultramax 400',
    },
  ],
  work: [
    {
      cover: getStorageUrl('webp', 'work/dweb/00.webp'),
      description:
        'Dezerv paid a multi-crore license every year for a third-party desktop tool built for the average wealth manager. I replaced it with a desktop experience built on Dezerv’s own design language — shipped after I left, and now used by clients and RMs both.',
      images: [
        getStorageUrl('webp', 'work/dweb/01.webp'),
        getStorageUrl('webp', 'work/dweb/02.webp'),
        getStorageUrl('webp', 'work/dweb/03.webp'),
      ],
      size: 'md',
      tags: [
        { value: 'Figma' },
        { value: 'Client Engagement Pod' },
        { link: 'https://links.psiderman.com/dezerv-web-case-study', value: 'Case Study' },
      ],
      title: 'Dezerv Web',
    },
    {
      cover: getStorageUrl('webp', 'work/prspr/00.webp'),
      description:
        'Four products, three-plus codebases, two color schemes, zero shared vocabulary. I rebuilt Dezerv’s design foundations from the ground up — one token system, one typography scale, one icon system — and the plugin pipeline that kept it in sync with engineering.',
      images: [
        getStorageUrl('webp', 'work/prspr/01.webp'),
        getStorageUrl('webp', 'work/prspr/02.webp'),
        getStorageUrl('webp', 'work/prspr/03.webp'),
        getStorageUrl('webp', 'work/prspr/04.webp'),
      ],
      size: 'md',
      tags: [
        { value: 'Figma' },
        { value: 'Design Team' },
        { link: 'https://links.psiderman.com/prosper-case-study', value: 'Essay' },
      ],
      title: 'Prosper',
    },
    {
      cover: getStorageUrl('webp', 'work/qtcs/00.webp'),
      description:
        'At the time of writing this, there are sixteen ways to ask a question on Quizizz. Between 2021 and 2023, we added 12 new question types, of which I designed 9, and led the designs for 3 more.',
      images: [
        getStorageUrl('webp', 'work/qtcs/01.webp'),
        getStorageUrl('webp', 'work/qtcs/02.webp'),
        getStorageUrl('webp', 'work/qtcs/03.webp'),
        getStorageUrl('webp', 'work/qtcs/04.webp'),
      ],
      size: 'md',
      tags: [
        { value: 'Figma' },
        { value: 'Content Platform Team' },
        { link: 'https://links.psiderman.com/question-type-case-study', value: 'Case Study' },
      ],
      title: 'Question Types',
    },
    {
      cover: getStorageUrl('webp', 'work/ds/00.webp'),
      description:
        'I created and maintained three iterations of the design system in Figma+Code to be used by 16 designers and 50+ engineers.',
      images: [
        getStorageUrl('webp', 'work/ds/01.webp'),
        getStorageUrl('webp', 'work/ds/02.webp'),
        getStorageUrl('webp', 'work/ds/03.webp'),
      ],
      size: 'md',
      tags: [
        { value: 'Figma' },
        { value: 'Design Team' },
        { link: 'https://links.psiderman.com/design-system-case-study', value: 'Case Study' },
      ],
      title: 'Chalkboard',
    },
    {
      cover: getStorageUrl('webp', 'work/lessons/01.webp'),
      description:
        'Two designers and a handful of engineers launched this product in under a month or two.',
      images: [
        getStorageUrl('webp', 'work/lessons/02.webp'),
        getStorageUrl('webp', 'work/lessons/03.webp'),
        getStorageUrl('webp', 'work/lessons/04.gif'),
      ],
      size: 'md',
      tags: [
        { value: 'Figma' },
        { value: '0 → 1' },
        {
          link: 'https://psiderman.notion.site/Lessons-7b2a0681aa7f4cb9b6e675923ada9608',
          value: 'Essay',
        },
      ],
      title: 'Lessons',
      videos: [getStorageUrl('mp4', 'lesson_promo.mp4')],
    },
    {
      coverVid: getStorageUrl('mp4', 'button.mp4'),
      size: 'md',
      title: 'Skeuomorphic Button',
      videos: [getStorageUrl('mp4', 'button.mp4')],
    },
    {
      coverVid: getStorageUrl('mp4', 'calc.mp4'),
      size: 'md',
      title: 'Math Input',
      videos: [getStorageUrl('mp4', 'calc.mp4')],
    },
    {
      coverVid: getStorageUrl('mp4', 'owensans.mp4'),
      size: 'md',
      title: 'Owen Sans',
      videos: [getStorageUrl('mp4', 'owensans.mp4')],
    },
    {
      coverVid: getStorageUrl('mp4', 'graphing.mp4'),
      size: 'md',
      title: 'Graphing In-Product Education',
      videos: [getStorageUrl('mp4', 'graphing.mp4')],
    },
    {
      coverVid: getStorageUrl('mp4', 'kiwi.mp4'),
      size: 'md',
      title: 'Kiwi Personal Finance',
      videos: [getStorageUrl('mp4', 'kiwi.mp4')],
    },
    {
      cover: getStorageUrl('webp', 'work/shots/cmd.webp'),
      images: [getStorageUrl('webp', 'work/shots/cmd.webp')],
      size: 'md',
      title: 'Cmd F*ck off Laptop Stickers',
    },
    {
      coverVid: getStorageUrl('mp4', 'psiderman.com.mp4'),
      size: 'md',
      title: 'Old Portfolio',
      videos: [getStorageUrl('mp4', 'psiderman.com.mp4')],
    },
  ],
}
