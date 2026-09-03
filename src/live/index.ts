import { onMounted, onUnmounted, watch } from 'vue'

import { global } from '@/composables/useGlobal'
import router from '@/router'

import { handleResize, handleScroll, updateBoxRects } from './box'
import {
  clearDriftOffsets,
  registerDriftEl,
  startDrift,
  stopDrift,
  unregisterDriftEl,
} from './drift'
import { activeUserId, userColor } from './identity'
import { handleMouseMove, handleTouchStart } from './inputs'
import { activePresenceUsers, joinRoom, leaveRoom, sendPresence } from './presence'
import { renderCursors, renderTouches, sortedPresenceUsers } from './render'
import {
  isHomeView,
  isMobile,
  type PresenceUser,
  startStalePruning,
  stopStalePruning,
} from './state'

let resizeObserver: null | ResizeObserver = null
const activeWatchers: (() => void)[] = []

const setupResizeObserver = () => {
  if (resizeObserver || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => {
    updateBoxRects()
  })
  resizeObserver.observe(document.body)
}

const teardownResizeObserver = () => {
  resizeObserver?.disconnect()
  resizeObserver = null
}

const startLiveSession = () => {
  isMobile.value = window.matchMedia('(pointer: coarse)').matches
  updateBoxRects()

  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchstart', handleTouchStart, { passive: true })

  joinRoom()

  if (global.allowMultiplayer.value) setupResizeObserver()

  // Keep the presence route fresh without rejoining the single site room.
  activeWatchers.push(
    watch(
      () => router.currentRoute.value.fullPath,
      () => {
        sendPresence(userColor.value)
      },
    ),
  )

  // Watch for toggle to rejoin/leave
  activeWatchers.push(
    watch(
      () => global.allowMultiplayer.value,
      (allow) => {
        if (allow) {
          joinRoom()
          setupResizeObserver()
          updateBoxRects()
        } else {
          leaveRoom()
          teardownResizeObserver()
        }
      },
    ),
  )

  startStalePruning()
  startDrift()
}

const stopLiveSession = () => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchstart', handleTouchStart)

  stopStalePruning()
  stopDrift()
  clearDriftOffsets()

  activeWatchers.forEach((unwatch) => unwatch())
  activeWatchers.length = 0

  leaveRoom()
  teardownResizeObserver()
}

export const toggleMultiplayer = () => {
  global.allowMultiplayer.value = !global.allowMultiplayer.value
}

let activeCallers = 0

export function useLive() {
  onMounted(() => {
    activeCallers++
    if (activeCallers === 1) {
      startLiveSession()
    }
  })

  onUnmounted(() => {
    activeCallers--
    if (activeCallers === 0) {
      stopLiveSession()
    }
  })
}

// Public API — consumer-facing surface only.
export {
  activePresenceUsers,
  activeUserId,
  isHomeView,
  registerDriftEl,
  renderCursors,
  renderTouches,
  sortedPresenceUsers,
  unregisterDriftEl,
}
export type { PresenceUser }
