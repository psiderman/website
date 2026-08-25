import { computed, ref } from 'vue'

import { isAuthModalOpen } from '@/composables/useAuth'

import type { LightBoxTag } from '@/components/LightBox.vue'
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
  description: string
  images: string[]
  tags?: LightBoxTag[]
  title: string
  videos?: string[]
}>({
  description: '',
  images: [],
  title: '',
})

export const isWorkModalOpen = ref(false)
export const workData = ref<null | WorkDetail>(null)

const activeModal = computed(() => {
  if (isWorkModalOpen.value) return 'work'
  if (isLightBoxOpen.value) return 'lightbox'
  if (isAuthModalOpen.value) return 'auth'
  return null
})

export const global = {
  activeModal,
  allowMultiplayer,
  isLightBoxOpen,
  isWorkModalOpen,
  lightBoxData,
  workData,
}
