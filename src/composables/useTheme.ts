import { onMounted, onUnmounted, ref } from 'vue'

export type Theme = 'dark' | 'light' | 'system'

export const theme = ref<Theme>('system')
const isDark = ref(false)

const updateTheme = () => {
  if (
    theme.value === 'dark' ||
    (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark')
    isDark.value = true
  } else {
    document.documentElement.classList.remove('dark')
    isDark.value = false
  }
}

export const setTheme = (newTheme: Theme) => {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  updateTheme()
}

export const initTheme = () => {
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') as null | Theme
    if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
      theme.value = savedTheme
    }
    updateTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if (theme.value === 'system') {
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', listener)

    // In case component is unmounted
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', listener)
    })
  })
}
