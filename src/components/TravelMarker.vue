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
  closeFriends: boolean
  imageUrl: string
}
const props = defineProps<Props>()

const tooltipContent = `
  <div class="flex flex-col justify-center items-center border-light h-full w-full outline-dark/10 rounded-special border-4 shadow-xl outline">
    <img src="${props.imageUrl}" class="max-h-[calc(50svh-40px)] w-full h-full object-cover rounded-lg" />
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
