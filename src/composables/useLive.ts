import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { currentUser } from '@/composables/useAuth'
import { global } from '@/composables/useGlobal'
import { supabase } from '@/supabase'

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
  driftX?: number
  driftY?: number
  id: string
  name: string
  route: string
  updatedAt: number
  x: number
  y: number
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

let localId = sessionStorage.getItem('cursor_local_id')
if (!localId) {
  localId = `anon_${Math.random().toString(36).substring(2, 9)}`
  sessionStorage.setItem('cursor_local_id', localId)
}

const activeUserId = computed(() => currentUser.value?.id || localId!)
const userColor = computed(() => generateColor(activeUserId.value))
const userName = computed(() => {
  if (!currentUser.value) return 'Anon'
  return (
    currentUser.value.user_metadata?.full_name.split(' ')[0] ||
    currentUser.value.email?.split('@')[0] ||
    'Anon'
  )
})

// Global reactive state
export const hasOtherUsersOnRoute = ref(false)
const cursors = ref<Record<string, CursorData>>({})
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)
const scrollY = ref(window.scrollY)
const boxRects = ref(new Map<string, BoxRect>())
const activeRoute = ref('')

const activeCursors = computed(() => {
  const now = Date.now()
  return Object.values(cursors.value).filter(
    (c) => now - c.updatedAt < 10000 && c.route === activeRoute.value,
  )
})

export const renderCursors = computed(() => {
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

export function useLive() {
  const route = useRoute()
  let channel: null | ReturnType<typeof supabase.channel> = null
  let resizeObserver: null | ResizeObserver = null
  let lastSent = 0
  const THROTTLE_MS = 2000

  // Track route changes
  watch(
    () => route.path,
    (newPath) => {
      activeRoute.value = newPath
      if (channel) {
        channel.track({ id: activeUserId.value, route: newPath })
      }
    },
    { immediate: true },
  )

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
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    updateBoxRects()
  }

  const handleScroll = () => {
    scrollY.value = window.scrollY
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!global.allowMultiplayer.value) return
    if (!hasOtherUsersOnRoute.value) return // ONLY BROADCAST IF OTHERS ARE PRESENT
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
        route: activeRoute.value,
        x,
        y,
      },
      type: 'broadcast',
    })
  }

  let cleanupInterval: ReturnType<typeof setInterval>
  let driftInterval: ReturnType<typeof setInterval>

  onMounted(() => {
    updateBoxRects()
    resizeObserver = new ResizeObserver(() => {
      updateBoxRects()
    })
    resizeObserver.observe(document.body)

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove)

    channel = supabase.channel('room:live')

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!channel) return
        const state = channel.presenceState()
        let count = 0
        for (const id in state) {
          const presences = state[id] as any[]
          if (presences.some((p) => p.route === activeRoute.value && p.id !== activeUserId.value)) {
            count++
          }
        }
        hasOtherUsersOnRoute.value = count > 0
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
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel!.track({ id: activeUserId.value, route: activeRoute.value })
        }
      })

    cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const id in cursors.value) {
        if (now - cursors.value[id].updatedAt > 10000) {
          delete cursors.value[id]
        }
      }
    }, 5000)

    driftInterval = setInterval(() => {
      for (const id in cursors.value) {
        if (id === activeUserId.value) continue

        const c = cursors.value[id]
        const dx = c.driftX || 0
        const dy = c.driftY || 0

        const stepX = (Math.random() - 0.5) * 15
        const stepY = (Math.random() - 0.5) * 15

        c.driftX = Math.max(-40, Math.min(40, dx + stepX))
        c.driftY = Math.max(-40, Math.min(40, dy + stepY))
      }
    }, 100)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('mousemove', handleMouseMove)
    clearInterval(cleanupInterval)
    clearInterval(driftInterval)

    if (channel) {
      channel.unsubscribe()
    }
    resizeObserver?.disconnect()
  })
}
