<template>
  <div
    v-tooltip="{
      content: () => buildTooltipContent(),
      hideOnClick: false,
      allowHTML: true,
      theme: 'tippy-map',
      offset: [0, 0],
      interactive: true,
      onMount: onTooltipMount,
    }"
    class="border-light flex size-4 cursor-default items-center justify-center rounded-full border-2"
    :class="
      isHighClearance(clearance)
        ? 'bg-green-500 outline-4 outline-green-500/35'
        : 'bg-red-500 outline-4 outline-red-500/25 dark:bg-red-700 dark:outline-red-500/35'
    "
    @click="openLightbox"
  >
    <Star v-if="isHighClearance(clearance)" :size="10" fill="#fff" stroke-width="0" />
  </div>
</template>

<script setup lang="ts">
import { Star } from '@lucide/vue'

import { isPhotoLightBoxOpen, photoLightBoxData } from '@/composables/useGlobal'
import { isHighClearance } from '@/composables/useTravel'

import type { ClearanceLevel, TravelImage, Trip } from '@/composables/useTravel'
import type { Instance } from 'tippy.js'

interface Props {
  caption?: null | string
  clearance?: ClearanceLevel
  height?: null | number
  imageUrl: string
  thumbnailUrl?: string
  travel?: Trip & { images: TravelImage[] }
  width?: null | number
}
const props = defineProps<Props>()

// Build tooltip content as a DOM Element so captions (DB-supplied) are
// assigned via textContent and images are preloaded programmatically —
// no inline `onload` handler, no HTML-string interpolation.
function buildTooltipContent(): Element {
  const wrap = document.createElement('div')
  wrap.className = 'p-0.5 bg-light rounded-lg shadow-lg overflow-hidden flex'

  const img = document.createElement('img')
  if (props.width && props.height) {
    img.style.aspectRatio = `${props.width}/${props.height}`
    img.className =
      props.width > props.height
        ? 'w-40 h-auto object-contain rounded-md block'
        : 'h-32 w-auto object-contain rounded-md block'
  } else {
    img.className = 'max-w-40 max-h-32 w-auto h-auto object-contain rounded-md block'
  }

  img.src = props.thumbnailUrl || props.imageUrl

  // Preload high-res in background and swap without layout shift
  if (props.thumbnailUrl && props.thumbnailUrl !== props.imageUrl) {
    const highRes = new Image()
    highRes.onload = () => {
      img.src = highRes.src
    }
    highRes.src = props.imageUrl
  }

  wrap.appendChild(img)

  return wrap
}

function onTooltipMount(instance: Instance) {
  instance.popper.querySelector('img')?.addEventListener(
    'click',
    () => {
      instance.hide()
      openLightbox()
    },
    { once: true },
  )
}

function openLightbox() {
  const images = props.travel?.images ?? [
    {
      caption: props.caption,
      clearance: props.clearance || 'public',
      height: props.height,
      id: props.imageUrl,
      thumbnailUrl: props.thumbnailUrl || props.imageUrl,
      url: props.imageUrl,
      width: props.width,
    },
  ]
  const idx = images.findIndex((img) => img.url === props.imageUrl)
  const startIdx = Math.max(0, idx)
  const orderedImages = [...images.slice(startIdx), ...images.slice(0, startIdx)]

  photoLightBoxData.value = {
    currentTripSlug: props.travel?.slug || '',
    images: orderedImages,
    initialIndex: 0,
    tripTitle: props.travel?.title || '',
  }
  isPhotoLightBoxOpen.value = true
}
</script>

<style>
@reference "@/style.css";

.tippy-box[data-theme~='tippy-map'] {
  @apply border-0 bg-transparent;

  &[data-placement^='top'] > .tippy-arrow::before {
    @apply border-t-0;
  }
  &[data-placement^='bottom'] > .tippy-arrow::before {
    @apply border-b-0;
  }
  &[data-placement^='left'] > .tippy-arrow::before {
    @apply border-l-0;
  }
  &[data-placement^='right'] > .tippy-arrow::before {
    @apply border-r-0;
  }

  & .tippy-content {
    @apply p-0!;
  }
}
</style>
