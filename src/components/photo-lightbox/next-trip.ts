import { computed } from 'vue'

import { photoLightBoxData } from '@/composables/useGlobal'
import { useTravelsWithImages } from '@/composables/useTravel'
import { trackEvent } from '@/utils/analytics'

import { currentIndex, resetStackState } from './state'

export function useNextTrip(params: {
  getCurrentTripSlug: () => string
  getTripTitle: () => string
  preloadAdjacentImages: () => void
}) {
  const { travelsWithImages } = useTravelsWithImages()

  const validTrips = computed(() => {
    return (travelsWithImages.value ?? []).filter((t) => t.images && t.images.length > 0)
  })

  const nextTrip = computed(() => {
    if (!params.getCurrentTripSlug()) return null
    const list = validTrips.value
    if (list.length === 0) return null
    const currentIdx = list.findIndex((t) => t.slug === params.getCurrentTripSlug())
    const nextIdx = currentIdx !== -1 && currentIdx < list.length - 1 ? currentIdx + 1 : 0
    return list[nextIdx] ?? null
  })

  const nextTripTitle = computed(() => {
    return nextTrip.value?.title ?? null
  })

  const nextTripThumbnails = computed(() => {
    const trip = nextTrip.value
    if (!trip || !trip.images || trip.images.length === 0) return []

    return trip.images
      .map((img) => img.thumbnailUrl || img.url)
      .filter(Boolean)
      .slice(0, 6) as string[]
  })

  const goToNextTrip = () => {
    const target = nextTrip.value
    if (!target) return

    trackEvent(
      'trip_lightbox_action',
      {
        action: 'next_trip',
        from_trip: params.getCurrentTripSlug(),
        to_trip: target.slug,
      },
      { force: true },
    )

    const targetImages = target.images.map((img) => ({
      caption: img.caption,
      clearance: img.clearance,
      height: img.height,
      thumbnailUrl: img.thumbnailUrl,
      url: img.url,
      width: img.width,
    }))

    photoLightBoxData.value = {
      currentTripSlug: target.slug,
      images: targetImages,
      initialIndex: 0,
      tripTitle: target.title,
    }

    startOver()
  }

  const startOver = () => {
    trackEvent(
      'trip_lightbox_action',
      {
        action: 'replay',
        trip_slug: params.getCurrentTripSlug(),
      },
      { force: true },
    )
    resetStackState()
    currentIndex.value = 0
    params.preloadAdjacentImages()
  }

  return { goToNextTrip, nextTrip, nextTripThumbnails, nextTripTitle, startOver }
}
