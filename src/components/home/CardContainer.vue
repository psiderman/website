<template>
  <component
    :is="link ? 'button' : 'div'"
    :data-sync="'card-' + title.toLowerCase().replace(/\s+/g, '-')"
    class="border-border-primary bg-surface-primary pointer-events-auto flex flex-col gap-2 rounded-xl border p-2 transition-colors duration-200"
    :class="[heightClass, { clickable: link }]"
    @click="handleClick"
  >
    <div
      class="relative flex h-full w-full grow items-center justify-center overflow-hidden rounded-lg"
      :class="bgClass || 'bg-background'"
    >
      <img
        v-if="img"
        :src="img"
        :alt="title"
        class="pointer-events-none h-3/5 w-auto"
        width="160"
        height="160"
      />
      <slot :is-icon-hovered="isIconHovered" />
    </div>
    <div
      class="text-text-primary text-ui flex shrink-0 flex-row items-center justify-between px-2 py-1"
    >
      <span>{{ title }}</span>
      <div
        v-if="icon"
        aria-hidden="true"
        class="focus-within:outline-surface-inverted flex size-6 h-full shrink-0 items-center justify-center rounded-full"
        :tabindex="arrow === 'help' ? 0 : -1"
        @focus="isIconHovered = true"
        @blur="isIconHovered = false"
        @mouseenter="isIconHovered = true"
        @mouseleave="isIconHovered = false"
      >
        <component :is="icon" :size="16" />
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { ArrowRight, ArrowUpRight, CircleHelp } from '@lucide/vue'
import { computed, ref } from 'vue'

import router from '@/router'
import { openLink } from '@/utils'

interface Props {
  arrow?: 'external' | 'help' | 'none' | 'right'
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
    help: CircleHelp,
    none: null,
    right: ArrowRight,
  }
  return icons[props.arrow]
})

const isIconHovered = ref(false)

const heightClass = computed(() => {
  const heights = {
    lg: 'h-124 row-span-2 desktop:row-span-3',
    md: 'h-80 row-span-2',
    sm: 'h-36 row-span-1',
  }
  return heights[props.size]
})

const handleClick = () => {
  if (!props.link) return

  if (props.link.startsWith('http')) {
    openLink(props.link)
  } else {
    router.push(props.link)
  }
}
</script>

<style scoped>
@reference "@/style.css";

button.clickable {
  @apply cursor-pointer hover:shadow-sm;
}
</style>
