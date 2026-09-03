import { computed, ref } from 'vue'

import router from '@/router'

export interface BoxRect {
  height: number
  left: number
  top: number
  width: number
}

export interface CursorData {
  box: string
  color: {
    bg: string
    fg: string
  }
  id: string
  name: string
  route: string
  updatedAt: number
  x: number
  y: number
}

export interface PresenceUser {
  avatar: null | string
  color: {
    bg: string
    fg: string
  }
  id: string
  isStale?: boolean
  name: string
  role?: null | string
  route?: string
}

export interface TouchData {
  box: string
  color: {
    bg: string
    fg: string
  }
  id: string
  name: string
  route: string
  timestamp: number
  x: number
  y: number
}

export const LIVE_CONFIG = {
  CURSOR_DELETE_MS: 60000,
  CURSOR_STALE_MS: 5000,
  MAX_CURSORS: 10,
  MAX_TOUCHES: 10,
  TOUCH_DELETE_MS: 60000,
  TOUCH_STALE_MS: 5000,
  USER_STALE_MS: 15000,
}

export const isHomeView = computed(() => router.currentRoute.value.path === '/')

// Global reactive state
export const cursors = ref<Record<string, CursorData>>({})
export const touches = ref<Record<string, TouchData>>({})
export const windowWidth = ref(window.innerWidth)
export const scrollY = ref(window.scrollY)
export const boxRects = ref(new Map<string, BoxRect>())
export const isMobile = ref(false)
export const reactiveNow = ref(Date.now())
// Long-period tick for presence staleness. Pushed forward at most every
// USER_STALE_MS so the avatar row (and the header around it) doesn't
// re-render every second — staleness is cosmetic-only and flips slowly.
export const presenceTick = ref(Date.now())

let pruningInterval: null | ReturnType<typeof setInterval> = null

export function startStalePruning() {
  if (pruningInterval) return
  pruningInterval = setInterval(() => {
    const now = Date.now()
    reactiveNow.value = now
    if (now - presenceTick.value > LIVE_CONFIG.USER_STALE_MS) {
      presenceTick.value = now
    }

    // Cleanup stale cursors completely after timeout
    for (const id in cursors.value) {
      if (now - cursors.value[id].updatedAt > LIVE_CONFIG.CURSOR_DELETE_MS) {
        delete cursors.value[id]
      }
    }

    // Cleanup stale touches completely after timeout
    for (const id in touches.value) {
      if (now - touches.value[id].timestamp > LIVE_CONFIG.TOUCH_DELETE_MS) {
        delete touches.value[id]
      }
    }

    // Enforce max cursors on screen
    const cursorIds = Object.keys(cursors.value)
    if (cursorIds.length > LIVE_CONFIG.MAX_CURSORS) {
      cursorIds.sort((a, b) => cursors.value[b].updatedAt - cursors.value[a].updatedAt)
      for (let i = LIVE_CONFIG.MAX_CURSORS; i < cursorIds.length; i++) {
        delete cursors.value[cursorIds[i]]
      }
    }

    // Enforce max touches on screen
    const touchIds = Object.keys(touches.value)
    if (touchIds.length > LIVE_CONFIG.MAX_TOUCHES) {
      touchIds.sort((a, b) => touches.value[b].timestamp - touches.value[a].timestamp)
      for (let i = LIVE_CONFIG.MAX_TOUCHES; i < touchIds.length; i++) {
        delete touches.value[touchIds[i]]
      }
    }
  }, 1000)
}

export function stopStalePruning() {
  if (pruningInterval) {
    clearInterval(pruningInterval)
    pruningInterval = null
  }
}
