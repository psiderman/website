const DEFAULT_CENTER: [number, number] = [77.589, 12.9763]
const CACHE_KEY = 'psider_user_coords'

let locationPromise: null | Promise<[number, number]> = null

export async function getUserLocation(): Promise<[number, number]> {
  return preloadUserLocation()
}

export function preloadUserLocation(): Promise<[number, number]> {
  if (locationPromise) return locationPromise

  locationPromise = (async (): Promise<[number, number]> => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (
          Array.isArray(parsed) &&
          parsed.length === 2 &&
          typeof parsed[0] === 'number' &&
          typeof parsed[1] === 'number'
        ) {
          return parsed as [number, number]
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1000)

      const res = await fetch('https://ipwho.is/', {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) return DEFAULT_CENTER

      const data = await res.json()
      if (data.success && typeof data.longitude === 'number' && typeof data.latitude === 'number') {
        const coords: [number, number] = [data.longitude, data.latitude]
        localStorage.setItem(CACHE_KEY, JSON.stringify(coords))
        return coords
      }

      return DEFAULT_CENTER
    } catch {
      return DEFAULT_CENTER
    }
  })()

  return locationPromise
}
