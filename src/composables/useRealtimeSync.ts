import { currentUser, currentUserRole } from '@/composables/useAuth'
import { queryClient } from '@/queryClient'
import { supabase } from '@/supabase'

import type { RealtimeChannel } from '@supabase/supabase-js'

let syncChannel: null | RealtimeChannel = null

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
        scheduleInvalidate(['trips', 'trips-with-images', 'admin-trips'])
      },
    )
.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'now',
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ['now-posts'] })
        queryClient.invalidateQueries({ queryKey: ['now-markdown'] })
        queryClient.invalidateQueries({ queryKey: ['now-images'] })
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
        queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
        queryClient.invalidateQueries({ queryKey: ['blog-post'] })
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
        scheduleInvalidate(['guestbook', 'admin-guestbook'])
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
        scheduleInvalidate(['work-people', 'admin-work-people'])
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
        scheduleInvalidate(['admin-user-roles'])
      },
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') return
      console.warn('[realtime] channel not subscribed:', status, err?.message ?? '')
    })

  return syncChannel
}