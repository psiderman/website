export interface Travel {
  date: Date
  dateLabel: string
  description: string[]
  instagramLink: string
  mapsListLink: string
  repeatVisit: boolean
  slug: string
  title: string
}

export const travels: Travel[] = [
  {
    date: new Date('2026-02-22'),
    dateLabel: 'February 2025',
    description: [
      'this was a super short trip (4 days). came after a long spell of no travel. when i learned fred again was going to be at fuji rock, i obsessed over the cost of flying to japan.',
      'when he announced se-asia, bkk was a no brainer. this was purely a concert trip, but it was a power packed few days. it rekindled my love for thai food and solo travel.',
    ],
    instagramLink: 'https://www.instagram.com/p/DV8oWokEtnu/?img_index=1',
    mapsListLink: 'https://maps.app.goo.gl/3WQitkcRjuLb6J5p6',
    repeatVisit: false,
    slug: 'ist_bud_26',
    title: 'Istanbul + Budapest',
  },
]
