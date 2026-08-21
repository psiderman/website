<template>
  <button
    class="outline-border-primary bg-surface-primary flex flex-col gap-2 rounded-xl p-2 outline"
    :class="[heightClass, { clickable: link }]"
    @click="handleClick"
  >
    <div
      class="relative flex h-full w-full grow items-center justify-center overflow-hidden rounded-lg"
      :class="bgClass || 'bg-background'"
    >
      <img v-if="img" :src="img" :alt="title" class="pointer-events-none h-3/5" />
      <slot />
    </div>
    <div
      class="text-text-primary text-ui flex shrink-0 flex-row items-center justify-between px-2 py-1"
    >
      <span>{{ title }}</span>
      <component :is="icon" v-if="icon" :size="16" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from '@lucide/vue'
import { computed } from 'vue'

import router from '@/router'

interface Props {
  arrow?: 'external' | 'none' | 'right'
  bgClass?: string
  img?: string
  link?: string
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

const handleClick = () => {
  if (!props.link) return

  if (props.link.startsWith('http')) {
    window.open(props.link, '_blank')
  } else {
    router.push(props.link)
  }
}
</script>

<style scoped>
@reference "@/style.css";

div.clickable {
  @apply origin-center cursor-pointer transition-all duration-200 hover:shadow-sm;
}
</style>
