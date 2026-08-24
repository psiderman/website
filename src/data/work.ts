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
    people?: WorkPerson[]
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

interface GalleryImage {
  caption?: string
  landscape?: boolean
  src: string
}

interface WorkPerson {
  imageName: string
  linkedin?: string
  name: string
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
      galleryImages: [
        { caption: 'accidentally became important at work', src: '4.webp' },
        { caption: '', src: '3.webp' },
        { caption: '', src: '2.webp' },
        { caption: 'super distracting coworkers', src: '1.webp' },
      ],
      people: [
        {
          imageName: 'adil',
          linkedin: 'https://www.linkedin.com/in/heyadil/',
          name: 'Adil',
        },
        {
          imageName: 'amitesh',
          linkedin: 'https://www.linkedin.com/in/amit74/',
          name: 'Amitesh',
        },
        {
          imageName: 'anchit',
          linkedin: 'https://www.linkedin.com/in/anchit-agarwal-1749a7142/',
          name: 'Anchit',
        },
        {
          imageName: 'ghosh',
          linkedin: 'https://www.linkedin.com/in/siddhant-ghosh-ux/',
          name: 'Sid',
        },
        {
          imageName: 'hegde',
          linkedin: 'https://www.linkedin.com/in/rahulhegde99/',
          name: 'Rahul',
        },
        {
          imageName: 'lavish',
          linkedin: 'https://www.linkedin.com/in/lavish-motani-55831391/',
          name: 'Lavish',
        },
        {
          imageName: 'mayank',
          name: 'Mayank',
        },

        {
          imageName: 'munot',
          linkedin: 'https://www.linkedin.com/in/siddhantmunot/',
          name: 'Siddhant',
        },
        {
          imageName: 'prerna',
          linkedin: 'https://www.linkedin.com/in/prerna-bajaj-b2327b1b2/',
          name: 'Prerna',
        },
        {
          imageName: 'rupak',
          linkedin: 'https://www.linkedin.com/in/mishra-ji/',
          name: 'Rupak',
        },
        {
          imageName: 'shebin',
          linkedin: 'https://www.linkedin.com/in/shebin-joseph-/',
          name: 'Shebin',
        },
        {
          imageName: 'sidhi',
          linkedin: 'https://www.linkedin.com/in/sidhi-shah/',
          name: 'Sidhi',
        },
        {
          imageName: 'vaishnavi',
          linkedin: 'https://www.linkedin.com/in/vaishnavi-arora-3874bb17a/',
          name: 'Vaishnavi',
        },
        {
          imageName: 'vinayak',
          linkedin: 'https://www.linkedin.com/in/vinayakmalkari/',
          name: 'Vinayak',
        },
        {
          imageName: 'yatish',
          linkedin: 'https://www.linkedin.com/in/yatish-asthana/',
          name: 'Yatish',
        },
        {
          imageName: 'yuva',
          linkedin: 'https://www.linkedin.com/in/yuvashree-babu/',
          name: 'Yuva',
        },
      ],
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
      galleryImages: [
        { caption: '', src: '2.webp' },
        { caption: '', src: '1.webp' },
      ],
      people: [
        {
          imageName: 'adrita',
          linkedin: 'https://www.linkedin.com/in/adrita-b-72237296/',
          name: 'Adrita',
        },
        {
          imageName: 'akshar',
          linkedin: 'https://www.linkedin.com/in/akshrpatel/',
          name: 'Akshar',
        },
        {
          imageName: 'pankhil',
          linkedin: 'https://www.linkedin.com/in/pankhilmistry/',
          name: 'Pankhil',
        },
        {
          imageName: 'rishi',
          linkedin: 'https://www.linkedin.com/in/rishhiiikesh/',
          name: 'Rishi',
        },
        {
          imageName: 'vineeth',
          linkedin: 'https://www.linkedin.com/in/vineeth-arumugam/',
          name: 'Vineeth',
        },
      ],
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
        { caption: '', landscape: true, src: '4.webp' },
        { caption: '', src: '3.webp' },
        { caption: '', landscape: true, src: '2.webp' },
        { caption: 'last day at work', src: '1.webp' },
      ],
      people: [
        {
          imageName: 'adarsh',
          linkedin: 'https://www.linkedin.com/in/adarsh-rao/',
          name: 'Adarsh',
        },
        {
          imageName: 'aman',
          linkedin: 'https://www.linkedin.com/in/amanjain9927/',
          name: 'Aman',
        },
        {
          imageName: 'arnav',
          linkedin: 'https://www.linkedin.com/in/arnavdasdesign/',
          name: 'Arnav',
        },
        {
          imageName: 'bhavika',
          linkedin: 'https://www.linkedin.com/in/bhavika-maheshwari/',
          name: 'Bhavika',
        },
        {
          imageName: 'natasha',
          linkedin: 'https://www.linkedin.com/in/natasha-goodwin-5a60b487/',
          name: 'Natasha',
        },
        {
          imageName: 'prakhar',
          linkedin: 'https://www.linkedin.com/in/papigupta/',
          name: 'Prakhar',
        },
        {
          imageName: 'priyal',
          linkedin: 'https://www.linkedin.com/in/priyalmittal/',
          name: 'Priyal',
        },
        {
          imageName: 'rahul',
          linkedin: 'https://www.linkedin.com/in/rahulmohan1/',
          name: 'Rahul',
        },
        {
          imageName: 'shubham',
          linkedin: 'https://www.linkedin.com/in/shubham-bhatt/',
          name: 'Shubham',
        },
        {
          imageName: 'somya',
          linkedin: 'https://www.linkedin.com/in/somyakriti/',
          name: 'Somya',
        },
        {
          imageName: 'vignesh',
          linkedin: 'https://www.linkedin.com/in/svignesh9796/',
          name: 'Vignesh',
        },
        {
          imageName: 'vinyas',
          linkedin: 'https://www.linkedin.com/in/vinyaspandey1109/',
          name: 'Vinyas',
        },
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
