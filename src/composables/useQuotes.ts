import { useQuery } from '@tanstack/vue-query'

import { queryKeys } from '@/queryKeys'
import { ensureSession, supabase } from '@/supabase'
import { parseDateColumn, throwIfError } from '@/utils'

import type { ClearanceLevel } from '@/composables/useTravel'

export interface Quote {
  clearance: ClearanceLevel
  content: string
  created_at?: string
  date: Date
  id: string
  title?: null | string
  updated_at?: string
}

export function useQuotes() {
  const {
    data: quotes,
    error,
    isLoading,
  } = useQuery<Quote[]>({
    queryFn: async () => {
      await ensureSession()

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('date', { ascending: false })

      throwIfError(error)

      return (data ?? []).map((row) => rowToQuote(row as Record<string, unknown>))
    },
    queryKey: queryKeys.quotes,
  })

  return { error, isLoading, quotes }
}

function rowToQuote(row: Record<string, unknown>): Quote {
  return {
    clearance: (row.clearance as ClearanceLevel) || 'public',
    content: (row.content as string) ?? '',
    created_at: row.created_at as string | undefined,
    date: parseDateColumn(row.date),
    id: row.id as string,
    title: (row.title as string) || null,
    updated_at: row.updated_at as string | undefined,
  }
}
