import { computed, ref } from 'vue'

import { currentUser } from '@/composables/useAuth'

// Generate a random stable color for the current user based on their ID
const generateColor = (id: string) => {
  const colors = [
    'var(--color-red-600)',
    'var(--color-yellow-500)',
    'var(--color-green-600)',
    'var(--color-blue-600)',
    'var(--color-purple-600)',
    'var(--color-pink-600)',
  ]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return {
    bg: colors[Math.abs(hash) % colors.length],
    fg: hash == 1 ? 'var(--color-dark)' : 'var(--color-light)',
  }
}

let localId = typeof window !== 'undefined' ? sessionStorage.getItem('cursor_local_id') : null
if (typeof window !== 'undefined' && !localId) {
  localId = `anon_${Math.random().toString(36).substring(2, 9)}`
  sessionStorage.setItem('cursor_local_id', localId)
}

export const activeUserId = computed(() => currentUser.value?.id || localId!)

const fallbackColor = computed(() => generateColor(activeUserId.value))

const SPICE_NAMES = [
  'Bay Leaf',
  'Cinnamon',
  'Clove',
  'Dhaniya',
  'Elaichi',
  'Garlic',
  'Ginger',
  'Imli',
  'Jeera',
  'Mirchi',
  'Mustard',
  'Pepper',
  'Saffron',
  'Star Anise',
]

const getAnonName = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % SPICE_NAMES.length
  return `Anonymous ${SPICE_NAMES[index]}`
}

export const userName = computed(() => {
  if (!currentUser.value) return getAnonName(activeUserId.value)
  return (
    currentUser.value.user_metadata?.full_name?.split(' ')[0] || getAnonName(activeUserId.value)
  )
})

export const userAvatar = computed(() => {
  return (
    currentUser.value?.user_metadata?.avatar_url ||
    currentUser.value?.user_metadata?.picture ||
    null
  )
})

export const colorCache = ref<Record<string, { bg: string; fg: string }>>({})
export const userColor = ref(fallbackColor.value)

// Set of avatar URLs currently being fetched for color — dedupes the API.
export const pendingColorFetch = ref(new Set<string>())

export { fallbackColor }
