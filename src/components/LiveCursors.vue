<template>
  <div v-if="global.allowMultiplayer.value" class="pointer-events-none absolute inset-0 z-50">
    <!-- Render each remote cursor -->
    <div
      v-for="cursor in renderCursors"
      :key="cursor.id"
      class="pointer-events-none absolute top-0 left-0 flex flex-col transition-transform duration-300 ease-linear"
      :style="{
        transform: `translate(${cursor.renderX}px, ${cursor.renderY}px)`,
      }"
    >
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
</template>

<script setup lang="ts">
import { MousePointer2 } from '@lucide/vue'

import { global } from '@/composables/useGlobal'
import { renderCursors } from '@/composables/useLive'
</script>
