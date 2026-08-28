import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { currentUser, currentUserRole } from '@/composables/useAuth'
import { global } from '@/composables/useGlobal'
import router from '@/router'
import { supabase } from '@/supabase'

export interface BoxRect {
  height: number
  left: number
  top: number
  width: number
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
  room: string
}

interface CursorData {
  box: string
  color: {
    bg: string
    fg: string
  }
  driftX?: number
  driftY?: number
  id: string
  name: string
  route: string
  updatedAt: number
  x: number
  y: number
}

interface TouchData {
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

const LIVE_CONFIG = {
  CURSOR_DELETE_MS: 60000,
  CURSOR_STALE_MS: 5000,
  MAX_CURSORS: 10,
  MAX_TOUCHES: 10,
  TOUCH_DELETE_MS: 60000,
  TOUCH_STALE_MS: 5000,
  USER_STALE_MS: 15000,
}

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

const userName = computed(() => {
  if (!currentUser.value) return getAnonName(activeUserId.value)
  return (
    currentUser.value.user_metadata?.full_name?.split(' ')[0] ||
    currentUser.value.email?.split('@')[0] ||
    getAnonName(activeUserId.value)
  )
})

const userAvatar = computed(() => {
  return (
    currentUser.value?.user_metadata?.avatar_url ||
    currentUser.value?.user_metadata?.picture ||
    null
  )
})

const colorCache = ref<Record<string, { bg: string; fg: string }>>({})
const userColor = ref(fallbackColor.value)

let channel: null | ReturnType<typeof supabase.channel> = null

export const activeRoomName = computed(() => {
  let name = `live:${router.currentRoute.value.path}`
  if (router.currentRoute.value.query.filter) {
    name += `?filter=${router.currentRoute.value.query.filter}`
  }
  if (global.activeModal.value) {
    name += `&modal=${global.activeModal.value}`
  }
  return name
})

watch(
  [activeUserId, userName, userAvatar, currentUserRole],
  ([id, name, avatar, role]) => {
    const trackPresence = (color: { bg: string; fg: string }) => {
      if (channel && global.allowMultiplayer.value) {
        channel.track({
          avatar,
          color,
          id,
          name,
          role,
          room: activeRoomName.value,
        })
      }
    }

    if (!avatar) {
      userColor.value = fallbackColor.value
      trackPresence(userColor.value)
      return
    }

    if (colorCache.value[avatar]) {
      userColor.value = colorCache.value[avatar]
      trackPresence(userColor.value)
      return
    }

    fetch(`/api/color?url=${encodeURIComponent(avatar)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch color')
        return res.json()
      })
      .then((data) => {
        if (!data.hex) return

        const hex = data.hex
        const hexStr = hex.replace('#', '')
        const r = parseInt(hexStr.substring(0, 2), 16)
        const g = parseInt(hexStr.substring(2, 4), 16)
        const b = parseInt(hexStr.substring(4, 6), 16)

        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        const fg = brightness > 125 ? 'var(--color-dark)' : 'var(--color-light)'

        const extractedColor = { bg: hex, fg }
        colorCache.value[avatar] = extractedColor
        userColor.value = extractedColor

        trackPresence(extractedColor)
      })
      .catch((err) => {
        console.error('Failed to extract color via API', err)
      })
  },
  { immediate: true },
)

// Global reactive state
export const hasOtherUsersOnRoom = ref(false)
const activePresenceUsers = ref<PresenceUser[]>([])
const cursors = ref<Record<string, CursorData>>({})
const touches = ref<Record<string, TouchData>>({})
const windowWidth = ref(window.innerWidth)
const scrollY = ref(window.scrollY)
const boxRects = ref(new Map<string, BoxRect>())
const isMobile = ref(false)

const reactiveNow = ref(Date.now())

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
  const localUser: PresenceUser = {
    avatar: userAvatar.value,
    color: userColor.value,
    id: activeUserId.value,
    name: userName.value,
    role: currentUserRole.value,
    room: activeRoomName.value,
  }

  if (!global.allowMultiplayer.value) {
    return [localUser]
  }

  const uniqueUsers = new Map<string, PresenceUser>()
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
        ? reactiveNow.value - cursor.updatedAt > LIVE_CONFIG.USER_STALE_MS
        : true
      const touchStale = touch
        ? reactiveNow.value - touch.timestamp > LIVE_CONFIG.USER_STALE_MS
        : true
      const isStale = isLocal ? false : cursorStale && touchStale
      return { ...u, isStale }
    })
    .sort((a, b) => {
      if (a.id === activeUserId.value) return -1
      if (b.id === activeUserId.value) return 1

      if (a.isStale && !b.isStale) return 1
      if (!a.isStale && b.isStale) return -1

      return a.id.localeCompare(b.id)
    })
})

export const renderCursors = computed(() => {
  if (!global.allowMultiplayer.value) return []
  return activeCursors.value.map((cursor) => {
    let renderX = cursor.x * windowWidth.value
    let renderY = cursor.y

    if (cursor.box !== 'viewport' && boxRects.value.has(cursor.box)) {
      const rect = boxRects.value.get(cursor.box)!
      renderX = rect.left + cursor.x * rect.width

      if (cursor.box === 'header') {
        const viewportTop = Math.max(0, rect.top - scrollY.value)
        renderY = scrollY.value + viewportTop + cursor.y * rect.height
      } else {
        renderY = rect.top + cursor.y * rect.height
      }
    }

    renderX += cursor.driftX || 0
    renderY += cursor.driftY || 0

    return {
      ...cursor,
      renderX,
      renderY,
    }
  })
})

export const renderTouches = computed(() => {
  if (!global.allowMultiplayer.value) return []
  return activeTouches.value.map((touch) => {
    let renderX = touch.x * windowWidth.value
    let renderY = touch.y

    if (touch.box !== 'viewport' && boxRects.value.has(touch.box)) {
      const rect = boxRects.value.get(touch.box)!
      renderX = rect.left + touch.x * rect.width

      if (touch.box === 'header') {
        const viewportTop = Math.max(0, rect.top - scrollY.value)
        renderY = scrollY.value + viewportTop + touch.y * rect.height
      } else {
        renderY = rect.top + touch.y * rect.height
      }
    }

    return {
      ...touch,
      renderX,
      renderY,
    }
  })
})

export const toggleMultiplayer = () => {
  global.allowMultiplayer.value = !global.allowMultiplayer.value
}

let resizeObserver: null | ResizeObserver = null
let lastSent = 0
const THROTTLE_MS = 2000
let cleanupInterval: null | ReturnType<typeof setInterval> = null
let driftInterval: null | ReturnType<typeof setInterval> = null
const activeWatchers: (() => void)[] = []

const joinRoom = (roomName: string) => {
  if (channel) {
    channel.untrack()
    channel.unsubscribe()
    channel = null
  }

  // Clear stale state from previous room
  cursors.value = {}
  touches.value = {}
  activePresenceUsers.value = []
  hasOtherUsersOnRoom.value = false

  if (!global.allowMultiplayer.value) return

  channel = supabase.channel(roomName)

  channel
    .on('presence', { event: 'sync' }, () => {
      if (!channel) return
      const state = channel.presenceState()
      let count = 0
      const users = []
      const activeIds = new Set<string>()

      for (const id in state) {
        const presences = state[id] as unknown as PresenceUser[]
        if (presences.length > 0) {
          const p = presences[0]
          users.push(p)
          activeIds.add(p.id)
          if (p.id !== activeUserId.value) {
            count++
          }
        }
      }
      hasOtherUsersOnRoom.value = count > 0
      activePresenceUsers.value = users

      // Cleanup cursors and touches for users who left
      for (const id in cursors.value) {
        if (!activeIds.has(id)) {
          delete cursors.value[id]
        }
      }
      for (const id in touches.value) {
        if (!activeIds.has(id)) {
          delete touches.value[id]
        }
      }
    })
    .on('broadcast', { event: 'cursor' }, ({ payload }) => {
      if (payload.id === activeUserId.value) return

      const existing = cursors.value[payload.id]
      cursors.value[payload.id] = {
        ...payload,
        driftX: existing ? existing.driftX : 0,
        driftY: existing ? existing.driftY : 0,
        updatedAt: Date.now(),
      }
    })
    .on('broadcast', { event: 'touch' }, ({ payload }) => {
      if (payload.id === activeUserId.value) return
      touches.value[payload.id] = { ...payload, timestamp: Date.now() }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && global.allowMultiplayer.value) {
        await channel!.track({
          avatar: userAvatar.value,
          color: userColor.value,
          id: activeUserId.value,
          name: userName.value,
          role: currentUserRole.value,
          room: activeRoomName.value,
        })
      }
    })
}

const updateBoxRects = () => {
  const rects = new Map<string, BoxRect>()
  document.querySelectorAll('[data-sync]').forEach((el) => {
    const boxId = el.getAttribute('data-sync')
    if (boxId) {
      const rect = el.getBoundingClientRect()
      rects.set(boxId, {
        height: rect.height,
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
      })
    }
  })
  boxRects.value = rects
}

const handleResize = () => {
  isMobile.value = window.matchMedia('(pointer: coarse)').matches
  windowWidth.value = window.innerWidth
  updateBoxRects()
}

const handleScroll = () => {
  scrollY.value = window.scrollY
}

const handleMouseMove = (e: MouseEvent) => {
  if (isMobile.value) return // Mobile uses touchstart
  if (!global.allowMultiplayer.value) return
  if (!hasOtherUsersOnRoom.value) return
  if (!channel) return

  const now = Date.now()
  if (now - lastSent < THROTTLE_MS) return
  lastSent = now

  const target = (e.target as Element).closest('[data-sync]')
  let box = 'viewport'
  let x = e.pageX / windowWidth.value
  let y = e.pageY

  if (target) {
    const boxId = target.getAttribute('data-sync')
    if (boxId) {
      const rect = target.getBoundingClientRect()
      box = boxId
      x = (e.clientX - rect.left) / rect.width
      y = (e.clientY - rect.top) / rect.height
    }
  }

  channel.send({
    event: 'cursor',
    payload: {
      box,
      color: userColor.value,
      id: activeUserId.value,
      name: userName.value,
      room: activeRoomName.value,
      x,
      y,
    },
    type: 'broadcast',
  })
}

const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return
  if (!global.allowMultiplayer.value) return
  if (!hasOtherUsersOnRoom.value) return
  if (!channel) return
  if (e.changedTouches.length === 0) return

  const now = Date.now()
  if (now - lastSent < THROTTLE_MS) return
  lastSent = now

  const touch = e.changedTouches[0]
  const target = (e.target as Element).closest('[data-sync]')
  let box = 'viewport'
  let x = touch.pageX / windowWidth.value
  let y = touch.pageY

  if (target) {
    const boxId = target.getAttribute('data-sync')
    if (boxId) {
      const rect = target.getBoundingClientRect()
      box = boxId
      x = (touch.clientX - rect.left) / rect.width
      y = (touch.clientY - rect.top) / rect.height
    }
  }

  channel.send({
    event: 'touch',
    payload: {
      box,
      color: userColor.value,
      id: activeUserId.value,
      name: userName.value,
      room: activeRoomName.value,
      timestamp: now,
      x,
      y,
    },
    type: 'broadcast',
  })
}

const startLiveSession = () => {
  isMobile.value = window.matchMedia('(pointer: coarse)').matches
  updateBoxRects()
  resizeObserver = new ResizeObserver(() => {
    updateBoxRects()
  })
  resizeObserver.observe(document.body)

  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchstart', handleTouchStart, { passive: true })

  joinRoom(activeRoomName.value)

  // Watch for room changes to rejoin
  activeWatchers.push(
    watch(
      () => activeRoomName.value,
      (newRoom) => {
        joinRoom(newRoom)
      },
      { immediate: false },
    ),
  )

  // Watch for toggle to rejoin/leave
  activeWatchers.push(
    watch(
      () => global.allowMultiplayer.value,
      (allow) => {
        if (allow) joinRoom(activeRoomName.value)
        else {
          if (channel) {
            channel.untrack()
            channel.unsubscribe()
            channel = null
          }
        }
      },
    ),
  )

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    reactiveNow.value = now

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

  driftInterval = setInterval(() => {
    const now = Date.now()
    for (const id in cursors.value) {
      if (id === activeUserId.value) continue

      const c = cursors.value[id]
      if (now - c.updatedAt > LIVE_CONFIG.CURSOR_STALE_MS) continue // Don't drift if stale

      // Generate a pseudo-random seed from the ID so each cursor floats differently
      let hash = 0
      for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)

      // Different phase offsets and slight speed variations
      const phaseX = hash % 100
      const phaseY = (hash >> 4) % 100
      const speedX = 0.0008 + (hash % 10) * 0.00005
      const speedY = 0.0009 + ((hash >> 2) % 10) * 0.00005

      // Smooth, continuous organic floating (max +/- 12px)
      c.driftX = Math.sin(now * speedX + phaseX) * 12
      c.driftY = Math.cos(now * speedY + phaseY) * 12
    }
  }, 50)
}

const stopLiveSession = () => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchstart', handleTouchStart)
  if (cleanupInterval) clearInterval(cleanupInterval)
  if (driftInterval) clearInterval(driftInterval)
  cleanupInterval = null
  driftInterval = null
  activeWatchers.forEach((unwatch) => unwatch())
  activeWatchers.length = 0

  if (channel) {
    channel.unsubscribe()
    channel = null
  }
  resizeObserver?.disconnect()
  resizeObserver = null
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
