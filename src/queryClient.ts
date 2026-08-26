import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core'
import { QueryClient } from '@tanstack/vue-query'

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
})
