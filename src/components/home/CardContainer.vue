<template>
  <div
    class="outline-border-primary bg-surface-primary flex flex-col gap-2 rounded-xl p-2 outline"
    :class="heightClass"
  >
    <div class="bg-background h-full w-full grow overflow-hidden rounded-lg">
      <slot />
    </div>
    <div
      class="text-text-primary text-ui flex shrink-0 flex-row items-center justify-between px-2 py-1"
    >
      <span>{{ title }}</span>
      <component :is="icon" v-if="icon" :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from '@lucide/vue'
import { computed } from 'vue'

interface Props {
  arrow?: 'external' | 'none' | 'right'
  size: 'lg' | 'md' | 'sm'
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  arrow: 'right',
})

const icon = computed(() => {
  const icons = {
    external: ArrowUpRight,
    none: null,
    right: ArrowRight,
  }
  return icons[props.arrow]
})

const heightClass = computed(() => {
  const heights = {
    lg: 'h-124 row-span-3',
    md: 'h-80 row-span-2',
    sm: 'h-36 row-span-1',
  }
  return heights[props.size]
})
</script>
