import { currentUser, currentUserRole } from '@/composables/useAuth'
import { queryClient } from '@/queryClient'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import type { RealtimeChannel } from '@supabase/supabase-js'

let syncChannel: null | RealtimeChannel = null
let retryTimer: null | ReturnType<typeof setTimeout> = null
let attempts = 0
let warnedDegrade = false

const MAX_RETRIES = 10
const MAX_BACKOFF_MS = 30_000

// Capped exponential backoff: 1s, 2s, 4s ... 30s. After MAX_RETRIES the
// channel idles — the site works fine without realtime and we stop burning
// cycles on an unreachable socket.
const backoffMs = () => Math.min(1000 * 2 ** attempts, MAX_BACKOFF_MS)

const scheduleRetry = () => {
  if (attempts >= MAX_RETRIES) return
  attempts++
  if (retryTimer) clearTimeout(retryTimer)
  retryTimer = setTimeout(() => {
    retryTimer = null
    if (syncChannel) {
      syncChannel.unsubscribe()
      syncChannel = null
    }
    syncChannel = buildSyncChannel()
  }, backoffMs())
}

// Coalesce bursts of realtime events into a single refetch per key, so e.g. an
// admin renaming 15 trips doesn't fire 15 cache invalidations. `null` marks a
// role-affecting change that should invalidate the whole cache.
let pending: Array<null | string> = []
let flushTimer: null | ReturnType<typeof setTimeout> = null

const scheduleInvalidate = (keys: Array<null | string>) => {
  for (const key of keys) {
    if (!pending.includes(key)) pending.push(key)
  }
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    const batch = pending
    pending = []
    if (batch.includes(null)) {
      queryClient.invalidateQueries()
      return
    }
    for (const key of batch as string[]) {
      queryClient.invalidateQueries({ queryKey: [key] })
    }
  }, 100)
}

export function initRealtimeSync(): RealtimeChannel {
  if (syncChannel) return syncChannel
  syncChannel = buildSyncChannel()
  return syncChannel
}

function buildSyncChannel(): RealtimeChannel {

  syncChannel = supabase
    .channel('public-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trips',
      },
      () => {
        scheduleInvalidate([
          ...queryKeys.travel.trips,
          ...queryKeys.travel.tripsWithImages,
          ...queryKeys.admin.trips,
        ])
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'blog',
      },
      () => {
        scheduleInvalidate([
          ...queryKeys.blog.list,
          ...queryKeys.blog.postBase,
          ...queryKeys.blog.contentBase,
        ])
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'guestbook',
      },
      () => {
        scheduleInvalidate([...queryKeys.guestbook.list, ...queryKeys.admin.guestbook])
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'work_people',
      },
      () => {
        scheduleInvalidate([...queryKeys.workPeople.list, ...queryKeys.admin.workPeople])
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quotes',
      },
      () => {
        scheduleInvalidate([...queryKeys.quotes, ...queryKeys.admin.quotes])
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_roles',
      },
      (payload) => {
        const record = payload.new as null | { role?: string; user_id?: string }
        const isCurrentUser = currentUser.value?.id && record?.user_id === currentUser.value.id
        if (isCurrentUser && record?.role && record.role !== currentUserRole.value) {
          currentUserRole.value = record.role
          scheduleInvalidate([null])
        }
        scheduleInvalidate([...queryKeys.admin.userRoles])
      },
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        attempts = 0
        return
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        // Degrade silently — the site is fully functional without realtime.
        // Log the drop once per session; retries stay quiet.
        if (!warnedDegrade) {
          warnedDegrade = true
          console.warn('[realtime] channel degraded:', status, err?.message ?? '')
        }
        scheduleRetry()
      }
    })

  return syncChannel
}
