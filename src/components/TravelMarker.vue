<template>
  <div
    v-tooltip="{
      content: () => tooltipContent,
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
  >
    <Star v-if="isHighClearance(clearance)" :size="10" fill="#fff" stroke-width="0" />
  </div>
</template>

<script setup lang="ts">
import { Star } from '@lucide/vue'

import { isLightBoxOpen, lightBoxData } from '@/composables/useGlobal'
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

function onTooltipMount(instance: Instance) {
  instance.popper.querySelector('img')?.addEventListener('click', () => {
    instance.hide()
    openLightbox()
  })
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

  lightBoxData.value = {
    description: props.travel?.subtitle || '',
    images: orderedImages,
    title: props.travel?.title || props.caption || '',
  }
  isLightBoxOpen.value = true
}

const tooltipContent = `
  <div class="bg-light border-light outline-dark/10 rounded-special flex w-fit flex-col items-center border-4 shadow-xl outline">
    <div class="bg-dark max-h-[calc(50svh-40px)] overflow-hidden rounded-lg flex items-center justify-center">
      <img src="${props.thumbnailUrl || props.imageUrl}"
           data-src="${props.imageUrl}"
           onload="if(!this.dataset.preloading && this.src !== this.dataset.src) { this.dataset.preloading = 'true'; const img = new Image(); img.onload = () => { this.src = img.src; }; img.src = this.dataset.src; }"
           ${props.width ? `width="${props.width}"` : ''}
           ${props.height ? `height="${props.height}"` : ''}
           style="${props.width && props.height ? `aspect-ratio: ${props.width}/${props.height};` : ''}"
           class="bg-dark overflow-hidden max-h-[calc(50svh-40px)] rounded-lg object-contain" />
    </div>
    <div class="text-p font-handwriting flex w-0 min-w-full flex-col items-center justify-center p-3 text-center align-middle text-gray-700 dark:text-zinc-700">
      <p class="line-clamp-3 w-full whitespace-normal leading-tight">${props.caption ? `“${props.caption}”` : '&nbsp;'}</p>
    </div>
  </div>
`
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
