<template>
  <div v-if="global.allowMultiplayer.value" class="pointer-events-none absolute inset-0 z-50">
    <!-- Render each remote cursor -->
    <div
      v-for="cursor in renderCursors"
      :key="cursor.id"
      class="pointer-events-none absolute top-0 left-0 flex flex-col transition-all duration-1000 ease-linear"
      :class="{ 'opacity-30': cursor.isStale }"
      :style="{
        transform: `translate(${cursor.renderX}px, ${cursor.renderY}px)`,
      }"
    >
      <!-- Inner div floats via v-drift (non-reactive rAF), so Vue never
           re-renders the overlay on the 50ms drift tick -->
      <div v-drift="cursor.id" class="flex flex-col">
        <!-- Cursor Icon -->
        <MousePointer2
          :size="24"
          color="white"
          :fill="cursor.color.bg"
          class="drop-shadow-cursor"
          style="stroke-width: 2px"
        />
        <!-- Name Tag -->
        <div
          class="text-ui-small -mt-1 ml-5 rounded-lg px-1 py-0.5 font-semibold whitespace-nowrap shadow-lg"
          :style="{ backgroundColor: cursor.color.bg, color: cursor.color.fg }"
        >
          {{ cursor.name }}
        </div>
      </div>
    </div>

    <!-- Render each remote touch -->
    <TransitionGroup name="fade">
      <div
        v-for="touch in renderTouches"
        :key="touch.id"
        class="pointer-events-none absolute top-0 left-0 flex flex-col items-center justify-center transition-all duration-300"
        :class="{ 'opacity-30': touch.isStale }"
        :style="{
          transform: `translate(${touch.renderX}px, ${touch.renderY}px)`,
        }"
      >
        <!-- Pinging Circle -->
        <div
          class="absolute size-4 animate-ping rounded-full"
          :style="{ backgroundColor: touch.color.bg }"
          :class="{ hidden: touch.isStale }"
        ></div>
        <div
          class="absolute size-4 rounded-full opacity-75"
          :style="{ backgroundColor: touch.color.bg }"
        ></div>

        <!-- Name Tag -->
        <div
          class="text-ui-small mt-10 ml-10 flex flex-row items-center justify-center gap-0.5 rounded-lg px-1 py-0.5 font-semibold whitespace-nowrap shadow-lg"
          :style="{ backgroundColor: touch.color.bg, color: touch.color.fg }"
        >
          {{ touch.name }}
          <Smartphone :size="10" />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { MousePointer2, Smartphone } from '@lucide/vue'

import { global } from '@/composables/useGlobal'
import {
  registerDriftEl,
  renderCursors,
  renderTouches,
  unregisterDriftEl,
} from '@/composables/useLive'

import type { Directive } from 'vue'

// Local directive: attach a cursor layer element to the shared rAF drift
// loop, keyed by cursor id.
const vDrift: Directive<HTMLElement, string> = {
  mounted: (el, binding) => registerDriftEl(binding.value, el),
  unmounted: (_el, binding) => unregisterDriftEl(binding.value),
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
