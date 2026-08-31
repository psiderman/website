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

export type FilterGroupId = FilterGroupDef['id']
type FilterGroupDef = (typeof FILTER_GROUPS)[number]
