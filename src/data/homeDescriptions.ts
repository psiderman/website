import type { EmojiGroupId } from '@/types'

export interface DescriptionContent {
  content: string[]
  id: EmojiGroupId
  title: string
}

export const descriptionContent: DescriptionContent[] = [
  {
    content: [
      '“somewhere along the way, i became the person friends would come to for spreadsheets, budgeting, and investment questions. before realizing i’d rather build software than portfolios, i even cleared the certifications to become a sebi investment adviser.',
      'today, the obsession with personal finance lives on in foursight, my attempt at making personal finance more intentional, mindful, and a little more delightful.”',
    ],
    id: 'personal_finance',
    title: 'on personal finance',
  },
  {
    content: [
      '“my career has taken me through ed-tech, hr-tech, and fin-tech, but the common thread has always been building. i started out designing features, then systems, and eventually found myself building products end-to-end.',
      'after years of saying “i’m just a designer who codes a little”, i’m finally comfortable calling myself a design engineer.”',
    ],
    id: 'work',
    title: 'life as a product designer',
  },
  {
    content: [
      '“i like making things. i’m a builder at heart and have no qualms investing 5 hours building something that would bring someone joy, even if for only 5 seconds.',
      'one of the first examples of this is owen sans, a whimsical find-the-difference game, that caught the attention of the product hunt ceo. what product folks call delight, i like calling whimsy. we’re very short on whimsy as a species.”',
    ],
    id: 'building',
    title: 'the joy of building something, anything',
  },
  {
    content: [
      '“i first picked up a guitar when i was 14 to impress a girl. while said girl wasn’t impressed by it, this canon event sparked an interest in music where i taught myself enough guitar and keys, that i can work my way around a daw to make covers.',
      'i’ve also fallen in love with making hyper-specific playlists on my spotify. i haven’t yet joined the vinyl bandwagon, though.”',
    ],
    id: 'music',
    title: 'to the beat',
  },
  {
    content: [
      '“in 2023, i took my first international trip to hong kong. the same year, i took an open-ended break from work to travel.',
      'i spent over two months backpacking in south-east asia, three weeks in japan, and i have since travelled enough to make it (almost all of) my personality.',
      'the travel bug isn’t as strong lately, it lies dormant.”',
    ],
    id: 'travel',
    title: 'psiderman: far from home',
  },
  {
    content: [
      '“i’ve always wanted a website that’s an extension of me, not just my work self. something i would be proud to show a stranger, not just the people in the industry.',
      'i think i’ve landed on an iteration that’s here to stay. i hope you like the little easter eggs i’ve peppered in here too. if there is something that you’d like to see on here, let me know.”',
    ],
    id: 'life',
    title: 'welcome to the psiderverse',
  },
  // {
  //   content: [
  //     '“when i have time to myself, i spend it leveling up in video games. although my progress in valorant and rivals has been painfully slow, it’s one of my favorite pastimes.',
  //     'lately however, i have demoted myself to a ps5 playing reruns of hitman 3 and insomniac’s spider-man.”',
  //   ],
  //   id: 'gaming',
  //   title: '',
  // },
]
