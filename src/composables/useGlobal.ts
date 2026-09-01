import { computed, ref } from 'vue'

import { isAuthModalOpen } from '@/composables/useAuth'

import type { LightBoxTag } from '@/components/LightBox.vue'
import type { ClearanceLevel } from '@/composables/useTravel'
import type { WorkDetail } from '@/data/work'

const _allowMultiplayer = ref(localStorage.getItem('allowMultiplayer') !== 'false')

const allowMultiplayer = computed({
  get: () => _allowMultiplayer.value,
  set: (newVal) => {
    _allowMultiplayer.value = newVal
    localStorage.setItem('allowMultiplayer', newVal.toString())
  },
})

export const isLightBoxOpen = ref(false)
export const lightBoxData = ref<{
  description?: string
  images: { clearance?: ClearanceLevel; url: string }[]
  tags?: LightBoxTag[]
  title?: string
  videos?: string[]
}>({
  description: '',
  images: [],
  title: '',
})

export const isPhotoLightBoxOpen = ref(false)
export const photoLightBoxData = ref<{
  currentTripSlug?: string
  images: {
    caption?: null | string
    clearance?: ClearanceLevel | null | string
    height?: null | number
    thumbnailUrl?: string
    url: string
    width?: null | number
  }[]
  initialIndex?: number
  tripTitle?: string
}>({
  currentTripSlug: '',
  images: [],
  initialIndex: 0,
  tripTitle: '',
})

export const isWorkModalOpen = ref(false)
export const workData = ref<null | WorkDetail>(null)

type PhotoLightboxImageInput = {
  caption?: null | string
  clearance?: ClearanceLevel | null | string
  height?: null | number
  thumbnailUrl?: string
  url: string
  width?: null | number
}

export function openLightbox(data: {
  description?: string
  images?: { clearance?: ClearanceLevel; url: string }[]
  tags?: LightBoxTag[]
  title?: string
  videos?: string[]
}) {
  lightBoxData.value = {
    description: data.description ?? '',
    images: data.images ?? [],
    tags: data.tags,
    title: data.title ?? '',
    videos: data.videos,
  }
  isLightBoxOpen.value = true
}

export function openPhotoLightbox(
  images: PhotoLightboxImageInput[],
  options: { initialIndex?: number; title?: string; tripSlug?: string } = {},
) {
  if (images.length === 0) return

  const start = options.initialIndex ?? 0
  const orderedImages = [...images.slice(start), ...images.slice(0, start)]

  photoLightBoxData.value = {
    currentTripSlug: options.tripSlug ?? '',
    images: orderedImages,
    initialIndex: 0,
    tripTitle: options.title ?? '',
  }
  isPhotoLightBoxOpen.value = true
}

const activeModal = computed(() => {
  if (isWorkModalOpen.value) return 'work'
  if (isLightBoxOpen.value) return 'lightbox'
  if (isPhotoLightBoxOpen.value) return 'photoLightbox'
  if (isAuthModalOpen.value) return 'auth'
  return null
})

export const global = {
  activeModal,
  allowMultiplayer,
  isLightBoxOpen,
  isPhotoLightBoxOpen,
  isWorkModalOpen,
  lightBoxData,
  photoLightBoxData,
  workData,
}
