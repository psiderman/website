<template>
  <button class="theme-toggle btn stroke p-0.75">
    <div
      :class="{
        'bg-surface-inverted text-text-inverted-primary rounded-full': theme === 'dark',
      }"
      class="cursor-pointer"
      @click="setTheme('dark')"
    >
      <Moon :size="16" />
    </div>
    <div
      :class="{
        'bg-surface-inverted text-text-inverted-primary rounded-full': theme === 'light',
      }"
      class="cursor-pointer"
      @click="setTheme('light')"
    >
      <Sun :size="16" />
    </div>
    <divå
      :class="{
        'bg-surface-inverted text-text-inverted-primary rounded-full': theme === 'system',
      }"
      class="cursor-pointer"
      @click="setTheme('system')"
    >
      <Monitor :size="16" />
    </divå>
  </button>
</template>

<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'

import { setTheme, theme } from '../composables/useTheme'
</script>

<style scoped>
@reference "@/style.css";
åå button.theme-toggle > div {
  @apply flex size-8 items-center justify-center p-2;
}
</style>
