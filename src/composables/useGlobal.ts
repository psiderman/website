import { computed, ref } from 'vue'

import { trackEvent } from '@/utils/analytics'

import type { LightBoxTag } from '@/components/LightBox.vue'
import type { WorkDetail } from '@/data/work'
import type { GalleryImage } from '@/types'

const _allowMultiplayer = ref(localStorage.getItem('allowMultiplayer') !== 'false')

const allowMultiplayer = computed({
  get: () => _allowMultiplayer.value,
  set: (newVal) => {
    _allowMultiplayer.value = newVal
    localStorage.setItem('allowMultiplayer', newVal.toString())
  },
})

export interface LightBoxData {
  description?: string
  images: GalleryImage[]
  tags?: LightBoxTag[]
  title?: string
  videos?: string[]
}

export type ModalState =
  | { data: LightBoxData; type: 'lightbox' }
  | { data: PhotoLightBoxData; type: 'photoLightbox' }
  | { data: WorkDetail; type: 'work' }
  | { type: 'auth' }
  | { type: 'none' }

export interface PhotoLightBoxData {
  currentTripSlug?: string
  images: GalleryImage[]
  initialIndex?: number
  tripTitle?: string
}

export const modalState = ref<ModalState>({ type: 'none' })

export const resetModals = () => {
  modalState.value = { type: 'none' }
}

export const lightBoxData = ref<LightBoxData>({
  description: '',
  images: [],
  title: '',
})

export const photoLightBoxData = ref<PhotoLightBoxData>({
  currentTripSlug: '',
  images: [],
  initialIndex: 0,
  tripTitle: '',
})

export const workData = ref<null | WorkDetail>(null)

export const isLightBoxOpen = computed({
  get: () => modalState.value.type === 'lightbox',
  set: (val) => {
    if (val) {
      if (modalState.value.type !== 'lightbox') {
        modalState.value = { data: lightBoxData.value, type: 'lightbox' }
      }
    } else if (modalState.value.type === 'lightbox') {
      modalState.value = { type: 'none' }
    }
  },
})

export const isPhotoLightBoxOpen = computed({
  get: () => modalState.value.type === 'photoLightbox',
  set: (val) => {
    if (val) {
      if (modalState.value.type !== 'photoLightbox') {
        modalState.value = { data: photoLightBoxData.value, type: 'photoLightbox' }
      }
    } else if (modalState.value.type === 'photoLightbox') {
      modalState.value = { type: 'none' }
    }
  },
})

export const isWorkModalOpen = computed({
  get: () => modalState.value.type === 'work',
  set: (val) => {
    if (val) {
      if (modalState.value.type !== 'work') {
        modalState.value = { data: workData.value || ({} as WorkDetail), type: 'work' }
      }
    } else if (modalState.value.type === 'work') {
      modalState.value = { type: 'none' }
    }
  },
})

export const isAuthModalOpen = computed({
  get: () => modalState.value.type === 'auth',
  set: (val) => {
    if (val) {
      modalState.value = { type: 'auth' }
    } else if (modalState.value.type === 'auth') {
      modalState.value = { type: 'none' }
    }
  },
})

export function openAuthModal() {
  modalState.value = { type: 'auth' }
}

export function openLightbox(data: {
  description?: string
  images?: GalleryImage[]
  tags?: LightBoxTag[]
  title?: string
  videos?: string[]
}) {
  const formatted: LightBoxData = {
    description: data.description ?? '',
    images: data.images ?? [],
    tags: data.tags,
    title: data.title ?? '',
    videos: data.videos,
  }
  trackEvent('open_work_lightbox', {
    images_count: data.images?.length ?? 0,
    title: data.title ?? '',
  })
  lightBoxData.value = formatted
  modalState.value = { data: formatted, type: 'lightbox' }
}

export function openPhotoLightbox(
  images: GalleryImage[],
  options: { initialIndex?: number; title?: string; tripSlug?: string } = {},
) {
  if (images.length === 0) return

  const start = options.initialIndex ?? 0
  const orderedImages = [...images.slice(start), ...images.slice(0, start)]

  const formatted: PhotoLightBoxData = {
    currentTripSlug: options.tripSlug ?? '',
    images: orderedImages,
    initialIndex: 0,
    tripTitle: options.title ?? '',
  }
  trackEvent('open_photo_lightbox', {
    count: images.length,
    title: options.title || options.tripSlug || 'photos',
    trip_slug: options.tripSlug,
  })
  photoLightBoxData.value = formatted
  modalState.value = { data: formatted, type: 'photoLightbox' }
}

export function openWorkModal(data: WorkDetail) {
  trackEvent('open_work_modal', {
    org_id: data.orgId,
    org_name: data.orgName,
    role: data.role,
  })
  workData.value = data
  modalState.value = { data, type: 'work' }
}

export const activeModal = computed(() => {
  if (modalState.value.type === 'none') return null
  return modalState.value.type
})

export const global = {
  activeModal,
  allowMultiplayer,
  isAuthModalOpen,
  isLightBoxOpen,
  isPhotoLightBoxOpen,
  isWorkModalOpen,
  lightBoxData,
  modalState,
  photoLightBoxData,
  resetModals,
  workData,
}
