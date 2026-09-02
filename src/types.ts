import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  DoorOpen,
  Flower,
  Hammer,
  Music,
  PlaneTakeoff,
} from '@lucide/vue'

export const FILTER_GROUPS = [
  { icon: DoorOpen, id: 'home', label: 'Home' },
  { icon: Flower, id: 'life', label: 'Life' },
  { icon: BriefcaseBusiness, id: 'work', label: 'Work' },
  { icon: BadgeIndianRupee, id: 'personal_finance', label: 'Money' },
  { icon: Hammer, id: 'building', label: 'Building' },
  // { id: 'gaming', label: 'Gaming', icon: Joystick },
  { icon: PlaneTakeoff, id: 'travel', label: 'Travel' },
  { icon: Music, id: 'music', label: 'Music' },
] as const

export type ClearanceLevel = 'admin' | 'auth' | 'close' | 'friends' | 'known' | 'public'
export type FilterGroupId = FilterGroupDef['id']

export interface GalleryImage {
  caption?: null | string
  clearance?: ClearanceLevel | null | string
  height?: null | number
  thumbnailUrl?: string
  url: string
  width?: null | number
}

type FilterGroupDef = (typeof FILTER_GROUPS)[number]
