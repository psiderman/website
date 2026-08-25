<template>
  <div
    class="bg-dark/70 flex rounded-full p-1 backdrop-blur-xs transition-opacity duration-200"
    :class="[
      orientation === 'vertical'
        ? 'w-4 flex-col items-center gap-1'
        : 'h-4 flex-row items-center gap-1',
    ]"
  >
    <!-- The sliding active pill -->
    <div
      class="bg-light absolute z-10 rounded-full shadow-sm transition-all duration-200 ease-in-out"
      :class="[orientation === 'vertical' ? 'mt-1 h-4 w-2' : 'ml-1 h-2 w-4']"
      :style="activeStyle"
    ></div>

    <!-- The background dots -->
    <div
      v-for="(_, index) in count"
      :key="index"
      class="bg-light h-2 w-2 rounded-full transition-all duration-200 ease-in-out"
      :class="[
        index === activeIndex ? 'opacity-0' : 'opacity-40',
        index === activeIndex && orientation === 'vertical' ? 'h-4' : '',
        index === activeIndex && orientation === 'horizontal' ? 'w-4' : '',
      ]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    activeIndex: number
    count: number
    orientation?: 'horizontal' | 'vertical'
  }>(),
  {
    orientation: 'vertical',
  },
)

const activeStyle = computed(() => {
  if (props.orientation === 'vertical') {
    return { top: `${props.activeIndex * 12}px` }
  } else {
    return { left: `${props.activeIndex * 12}px` }
  }
})
</script>

<style scoped>
@reference "@/style.css";
</style>
