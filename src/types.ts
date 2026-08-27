import { BadgeIndianRupee, Cuboid, Dna, DoorOpen, Music, PlaneTakeoff, VectorSquare } from "@lucide/vue"

export const FILTER_GROUPS = [
  { icon: DoorOpen, id: 'home', label: 'Home'},
  { icon: Dna, id: 'life', label: 'Life'},
  { icon: VectorSquare, id: 'work', label: 'Work'},
  { icon: BadgeIndianRupee, id: 'personal_finance', label: 'Money'},
  { icon: Cuboid, id: 'building', label: 'Building'},
  // { id: 'gaming', label: 'Gaming', icon: Joystick },
  { icon: PlaneTakeoff, id: 'travel', label: 'Travel'},
  { icon: Music, id: 'music', label: 'Music'},
] as const

export type FilterGroupId = FilterGroupDef['id']
type FilterGroupDef = (typeof FILTER_GROUPS)[number]
