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

let pendingIdentify: null | string = null
const pendingTracks: Array<{
  dedupKey: string
  eventName: string
  isForce: boolean
  payload: Record<string, unknown>
}> = []
let flushTimer: null | number = null
let flushAttempts = 0
const MAX_FLUSH_ATTEMPTS = 20 // 20 * 250ms = 5s max

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
 * Clears pending identification state.
 */
export function clearIdentify() {
  pendingIdentify = null
}

/**
 * Associates the current Umami session with a user ID.
 */
export function identifyUser(userId?: string) {
  const uid = userId ?? currentUser.value?.id
  if (typeof window === 'undefined' || !uid) return

  if (window.umami?.identify) {
    window.umami.identify({ userId: uid })
  } else {
    pendingIdentify = uid
    ensureFlushLoop()
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

  const payload: Record<string, unknown> = { ...data }
  if (currentUser.value?.id) {
    payload.userId = currentUser.value.id
  }

  if (window.umami?.track) {
    if (!isForce) {
      sessionTrackedEvents.add(dedupKey)
      persistTrackedEvents()
    }
    window.umami.track(eventName, payload)
  } else {
    pendingTracks.push({ dedupKey, eventName, isForce, payload })
    ensureFlushLoop()
  }
}

function ensureFlushLoop() {
  if (typeof window === 'undefined' || flushTimer !== null) return

  flushAttempts = 0
  flushTimer = window.setInterval(() => {
    flushAttempts += 1
    flushQueues()
  }, 250)
}

function flushQueues() {
  if (typeof window === 'undefined') return

  const hasSdk = typeof window.umami?.track === 'function'
  const hasIdentifySdk = typeof window.umami?.identify === 'function'

  if (hasSdk) {
    if (pendingIdentify && hasIdentifySdk) {
      window.umami!.identify!({ userId: pendingIdentify })
      pendingIdentify = null
    }
    while (pendingTracks.length > 0) {
      const item = pendingTracks.shift()
      if (item) {
        if (!item.isForce) {
          sessionTrackedEvents.add(item.dedupKey)
        }
        window.umami!.track!(item.eventName, item.payload)
      }
    }
    persistTrackedEvents()
  }

  if ((!pendingIdentify && pendingTracks.length === 0) || flushAttempts >= MAX_FLUSH_ATTEMPTS) {
    if (flushTimer !== null) {
      clearInterval(flushTimer)
      flushTimer = null
    }
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
