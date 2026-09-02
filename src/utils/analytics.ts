import { currentUser } from '@/composables/useAuth'

declare global {
  interface Window {
    umami?: {
      identify?: (sessionData: Record<string, unknown> | string) => void
      track?: (
        eventNameOrCustomData?: Record<string, unknown> | string,
        data?: Record<string, unknown>,
      ) => void
    }
  }
}

export interface TrackOptions {
  /** When true, bypasses session deduplication and always sends the event */
  force?: boolean
  /** Custom unique key for deduplication. Defaults to `${eventName}:${JSON.stringify(data)}` */
  onceKey?: string
}

const sessionTrackedEvents = new Set<string>()

if (typeof window !== 'undefined') {
  try {
    const saved = sessionStorage.getItem('umami_tracked_events')
    if (saved) {
      const parsed = JSON.parse(saved) as string[]
      parsed.forEach((k) => sessionTrackedEvents.add(k))
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Associates the current Umami session with a user ID.
 */
export function identifyUser(userId?: string) {
  const uid = userId ?? currentUser.value?.id
  if (typeof window !== 'undefined' && window.umami?.identify && uid) {
    window.umami.identify({ userId: uid })
  }
}

/**
 * Tracks a custom Umami analytics event once per session by default.
 * Use `options.force = true` or `trackEvent(name, data, true)` to override deduplication.
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, unknown>,
  options?: boolean | TrackOptions,
) {
  if (typeof window === 'undefined') return

  const isForce = typeof options === 'boolean' ? options : !!options?.force
  const customKey = typeof options === 'object' ? options?.onceKey : undefined
  const dedupKey = customKey || `${eventName}:${JSON.stringify(data || {})}`

  if (!isForce && sessionTrackedEvents.has(dedupKey)) {
    return
  }

  sessionTrackedEvents.add(dedupKey)
  persistTrackedEvents()

  const payload: Record<string, unknown> = { ...data }
  if (currentUser.value?.id) {
    payload.userId = currentUser.value.id
  }

  if (window.umami?.track) {
    window.umami.track(eventName, payload)
  }
}

function persistTrackedEvents() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        'umami_tracked_events',
        JSON.stringify(Array.from(sessionTrackedEvents)),
      )
    } catch {
      // ignore storage errors
    }
  }
}
