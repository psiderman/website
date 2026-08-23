<template>
  <button class="theme-toggle btn stroke relative p-0.75">
    <div
      class="bg-surface-inverted absolute -z-10 rounded-full transition-all duration-200 ease-in"
      :class="indicatorPos"
    ></div>
    <div
      :class="{
        'text-text-inverted-primary rounded-full': theme === 'dark',
      }"
      class="cursor-pointer"
      @click="setTheme('dark')"
    >
      <Moon :size="16" />
    </div>
    <div
      :class="{
        'text-text-inverted-primary rounded-full': theme === 'light',
      }"
      class="cursor-pointer"
      @click="setTheme('light')"
    >
      <Sun :size="16" />
    </div>
    <div
      :class="{
        'text-text-inverted-primary rounded-full': theme === 'system',
      }"
      class="cursor-pointer"
      @click="setTheme('system')"
    >
      <Monitor :size="16" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { computed } from 'vue'

import { setTheme, theme } from '../composables/useTheme'

const indicatorPos = computed(() => {
  if (theme.value === 'dark') return '-translate-x-10'
  if (theme.value === 'light') return 'translate-x-0'
  if (theme.value === 'system') return 'translate-x-10'
  return '-translate-x-10'
})
</script>

<style scoped>
@reference "@/style.css";
button.theme-toggle > div {
  @apply z-10 flex size-8 items-center justify-center p-2;
}

.stretch {
  animation: indicator-stretch 300ms ease-in-out 0ms;
}

@keyframe indicator-stretch {
  0% {
    width: 32px;
  }
  50% {
    width: 40px;
  }
  100% {
    width: 40px;
  }
}
</style>
