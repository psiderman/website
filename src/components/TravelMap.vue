<template>
  <div ref="mapContainer" class="size-full bg-gray-950 dark:bg-zinc-950" />
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { isLightBoxOpen, lightBoxData } from '@/composables/useGlobal'
import { theme } from '@/composables/useTheme'

import type { TravelImage } from '@/composables/useTravel'
import type { Travel } from '@/data/travelCards'

import 'mapbox-gl/dist/mapbox-gl.css'

interface TravelWithImages extends Travel {
  images: TravelImage[]
}

const props = defineProps<{
  travelsWithImages: null | TravelWithImages[] | undefined
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: mapboxgl.Map | null = null
let markers: mapboxgl.Marker[] = []
let currentFeatures: any[] = []

function handleGlobalClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG' && target.closest('.tippy-box')) {
    const src = target.getAttribute('src')
    if (!src) return
    const feature = currentFeatures.find((f: any) => f.properties.imageUrl === src)
    if (feature) {
      const allUrls: string[] = JSON.parse(feature.properties.travelImages)
      const clickedUrl = feature.properties.imageUrl
      const ordered = [clickedUrl, ...allUrls.filter((u: string) => u !== clickedUrl)]
      lightBoxData.value = {
        description: feature.properties.travelDateLabel,
        images: ordered,
        title: feature.properties.travelTitle,
      }
      isLightBoxOpen.value = true
    }
  }
}

const isDarkTheme = computed(() => {
  return (
    theme.value === 'dark' ||
    (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
})

async function addMarkers() {
  if (!map) return
  clearMarkers()
  const geojson = buildGeoJSON(props.travelsWithImages ?? [])
  currentFeatures = (geojson as any).features

  if (currentFeatures.length === 0) return

  const bounds = new mapboxgl.LngLatBounds()

  for (const feature of currentFeatures) {
    const coords = feature.geometry.coordinates as [number, number]
    bounds.extend(coords)

    const { createApp, h } = await import('vue')
    const TravelMarker = (await import('@/components/TravelMarker.vue')).default
    const tooltip = (await import('@/directives/tooltip')).default

    const container = document.createElement('div')
    const markerApp = createApp(
      h(TravelMarker, {
        imageUrl: feature.properties.imageUrl,
        travelDateLabel: feature.properties.travelDateLabel,
        travelTitle: feature.properties.travelTitle,
      }),
    )

    markerApp.directive('tooltip', tooltip)
    markerApp.mount(container)

    const marker = new mapboxgl.Marker({ element: container }).setLngLat(coords).addTo(map)
    marker.getElement().addEventListener('click', () => {
      const allUrls: string[] = JSON.parse(feature.properties.travelImages)
      const clickedUrl = feature.properties.imageUrl
      const ordered = [clickedUrl, ...allUrls.filter((u: string) => u !== clickedUrl)]
      lightBoxData.value = {
        description: feature.properties.travelDateLabel,
        images: ordered,
        title: feature.properties.travelTitle,
      }
      isLightBoxOpen.value = true
    })
    markers.push(marker)
  }

  map.fitBounds(bounds, {
    maxZoom: 10,
    padding: 50,
    speed: 1.25,
  })
}

function buildGeoJSON(travels: TravelWithImages[]) {
  const features: Array<{
    geometry: { coordinates: [number, number]; type: 'Point' }
    properties: {
      imageUrl: string
      travelDateLabel: string
      travelImages: string
      travelTitle: string
    }
    type: 'Feature'
  }> = []

  for (const travel of travels) {
    for (const img of travel.images) {
      if (img.location.lat === null || img.location.lng === null) continue
      features.push({
        geometry: { coordinates: [img.location.lng, img.location.lat], type: 'Point' },
        properties: {
          imageUrl: img.url,
          travelDateLabel: travel.dateLabel,
          travelImages: JSON.stringify(travel.images.map((i) => i.url)),
          travelTitle: travel.title,
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

onMounted(() => {
  initMap()
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  clearMarkers()
  map?.remove()
  map = null
  document.removeEventListener('click', handleGlobalClick)
})

watch(
  () => props.travelsWithImages,
  () => addMarkers(),
  { deep: true },
)

watch(isDarkTheme, (dark) => {
  if (!map || !map.isStyleLoaded()) return
  map.setConfigProperty('basemap', 'lightPreset', dark ? 'night' : 'day')
})
</script>

<style>
a.mapboxgl-ctrl-logo.mapboxgl-compact {
  display: hidden !important;
  opacity: 0 !important;
}

.mapboxgl-marker,
.mapboxgl-marker * {
  cursor: pointer !important;
}

.tippy-box img {
  cursor: pointer !important;
}
</style>
