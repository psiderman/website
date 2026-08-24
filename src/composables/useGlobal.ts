import { computed, ref } from 'vue'

import type { LightBoxTag } from '@/components/LightBox.vue'

const _allowMultiplayer = ref(localStorage.getItem('allowMultiplayer') !== 'false')

const allowMultiplayer = computed({
  get: () => _allowMultiplayer.value,
  set: (newVal) => {
    _allowMultiplayer.value = newVal
    localStorage.setItem('allowMultiplayer', newVal.toString())
  },
})

const activeModal = ref<null | string>(null)

export const isLightBoxOpen = ref(false)
export const lightBoxData = ref<{
  description: string
  images: string[]
  tags?: LightBoxTag[]
  title: string
}>({
  description: '',
  images: [],
  title: '',
})

export const global = {
  activeModal,
  allowMultiplayer,
  isLightBoxOpen,
  lightBoxData,
}
