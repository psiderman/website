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
    class="border-light size-5 cursor-default rounded-full border-3 bg-red-500 outline-8 outline-red-500/25 dark:bg-red-700"
  />
</template>

<script setup lang="ts">
interface Props {
  imageUrl: string
  travelDateLabel: string
  travelTitle: string
}
const props = defineProps<Props>()

const tooltipContent = `
  <div class="flex flex-col justify-center items-center border-light h-full w-full outline-dark/10 rounded-lg border-4 shadow-md outline">
    <img src="${props.imageUrl}" class="max-h-[calc(50svh-40px)] w-full h-full object-cover rounded" />
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
