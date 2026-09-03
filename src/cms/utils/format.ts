import { format } from 'date-fns'

export function formatBlogDate(dateStr: null | string) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'dd MMMM yyyy')
  } catch {
    return dateStr
  }
}

export function formatImageDate(dateStr: null | string | undefined): string {
  if (!dateStr) return 'No date recorded'
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, HH:mm')
  } catch {
    return dateStr
  }
}

export function formatImageGps(lat: null | number | undefined, lng: null | number | undefined) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return 'No location recorded'
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

export function formatQuoteDate(dateStr: null | string) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'dd MMMM yyyy')
  } catch {
    return dateStr
  }
}

export function formatTripDate(dateStr?: null | string) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'MMMM yyyy')
  } catch {
    return dateStr
  }
}

export function formatVisited(iso?: string) {
  return iso ? format(new Date(iso), 'MMM d · HH:mm') : '—'
}
