import { parse } from 'date-fns'

export const openLink = (link?: null | string) => {
  if (link) window.open(link, '_blank')
}

/**
 * Parse a Postgres `date` column ("YYYY-MM-DD") as local midnight. Avoids the
 * UTC-midnight off-by-one that shifts dates a day early west of UTC.
 */
export function parseDateColumn(value: unknown): Date {
  return typeof value === 'string' && value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date()
}

/** Throw a supabase/any error if present, narrowing it to null afterwards. */
export function throwIfError(error: unknown): asserts error is null {
  if (error) throw error
}
