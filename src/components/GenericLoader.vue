<template>
  <div class="flex h-full w-full items-center justify-center">
    <div
      class="size-5 animate-spin rounded-full border-2"
      :class="classes[theme || 'default']"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ theme?: 'dark' | 'default' | 'light' }>()

const classes: Record<string, string> = {
  dark: 'border-surface-inverted-primary border-t-surface-primary',
  default: 'border-border-high-contrast border-t-text-primary',
  light: 'border-border-primary border-t-text-tertiary',
}
</script>
