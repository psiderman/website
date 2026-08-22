import { onMounted, ref } from 'vue'

export type Theme = 'dark' | 'light' | 'system'

export const theme = ref<Theme>('system')
export const isDark = ref(false)

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

export const toggleTheme = () => {
  const themes: Theme[] = ['light', 'dark', 'system']
  const nextIndex = (themes.indexOf(theme.value) + 1) % themes.length
  setTheme(themes[nextIndex])
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

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (_e) => {
      if (theme.value === 'system') {
        updateTheme()
      }
    })
  })
}
