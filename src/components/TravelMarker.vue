<template>
  <div
    v-tooltip="{
      content: tooltipContent,
      hideOnClick: false,
      allowHTML: true,
      theme: 'tippy-map',
      offset: [0, 0],
      interactive: true,
    }"
    class="border-light flex size-6 cursor-default items-center justify-center rounded-full border-3"
    :class="
      closeFriends
        ? 'bg-green-500 outline-8 outline-green-500/35'
        : 'bg-red-500 outline-8 outline-red-500/25 dark:bg-red-700 dark:outline-red-500/35'
    "
  >
    <Star v-if="closeFriends" :size="14" fill="#fff" stroke-width="0" />
  </div>
</template>

<script setup lang="ts">
import { Star } from '@lucide/vue'

interface Props {
  caption?: null | string
  closeFriends: boolean
  imageUrl: string
}
const props = defineProps<Props>()

const tooltipContent = `
  <div class="bg-light border-light outline-dark/10 rounded-special flex w-fit flex-col items-center border-4 shadow-xl outline">
    <img src="${props.imageUrl}" class="bg-dark max-h-[calc(50svh-40px)] w-auto rounded-lg object-contain" />
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
