<template>
  <button
    v-tooltip="{ content: `theme: ${theme}`, group: 'header-right' }"
    aria-label="Toggle theme"
    class="btn stroke icon-only relative overflow-hidden"
    @click="cycleTheme"
  >
    <Transition name="slide-up">
      <div :key="theme" class="absolute inset-0 flex items-center justify-center">
        <MonitorCog v-if="theme === 'system'" :size="16" />
        <Sun v-else-if="theme === 'light'" :size="16" />
        <Moon v-else-if="theme === 'dark'" :size="16" />
      </div>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { MonitorCog, Moon, Sun } from '@lucide/vue'

import { setTheme, theme } from '../composables/useTheme'

const cycleTheme = () => {
  if (theme.value === 'system') setTheme('light')
  else if (theme.value === 'light') setTheme('dark')
  else setTheme('system')
}
</script>

<style scoped>
@reference "@/style.css";

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
