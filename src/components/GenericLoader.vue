<template>
  <div role="status" aria-label="Loading" class="flex h-full w-full items-center justify-center">
    <div
      class="size-5 animate-spin rounded-full border-2"
      :class="classes[theme || 'default']"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ theme?: 'dark' | 'default' }>()

const classes: Record<string, string> = {
  dark: 'border-light/20 border-t-light',
  default: 'border-border-high-contrast border-t-text-primary',
}
</script>
