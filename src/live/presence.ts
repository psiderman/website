import { ref, watch } from 'vue'

import { currentUserRole } from '@/composables/useAuth'
import { global } from '@/composables/useGlobal'
import router from '@/router'
import { supabase } from '@/supabase'

import { clearDriftOffsets } from './drift'
import {
  activeUserId,
  colorCache,
  fallbackColor,
  pendingColorFetch,
  userAvatar,
  userColor,
  userName,
} from './identity'
import { cursors, type PresenceUser, touches } from './state'

const LIVE_ROOM = 'live:site'

export let channel: null | ReturnType<typeof supabase.channel> = null

export const hasOtherUsersOnRoom = ref(false)
export const activePresenceUsers = ref<PresenceUser[]>([])

// Presence payload recomposed live so it always reflects the current route.
// Admins never broadcast — their own browsing stays out of the visitor list.
const buildPresence = (color: { bg: string; fg: string }) => ({
  avatar: userAvatar.value,
  color,
  id: activeUserId.value,
  name: userName.value,
  role: currentUserRole.value,
  route: router.currentRoute.value.fullPath,
})

export const sendPresence = (color: { bg: string; fg: string }) => {
  if (!channel) return
  if (!global.allowMultiplayer.value) return
  if (currentUserRole.value === 'admin') return
  void channel.track(buildPresence(color))
}

watch(
  [activeUserId, userName, userAvatar, currentUserRole],
  ([_id, _name, avatar, _role]) => {
    if (!avatar) {
      userColor.value = fallbackColor.value
      sendPresence(userColor.value)
      return
    }

    if (colorCache.value[avatar]) {
      userColor.value = colorCache.value[avatar]
      sendPresence(userColor.value)
      return
    }

    // Dedupe in-flight color fetches per avatar so the first frame of a busy
    // room doesn't fire N identical /api/color requests.
    if (pendingColorFetch.value.has(avatar)) return

    pendingColorFetch.value.add(avatar)
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

        sendPresence(extractedColor)
      })
      .catch((err) => {
        console.error('Failed to extract color via API', err)
      })
      .finally(() => {
        pendingColorFetch.value.delete(avatar)
      })
  },
  { immediate: true },
)

export function joinRoom() {
  leaveRoom()

  // Clear stale state from previous room
  cursors.value = {}
  touches.value = {}
  clearDriftOffsets()
  activePresenceUsers.value = []
  hasOtherUsersOnRoom.value = false

  if (!global.allowMultiplayer.value) return

  channel = supabase.channel(LIVE_ROOM)

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

      cursors.value[payload.id] = {
        ...payload,
        updatedAt: Date.now(),
      }
    })
    .on('broadcast', { event: 'touch' }, ({ payload }) => {
      if (payload.id === activeUserId.value) return
      touches.value[payload.id] = { ...payload, timestamp: Date.now() }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED' && global.allowMultiplayer.value) {
        sendPresence(userColor.value)
      }
    })
}

export function leaveRoom() {
  if (channel) {
    channel.untrack()
    channel.unsubscribe()
    channel = null
  }
}
