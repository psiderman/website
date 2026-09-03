import type { Department } from '@/types'

export interface WorkDetail {
  clickable?: boolean
  data?: {
    companyInfo?: {
      details: string
      legalName: string
      website: string
      websiteLabel: string
    }
    description?: string[] // content
    galleryImages?: GalleryImage[] // for the images widget
    projects?: WorkProject[]
  }
  emoji?: string // in case there's no icon
  endDate: null | string // leave empty if present
  isLeft: boolean // Controls which side of the timeline it appears on
  orgId: string // Used to fetch logos/images from Supabase storage
  orgName: string
  role?: string
  startDate: string // ISO string '2025-02-01'
}

export interface WorkPerson {
  dept?: Department
  imageName: string
  linkedin?: string
  name: string
  quote?: string
}

interface GalleryImage {
  landscape?: boolean
  src: string
}

interface WorkProject {
  link?: string
  name: string
}

export const workHistory: WorkDetail[] = [
  {
    clickable: true,
    data: {
      companyInfo: {
        details: '$100M | Series C | Premji Invest | Accel',
        legalName: '© Dezerv Investments Pvt. Ltd.',
        website: 'https://dezerv.in',
        websiteLabel: 'dezerv.in',
      },
      description: [
        'Dezerv is a wealth management platform managing ₹15,000+ Crores for its clients. I joined as a Senior Product Designer.',
        'I started my contribution to the product by designing the experience for tracking National Pension Scheme investments on the Wealth Monitor app.',
        'After that, I rebuilt the design infrastructure connecting four fragmented products, then used it to ship Dezerv Web, a desktop platform used by both clients and Relationship Managers.',
      ],
      galleryImages: [{ src: '3.webp' }, { src: '2.webp' }, { src: '1.webp' }, { src: '4.webp' }],
      projects: [
        { link: 'https://links.psiderman.com/dezerv-web-case-study', name: 'Dezerv Web' },
        { link: 'https://links.psiderman.com/prosper-case-study', name: 'Prosper Design System' },
        { name: 'Tracking NPS in Wealth Monitor' },
        { name: 'Consolidating Wealth Monitor into the Dezerv App' },
        { name: 'Hiring and Interviews' },
      ],
    },
    endDate: '2025-12-01',
    isLeft: true,
    orgId: 'dezerv',
    orgName: 'Dezerv',
    role: 'Sr. Product Designer',
    startDate: '2025-02-01',
  },

  {
    clickable: true,
    data: {
      companyInfo: {
        details: '$77.2M | Series B | Tiger Global',
        legalName: '© Multiplier Technologies Pte. Ltd',
        website: 'https://usemultiplier.com',
        websiteLabel: 'usemultiplier.com',
      },
      description: [
        'Multiplier is a global employment and workforce management platform. It allows companies to hire, manage, and pay international employees and contractors in over 160 countries without needing to set up a local legal entity',
        'I worked on employee onboarding and invoicing experiences for full-time employees, contractors, and freelancers.',
      ],
      galleryImages: [{ src: '2.webp' }, { src: '1.webp' }],
      projects: [
        {
          name: 'Contractor Onboarding',
        },
        {
          name: 'IT Asset Management',
        },
        {
          name: 'Leaves Management',
        },
      ],
    },
    endDate: '2025-01-31',
    isLeft: true,
    orgId: 'multiplier',
    orgName: 'Multiplier',
    role: 'Sr. Product Designer',
    startDate: '2024-05-01',
  },

  {
    clickable: true,
    data: {
      companyInfo: {
        details: '$47M | Series B | Tiger Global | Eight Roads',
        legalName: '© Quizizz Inc.',
        website: 'https://wayground.com',
        websiteLabel: 'wayground.com',
      },
      description: [
        'Quizizz is used by 80 million+ educators and students around the world to conduct assessments and instruction.',
        'I joined as the second designer, and saw the org scale from 18M MAU to 80M MAU during my time there.',
        'I’ve also contributed to growing the design team from 2 to 20 and shaping its culture and rituals, including critical contributions such as using Harry Potter references instead of Lorem Ipsum in Figma files.',
      ],
      galleryImages: [
        { landscape: true, src: '5.webp' },
        { landscape: true, src: '4.webp' },
        { src: '3.webp' },
        { landscape: true, src: '2.webp' },
        { src: '1.webp' },
      ],
      projects: [
        {
          link: 'https://links.psiderman.com/question-type-case-study',
          name: 'Question Types',
        },
        {
          link: 'https://links.psiderman.com/design-system-case-study',
          name: 'Chalkboard Design System',
        },
        {
          link: 'https://psiderman.notion.site/Lessons-7b2a0681aa7f4cb9b6e675923ada9608',
          name: 'Lessons',
        },
        {
          link: 'https://psiderman.notion.site/Parent-Reports-v2-39b7c0b161b38020b419d2d170671f6a',
          name: 'Parent Reports',
        },
        {
          link: 'https://psiderman.notion.site/Miscellaneous-39b7c0b161b380e194ebc11a60eacd2c',
          name: 'Other Miscellaneous Projects',
        },
      ],
    },
    endDate: '2020-12-31',
    isLeft: true,
    orgId: 'quizizz',
    orgName: 'Quizizz',
    role: 'Product Designer',
    startDate: '2019-01-01',
  },

  {
    clickable: true,
    endDate: '2023-06-30',
    isLeft: true,
    orgId: 'quizizz',
    orgName: 'Quizizz',
    role: 'Sr. Product Designer',
    startDate: '2021-01-01',
  },

  {
    emoji: '🏖️',
    endDate: '2024-04-30',
    isLeft: false,
    orgId: '',
    orgName: 'Career Break',
    startDate: '2023-07-01',
  },

  {
    clickable: false,
    endDate: null,
    isLeft: false,
    orgId: 'foursight',
    orgName: 'Foursight',
    startDate: '2026-01-01',
  },
]
