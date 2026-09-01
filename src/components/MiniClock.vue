<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke-width="2" />
    <line
      x1="12"
      y1="12"
      x2="12"
      y2="7"
      stroke-width="2"
      :transform="`rotate(${angles.hour} 12 12)`"
    />
    <line
      x1="12"
      y1="12"
      x2="12"
      y2="5"
      stroke-width="1.5"
      :transform="`rotate(${angles.minute} 12 12)`"
    />
    <line
      x1="12"
      y1="14"
      x2="12"
      y2="3.5"
      stroke-width="1"
      :transform="`rotate(${angles.second} 12 12)`"
    />
    <circle cx="12" cy="12" r="1.25" stroke="none" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: number
    time?: string
  }>(),
  {
    size: 16,
    time: '00:00:00',
  },
)

const angles = computed(() => {
  const [h = 0, m = 0, s = 0] = props.time.split(':').map(Number)
  return {
    hour: ((h % 12) + m / 60 + s / 3600) * 30,
    minute: (m + s / 60) * 6,
    second: s * 6,
  }
})
</script>
