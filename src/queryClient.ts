import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core'
import { QueryCache, QueryClient } from '@tanstack/vue-query'

import { supabase } from '@/supabase'

const persister = experimental_createQueryPersister({
  maxAge: 1000 * 60 * 60 * 12, // 12 hours
  storage: window.localStorage,
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      persister: persister.persisterFn,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      // If we get an unauthorized error or a JWT expired error from Supabase, automatically sign out
      if (error?.code === 'PGRST303' || error?.message === 'JWT expired' || error?.status === 401) {
        supabase.auth.signOut()
      }
    },
  }),
})

// Set immediate fetch / no caching for all admin queries
const adminKeys = [
  ['admin-user-roles'],
  ['admin-work-people'],
  ['admin-trips'],
  ['admin-images'],
  ['admin-guestbook'],
  ['admin'],
]

adminKeys.forEach((key) => {
  queryClient.setQueryDefaults(key, {
    gcTime: 0,
    persister: undefined,
    staleTime: 0,
  })
})

