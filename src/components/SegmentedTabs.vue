<template>
  <TabList
    data-sync="segmented-tabs"
    class="transaction-tabs bg-surface-secondary text-ui-small relative z-0 flex w-full flex-row items-center rounded-xl"
  >
    <Tab
      v-for="option in options"
      :key="option.id"
      v-slot="{ selected }"
      as="template"
      :disabled="disabled"
    >
      <button
        :class="[
          selected ? 'text-text-primary' : 'text-text-tertiary dark:text-light dark:opacity-50',
        ]"
        class="transaction-tab flex flex-1 flex-row items-center justify-center gap-1.5 outline-none"
        type="button"
        :data-sync="'tab-' + option.id"
      >
        <component :is="option.icon" v-if="option.icon" :size="16" />
        {{ option.label }}
        <span v-if="option.count && option.count > 0">({{ option.count }})</span>
      </button>
    </Tab>

    <!-- Dividers (Absolutely Positioned) -->
    <template v-if="options.length > 1">
      <div
        v-for="i in options.length - 1"
        :key="i"
        :class="[selectedIndex === i - 1 || selectedIndex === i ? 'opacity-0' : 'opacity-100']"
        :style="{ left: `${(i / options.length) * 100}%` }"
        class="border-border-high-contrast absolute top-1/2 h-5 -translate-y-1/2 border-r transition-opacity duration-200"
      ></div>
    </template>

    <!-- Indicator -->
    <div
      v-if="selectedIndex !== -1"
      :style="{
        width: `${100 / options.length}%`,
        transform: `translateX(${selectedIndex * 100}%)`,
      }"
      class="absolute inset-0 -z-10 h-full transition-transform duration-200 ease-in-out"
    >
      <div class="transaction-indicator"></div>
    </div>
  </TabList>
</template>

<script setup lang="ts">
import { Tab, TabList } from '@headlessui/vue'

import type { Component } from 'vue'

export interface TabOption {
  count?: number
  icon?: Component
  id: string
  label: string
}

interface Props {
  disabled?: boolean
  options: TabOption[]
  selectedIndex?: number
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  selectedIndex: 0,
})
</script>

<style scoped>
@reference "@/style.css";

button.transaction-tab {
  @apply rounded-xl transition-transform duration-200 ease-in-out;
  @apply h-8 w-full cursor-pointer px-2 py-1;
}
button.transaction-tab:disabled {
  @apply text-text-tertiary cursor-not-allowed;
}
div.transaction-indicator {
  @apply bg-surface-primary border-border-high-contrast h-full w-full rounded-xl border;
}
:global(.component-is-loading) div.transaction-tabs,
.component-is-loading div.transaction-tabs {
  @apply bg-surface-tertiary;
}
:global(.component-is-loading) div.transaction-indicator,
.component-is-loading div.transaction-indicator {
  @apply bg-surface-secondary;
}
</style>
