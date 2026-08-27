<template>
  <div ref="mapContainer" class="size-full bg-gray-950 dark:bg-zinc-950" />
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import { type App, computed, createApp, h, onMounted, onUnmounted, ref, watch } from 'vue'

import TravelMarker from '@/components/TravelMarker.vue'
import { theme } from '@/composables/useTheme'
import tooltip from '@/directives/tooltip'

import type { TravelImage, Trip } from '@/composables/useTravel'

import 'mapbox-gl/dist/mapbox-gl.css'

interface TravelWithImages extends Trip {
  images: TravelImage[]
}

const props = defineProps<{
  activeTripSlug?: null | string
  travelsWithImages: null | TravelWithImages[] | undefined
}>()

const emit = defineEmits<{
  (e: 'markerClick', slug: string): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: mapboxgl.Map | null = null
let markers: mapboxgl.Marker[] = []
let markerApps: App[] = []
let currentFeatures: any[] = []

const isDarkTheme = computed(() => {
  return (
    theme.value === 'dark' ||
    (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
})

function addMarkers() {
  if (!map) return
  clearMarkers()
  const geojson = buildGeoJSON(props.travelsWithImages ?? [])
  currentFeatures = (geojson as any).features

  if (currentFeatures.length === 0) return

  const bounds = new mapboxgl.LngLatBounds()

  for (const feature of currentFeatures) {
    const coords = feature.geometry.coordinates as [number, number]
    bounds.extend(coords)

    const container = document.createElement('div')
    const markerApp = createApp(
      h(TravelMarker, {
        caption: feature.properties.caption,
        clearance: feature.properties.clearance,
        height: feature.properties.height,
        imageUrl: feature.properties.imageUrl,
        thumbnailUrl: feature.properties.thumbnailUrl,
        travel: feature.properties.travel,
        width: feature.properties.width,
      }),
    )

    markerApp.directive('tooltip', tooltip)
    markerApp.mount(container)
    markerApps.push(markerApp)

    const marker = new mapboxgl.Marker({ element: container }).setLngLat(coords).addTo(map)
    const el = marker.getElement()
    el.style.zIndex =
      feature.properties.clearance && feature.properties.clearance !== 'public' ? '1' : '2'
    el.setAttribute('tabindex', '0')
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', feature.properties.caption || 'Travel location marker')
    el.addEventListener('click', () => {
      emit('markerClick', feature.properties.slug)
    })
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        emit('markerClick', feature.properties.slug)
      }
    })
    markers.push(marker)
  }

  map.fitBounds(bounds, {
    maxZoom: 10,
    padding: getMapPadding(),
    speed: 1.25,
  })
}

function buildGeoJSON(travels: TravelWithImages[]) {
  const features: Array<{
    geometry: { coordinates: [number, number]; type: 'Point' }
    properties: {
      caption: null | string
      clearance: TravelImage['clearance']
      height: null | number
      imageUrl: string
      slug: string
      thumbnailUrl: string
      travel: TravelWithImages
      travelImages: string
      width: null | number
    }
    type: 'Feature'
  }> = []

  for (const travel of travels) {
    for (const img of travel.images) {
      if (img.location.lat === null || img.location.lng === null) continue
      features.push({
        geometry: { coordinates: [img.location.lng, img.location.lat], type: 'Point' },
        properties: {
          caption: img.caption,
          clearance: img.clearance,
          height: img.height,
          imageUrl: img.url,
          slug: travel.slug,
          thumbnailUrl: img.thumbnailUrl,
          travel,
          travelImages: JSON.stringify(
            travel.images.map((i) => ({ clearance: i.clearance, url: i.url })),
          ),
          width: img.width,
        },
        type: 'Feature',
      })
    }
  }
  return { features, type: 'FeatureCollection' } as const
}

function clearMarkers() {
  markers.forEach((m) => m.remove())
  markers = []
  markerApps.forEach((app) => app.unmount())
  markerApps = []
}

function getMapPadding() {
  const isDesktop = window.matchMedia('(min-width: 1280px)').matches
  return isDesktop ? 50 : { bottom: 350, left: 50, right: 50, top: 50 }
}

function initMap() {
  if (!mapContainer.value) return
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  map = new mapboxgl.Map({
    attributionControl: false,
    center: [77.589, 12.9763],
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/standard',
    zoom: 10,
  })
  map.on('style.load', () => {
    map!.setConfigProperty('basemap', 'lightPreset', isDarkTheme.value ? 'night' : 'day')
  })
  map.on('load', () => {
    addMarkers()
  })
}

function zoomToTrip(slug: null | string | undefined) {
  if (!map || !props.travelsWithImages) return

  if (!slug) {
    // Zoom back out to fit all travels
    const bounds = new mapboxgl.LngLatBounds()
    let hasCoords = false
    for (const travel of props.travelsWithImages) {
      for (const img of travel.images) {
        if (img.location.lat !== null && img.location.lng !== null) {
          bounds.extend([img.location.lng, img.location.lat])
          hasCoords = true
        }
      }
    }
    if (hasCoords) {
      map.fitBounds(bounds, {
        maxZoom: 10,
        padding: getMapPadding(),
        speed: 2,
      })
    }
    return
  }

  const travel = props.travelsWithImages.find((t) => t.slug === slug)
  if (!travel) return

  const bounds = new mapboxgl.LngLatBounds()
  let hasCoords = false
  for (const img of travel.images) {
    if (img.location.lat !== null && img.location.lng !== null) {
      bounds.extend([img.location.lng, img.location.lat])
      hasCoords = true
    }
  }

  if (hasCoords) {
    map.fitBounds(bounds, {
      maxZoom: 15,
      padding: getMapPadding(),
      speed: 2,
    })
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  clearMarkers()
  map?.remove()
  map = null
})

watch(
  () => props.travelsWithImages,
  () => addMarkers(),
)

watch(
  () => props.activeTripSlug,
  (newSlug) => {
    zoomToTrip(newSlug)
  },
)

watch(isDarkTheme, (dark) => {
  if (!map || !map.isStyleLoaded()) return
  map.setConfigProperty('basemap', 'lightPreset', dark ? 'night' : 'day')
})
</script>

<style>
.mapboxgl-marker,
.mapboxgl-marker * {
  cursor: pointer !important;
}

.tippy-box img {
  cursor: pointer !important;
}
</style>
