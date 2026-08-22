import { ref, watch } from 'vue'

const allowMultiplayer = ref(localStorage.getItem('allowMultiplayer') !== 'false')

watch(allowMultiplayer, (newVal) => {
  localStorage.setItem('allowMultiplayer', newVal.toString())
})

export const global = {
  allowMultiplayer,
}
