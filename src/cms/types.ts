import type { ClearanceLevel, Department } from '@/types'

export interface BlogForm {
  clearance: ClearanceLevel
  date: string
  excerpt: string
  is_active: boolean
  minutes: null | number
  slug: string
  title: string
}

export interface BlogPostRecord {
  clearance: ClearanceLevel
  date: string
  excerpt: null | string
  is_active: boolean
  minutes: null | number
  slug: string
  title: string
}

export interface GuestbookEntry {
  avatar_url?: string
  created_at?: string
  display_name?: string
  email?: string
  id: string
  strokes: number[][][]
  updated_at?: string
  user_id?: string
}

export interface ImageEditForm {
  caption: string
  clearance: ClearanceLevel
}

export interface PageViewRecord {
  last_visited_at?: string
  path: string
  views: number
}

export interface ParsedGuestbookEntry extends GuestbookEntry {
  svgPaths: string[]
  viewBox?: string
}

export interface PersonForm {
  dept: Department
  imageName: string
  linkedin: string
  name: string
  quote: string
}

export interface QuoteForm {
  clearance: ClearanceLevel
  content: string
  date: string
  id: string
  title: string
}

export interface QuoteRecord {
  clearance: ClearanceLevel
  content: string
  created_at: string
  date: string
  id: string
  title?: null | string
  updated_at: string
}

export interface TripForm {
  clearance: ClearanceLevel
  date: string
  descriptionText: string
  instagram_link: string
  maps_list_link: string
  repeat_visit: boolean
  slug: string
  subtitle: string
  title: string
}

export interface TripImageRecord {
  caption: null | string
  clearance: ClearanceLevel
  date_taken: null | string
  height: null | number
  id: string
  lat: null | number
  lng: null | number
  sort_order: null | number
  storage_object_id: null | string
  storage_path: string
  trip_slug: string
  width: null | number
}

export interface TripRecord {
  clearance: ClearanceLevel
  date: string
  description: string[]
  instagram_link: null | string
  maps_list_link: null | string
  repeat_visit: boolean
  slug: string
  subtitle: null | string
  title: string
}

export interface UserRoleRecord {
  avatar_url?: string
  created_at?: string
  email?: string
  full_name?: string
  isOnline?: boolean
  last_sign_in_at?: string
  requested_clearance?: boolean
  requestedClearance?: boolean
  role: ClearanceLevel
  user_id: string
}

export interface WorkPersonRecord {
  dept: Department
  imageName: string
  linkedin: null | string
  name: string
  orgId: string
  quote: null | string
}
