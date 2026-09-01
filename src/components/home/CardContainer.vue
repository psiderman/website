<template>
  <component
    :is="link ? 'button' : 'div'"
    :data-sync="'card-' + title.toLowerCase().replace(/\s+/g, '-')"
    :tabindex="link || focusable ? 0 : -1"
    :role="link || focusable ? 'button' : undefined"
    class="border-border-primary bg-surface-primary pointer-events-auto flex flex-col gap-2 rounded-xl border p-2 transition-colors duration-200"
    :class="[heightClass, { clickable: link || focusable }]"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div
      class="relative flex size-full grow items-center justify-center overflow-hidden rounded-lg"
      :class="bgClass || 'bg-background'"
    >
      <img
        v-if="img"
        v-lazy="img"
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
        class="size-6 h-full shrink-0 items-center justify-center rounded-full"
        :class="[
          arrow === 'help' ? 'desktop:flex focus-within:outline-surface-inverted hidden' : 'flex',
        ]"
      >
        <component
          :is="icon"
          v-if="arrow !== 'help'"
          :size="16"
          aria-hidden="true"
          class="pointer-events-none"
        />
        <button
          v-else
          type="button"
          aria-label="Toggle card help"
          class="focus:outline-surface-inverted desktop:flex hidden size-6 items-center justify-center rounded-full focus:outline-2 focus:outline-offset-2"
          @focus="isIconHovered = true"
          @blur="isIconHovered = false"
          @mouseenter="isIconHovered = true"
          @mouseleave="isIconHovered = false"
          @click.stop.prevent="isIconHovered = !isIconHovered"
        >
          <component :is="icon" :size="16" aria-hidden="true" />
        </button>
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
  focusable?: boolean
  img?: string
  link?: string
  size: 'lg' | 'md' | 'sm'
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  arrow: 'right',
  focusable: false,
})

const emit = defineEmits<{
  (e: 'activate'): void
}>()

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
    lg: 'h-80 desktop:h-124 row-span-2 desktop:row-span-3',
    md: 'h-80 row-span-2',
    sm: 'h-36 row-span-1',
  }
  return heights[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (!props.link) return

  // Respect cmd/ctrl/shift/alt + click and middle-click: open in a new tab.
  const newTab =
    event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1

  if (props.link.startsWith('http')) {
    openLink(props.link)
  } else if (newTab) {
    const url = router.resolve(props.link).href
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener')
  } else {
    router.push(props.link)
  }
}

// Keyboard activation for link-less (focusable) cards. Native <button> roots
// already fire click on Enter/Space, so only handle the div path here.
const handleKeydown = (event: KeyboardEvent) => {
  if (props.link || !props.focusable) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('activate')
  }
}
</script>

<style scoped>
@reference "@/style.css";

button.clickable {
  @apply cursor-pointer hover:shadow-sm;
}

.clickable {
  @apply focus-visible:ring-surface-inverted focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none;
}
</style>
