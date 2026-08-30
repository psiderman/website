<template>
  <component
    :is="as"
    v-tooltip="tooltipConfig"
    class="border-light flex shrink-0 items-center justify-center rounded-full bg-green-500 select-none"
    :class="[
      sizeClasses,
      border && size === 'sm' ? 'border shadow-sm' : '',
      border && size === 'md' ? 'border shadow-sm' : '',
      border && size === 'lg' ? 'border-2 shadow-md' : '',
    ]"
  >
    <Star :size="starSize" fill="#fff" stroke-width="0" />
  </component>
</template>

<script setup lang="ts">
import { Star } from '@lucide/vue'
import { computed } from 'vue'

interface Props {
  as?: string
  border?: boolean
  size?: 'lg' | 'md' | 'sm'
  tooltip?: boolean | string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  border: true,
  size: 'sm',
  tooltip: false,
})

const sizeClasses = computed(() => {
  if (props.size === 'lg') return 'size-6'
  if (props.size === 'md') return 'size-5'
  return 'size-4'
})

const starSize = computed(() => {
  if (props.size === 'lg') return 14
  if (props.size === 'md') return 12
  return 10
})

const tooltipConfig = computed(() => {
  if (!props.tooltip) return undefined
  const content = typeof props.tooltip === 'string' ? props.tooltip : 'you’re on “the list”'
  return {
    allowHTML: true,
    content,
  }
})
</script>
