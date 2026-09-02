import { getStorageUrl } from '@/supabase'

import type { LightBoxTag } from '@/components/LightBox.vue'
import type { FilterGroupId } from '@/types'

export interface ExtraCard {
  bgClass?: string
  carousel?: boolean
  cover?: string
  coverVid?: string
  description?: string
  images?: string[]
  lightbox?: boolean
  link?: string
  size: 'md' | 'sm'
  subtitle?: string
  tags?: LightBoxTag[]
  title: string
  videos?: string[]
}

export const extraCards: Partial<Record<FilterGroupId, ExtraCard[]>> = {
  // life: [
  //   {
  //     carousel: true,
  //     images: [
  //       new URL('@/assets/gaming/arkham.webp', import.meta.url).href,
  //       new URL('@/assets/gaming/budokai.webp', import.meta.url).href,
  //       new URL('@/assets/gaming/hitman3.webp', import.meta.url).href,
  //       new URL('@/assets/gaming/lis.webp', import.meta.url).href,
  //       new URL('@/assets/gaming/spiderman.webp', import.meta.url).href,
  //       new URL('@/assets/gaming/valo.webp', import.meta.url).href,
  //     ],
  //     size: 'md',
  //     title: 'favorite',
  //   },
  // ],
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
      carousel: true,
      images: Array.from({ length: 8 }, (_, i) =>
        getStorageUrl('webp', 'dad_paris', `${i + 1}.webp`),
      ),
      lightbox: true,
      size: 'md',
      title: 'dad in paris (25 yrs later)',
    },
    {
      carousel: true,
      images: Array.from({ length: 15 }, (_, i) =>
        getStorageUrl('webp', 'japan_film', `${i + 1}.webp`),
      ),
      lightbox: true,
      size: 'md',
      title: 'japan on film',
    },
  ],
  work: [
    {
      cover: new URL('../assets/work/dweb/00.webp', import.meta.url).href,
      description:
        'Dezerv paid a multi-crore license every year for a third-party desktop tool built for the average wealth manager. I replaced it with a desktop experience built on Dezerv’s own design language — shipped after I left, and now used by clients and RMs both.',
      images: [
        new URL('../assets/work/dweb/01.webp', import.meta.url).href,
        new URL('../assets/work/dweb/02.webp', import.meta.url).href,
        new URL('../assets/work/dweb/03.webp', import.meta.url).href,
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
      cover: new URL('../assets/work/prspr/00.webp', import.meta.url).href,
      description:
        'Four products, three-plus codebases, two color schemes, zero shared vocabulary. I rebuilt Dezerv’s design foundations from the ground up — one token system, one typography scale, one icon system — and the plugin pipeline that kept it in sync with engineering.',
      images: [
        new URL('../assets/work/prspr/01.webp', import.meta.url).href,
        new URL('../assets/work/prspr/02.webp', import.meta.url).href,
        new URL('../assets/work/prspr/03.webp', import.meta.url).href,
        new URL('../assets/work/prspr/04.webp', import.meta.url).href,
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
      cover: new URL('../assets/work/qtcs/00.webp', import.meta.url).href,
      description:
        'At the time of writing this, there are sixteen ways to ask a question on Quizizz. Between 2021 and 2023, we added 12 new question types, of which I designed 9, and led the designs for 3 more.',
      images: [
        new URL('../assets/work/qtcs/01.webp', import.meta.url).href,
        new URL('../assets/work/qtcs/02.webp', import.meta.url).href,
        new URL('../assets/work/qtcs/03.webp', import.meta.url).href,
        new URL('../assets/work/qtcs/04.webp', import.meta.url).href,
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
      cover: new URL('../assets/work/ds/00.webp', import.meta.url).href,
      description:
        'I created and maintained three iterations of the design system in Figma+Code to be used by 16 designers and 50+ engineers.',
      images: [
        new URL('../assets/work/ds/01.webp', import.meta.url).href,
        new URL('../assets/work/ds/02.webp', import.meta.url).href,
        new URL('../assets/work/ds/03.webp', import.meta.url).href,
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
      cover: new URL('../assets/work/lessons/01.webp', import.meta.url).href,
      description:
        'Two designers and a handful of engineers launched this product in under a month or two.',
      images: [
        new URL('../assets/work/lessons/02.webp', import.meta.url).href,
        new URL('../assets/work/lessons/03.webp', import.meta.url).href,
        new URL('../assets/work/lessons/04.gif', import.meta.url).href,
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
      coverVid: new URL('../assets/work/shots/button.mp4', import.meta.url).href,
      size: 'md',
      title: 'Skeuomorphic Button',
      videos: [new URL('../assets/work/shots/button.mp4', import.meta.url).href],
    },
    {
      coverVid: new URL('../assets/work/shots/calc.mp4', import.meta.url).href,
      size: 'md',
      title: 'Math Input',
      videos: [new URL('../assets/work/shots/calc.mp4', import.meta.url).href],
    },
    {
      coverVid: new URL('../assets/work/shots/owensans.mp4', import.meta.url).href,
      size: 'md',
      title: 'Owen Sans',
      videos: [new URL('../assets/work/shots/owensans.mp4', import.meta.url).href],
    },
    {
      coverVid: new URL('../assets/work/shots/graphing.mp4', import.meta.url).href,
      size: 'md',
      title: 'Graphing In-Product Education',
      videos: [new URL('../assets/work/shots/graphing.mp4', import.meta.url).href],
    },
    {
      coverVid: new URL('../assets/work/shots/kiwi.mp4', import.meta.url).href,
      size: 'md',
      title: 'Kiwi Personal Finance',
      videos: [new URL('../assets/work/shots/kiwi.mp4', import.meta.url).href],
    },
    {
      cover: new URL('../assets/work/shots/cmd.webp', import.meta.url).href,
      images: [new URL('../assets/work/shots/cmd.webp', import.meta.url).href],
      size: 'md',
      title: 'Cmd F*ck off Laptop Stickers',
    },
    {
      coverVid: new URL('../assets/work/shots/psiderman.com.mp4', import.meta.url).href,
      size: 'md',
      title: 'Old Portfolio',
      videos: [new URL('../assets/work/shots/psiderman.com.mp4', import.meta.url).href],
    },
  ],
}
