import { currentUser, currentUserRole } from '@/composables/useAuth'
import { queryClient } from '@/queryClient'
import { supabase } from '@/supabase'

import type { RealtimeChannel } from '@supabase/supabase-js'

let syncChannel: null | RealtimeChannel = null

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
        queryClient.invalidateQueries({ queryKey: ['trips'] })
        queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
        queryClient.invalidateQueries({ queryKey: ['admin-trips'] })
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
        table: 'guestbook',
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ['guestbook'] })
        queryClient.invalidateQueries({ queryKey: ['admin-guestbook'] })
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
        queryClient.invalidateQueries({ queryKey: ['work-people'] })
        queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_roles',
      },
      (payload) => {
        const record = payload.new as null | { role?: string; user_id?: string }
        if (currentUser.value?.id && record?.user_id === currentUser.value.id) {
          if (record.role && record.role !== currentUserRole.value) {
            currentUserRole.value = record.role
            queryClient.invalidateQueries()
          }
        }
        queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
      },
    )
    .subscribe()

  return syncChannel
}
