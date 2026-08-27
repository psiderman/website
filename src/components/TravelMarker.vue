<template>
  <div
    v-tooltip="{
      content: () => tooltipContent,
      hideOnClick: false,
      allowHTML: true,
      theme: 'tippy-map',
      offset: [0, 0],
      interactive: true,
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

import { isHighClearance } from '@/composables/useTravel'

import type { ClearanceLevel } from '@/composables/useTravel'

interface Props {
  caption?: null | string
  clearance?: ClearanceLevel
  height?: null | number
  imageUrl: string
  thumbnailUrl?: string
  width?: null | number
}
const props = defineProps<Props>()

const tooltipContent = `
  <div class="bg-light border-light outline-dark/10 rounded-special flex w-fit flex-col items-center border-4 shadow-xl outline">
    <img src="${props.thumbnailUrl || props.imageUrl}"
         data-src="${props.imageUrl}"
         onload="if(this.src !== this.dataset.src) { this.src = this.dataset.src; this.style.filter = 'blur(15px)'; } else { this.style.filter = 'none'; }"
         ${props.width ? `width="${props.width}"` : ''}
         ${props.height ? `height="${props.height}"` : ''}
         style="filter: blur(15px); transition: filter 0.3s ease-out; ${props.width && props.height ? `aspect-ratio: ${props.width}/${props.height};` : ''}"
         class="bg-dark max-h-[calc(50svh-40px)] w-auto rounded-lg object-contain" />
    <div class="text-p font-handwriting flex w-0 min-w-full flex-col items-center justify-center p-3 text-center align-middle text-gray-700 dark:text-zinc-700">
      <p class="line-clamp-3 w-full whitespace-normal leading-tight">${props.caption || '&nbsp;'}</p>
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
