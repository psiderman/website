import { computed } from 'vue'

import { currentUserRole } from '@/composables/useAuth'
import { global } from '@/composables/useGlobal'
import router from '@/router'

import { activeUserId, userAvatar, userColor, userName } from './identity'
import { activePresenceUsers } from './presence'
import {
  type BoxRect,
  boxRects,
  cursors,
  isHomeView,
  LIVE_CONFIG,
  presenceTick,
  reactiveNow,
  scrollY,
  touches,
  windowWidth,
} from './state'

const activeCursors = computed(() => {
  const now = reactiveNow.value
  return Object.values(cursors.value)
    .filter(
      (c) => now - c.updatedAt < LIVE_CONFIG.CURSOR_DELETE_MS, // We only receive cursors in the same room anyway
    )
    .map((c) => ({ ...c, isStale: now - c.updatedAt > LIVE_CONFIG.CURSOR_STALE_MS }))
})

const activeTouches = computed(() => {
  const now = reactiveNow.value
  return Object.values(touches.value)
    .filter((t) => now - t.timestamp < LIVE_CONFIG.TOUCH_DELETE_MS)
    .map((t) => ({ ...t, isStale: now - t.timestamp > LIVE_CONFIG.TOUCH_STALE_MS }))
})

export const sortedPresenceUsers = computed(() => {
  const localUser: (typeof activePresenceUsers.value)[number] = {
    avatar: userAvatar.value,
    color: userColor.value,
    id: activeUserId.value,
    name: userName.value,
    role: currentUserRole.value,
    route: router.currentRoute.value.fullPath,
  }

  if (!global.allowMultiplayer.value) {
    return [localUser]
  }

  const uniqueUsers = new Map<string, (typeof activePresenceUsers.value)[number]>()
  for (const u of activePresenceUsers.value) {
    uniqueUsers.set(u.id, u)
  }
  uniqueUsers.set(localUser.id, {
    ...(uniqueUsers.get(localUser.id) || {}),
    ...localUser,
  })

  return Array.from(uniqueUsers.values())
    .map((u) => {
      const isLocal = u.id === activeUserId.value
      const cursor = cursors.value[u.id]
      const touch = touches.value[u.id]

      const cursorStale = cursor
        ? presenceTick.value - cursor.updatedAt > LIVE_CONFIG.USER_STALE_MS
        : true
      const touchStale = touch
        ? presenceTick.value - touch.timestamp > LIVE_CONFIG.USER_STALE_MS
        : true
      const isStale = isLocal ? false : cursorStale && touchStale
      return { ...u, isStale }
    })
    // Stable order: local user first, then others in arrival order. Staleness
    // is reflected via opacity only, never by reordering — otherwise the
    // avatar row (and the header buttons beside it) shuffle every second as
    // users cross the staleness boundary.
    .sort((a, b) => {
      if (a.id === activeUserId.value) return -1
      if (b.id === activeUserId.value) return 1
      return 0
    })
})

/** Convert a normalized {box, x, y} back to absolute page coordinates for rendering. */
function toRenderCoords(
  item: { box: string; x: number; y: number },
  winW: number,
  sy: number,
  rects: Map<string, BoxRect>,
): { renderX: number; renderY: number } {
  let renderX = item.x * winW
  let renderY = item.y

  if (item.box !== 'viewport' && rects.has(item.box)) {
    const rect = rects.get(item.box)!
    renderX = rect.left + item.x * rect.width

    if (item.box === 'header') {
      const viewportTop = Math.max(0, rect.top - sy)
      renderY = sy + viewportTop + item.y * rect.height
    } else {
      renderY = rect.top + item.y * rect.height
    }
  }

  return { renderX, renderY }
}

export const renderCursors = computed(() => {
  if (!global.allowMultiplayer.value) return []
  if (!isHomeView.value) return []
  return activeCursors.value.map((cursor) => ({
    ...cursor,
    ...toRenderCoords(cursor, windowWidth.value, scrollY.value, boxRects.value),
  }))
})

export const renderTouches = computed(() => {
  if (!global.allowMultiplayer.value) return []
  if (!isHomeView.value) return []
  return activeTouches.value.map((touch) => ({
    ...touch,
    ...toRenderCoords(touch, windowWidth.value, scrollY.value, boxRects.value),
  }))
})
