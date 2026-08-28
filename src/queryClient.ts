import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core'
import { QueryCache, QueryClient } from '@tanstack/vue-query'

import { supabase } from '@/supabase'

const PERSIST_PREFIX = 'tanstack-query'

// Query data that is scoped to the current authenticated user. A 401/PGRST303
// on one of these means the session is genuinely dead — sign out. Errors on
// public queries (home cards, movies, now, spotify, guestbook) must NOT log
// the user out, since those can fail transiently while a session is fine.
const AUTH_SCOPED_PREFIXES = [
  'trips',
  'trip-images',
  'trips-with-images',
  'admin',
  'now-posts',
  'now-images',
  'now-markdown',
]

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
    onError: (error: unknown, query: { queryKey: readonly unknown[] }) => {
      // Only force a sign-out when an auth-scoped query hits an auth error
      if (error && typeof error === 'object') {
        const err = error as { code?: string; message?: string; status?: number }
        const isAuthError =
          err.code === 'PGRST303' || err.message === 'JWT expired' || err.status === 401
        if (isAuthError && isAuthScoped(query.queryKey)) {
          supabase.auth.signOut()
        }
      }
    },
  }),
})

/**
 * Drop all cached query data, including the localStorage persistence layer.
 * Used on sign-out so a different user never sees the previous user's data.
 */
export function clearPersistedCache() {
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(PERSIST_PREFIX))
  keys.forEach((k) => window.localStorage.removeItem(k))
  queryClient.clear()
  void persister.removeQueries()
}

function isAuthScoped(key: readonly unknown[]): boolean {
  return typeof key[0] === 'string' && AUTH_SCOPED_PREFIXES.indexOf(key[0]) !== -1
}

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
