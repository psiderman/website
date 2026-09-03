import type { GalleryImage } from '@/types'

export interface OutgoingCard {
  id: string
  img: GalleryImage
  isExiting: boolean
  rotate: number
  x: number
  y: number
}

export interface StackCard {
  depth: number
  id: string
  img: GalleryImage
  imgIndex: number
  isBehind: boolean
  rotate: number
  scale: number
  x: number
  y: number
  zIndex: number
}

export const BUFFER_BEHIND = 2
export const BUFFER_AHEAD = 3
export const THUMB_ROTATIONS = [-2.5, 3, -1.8, 2.2, -3, 2]
