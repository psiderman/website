<template>
  <div
    class="text-ui border-border-primary bg-surface-primary relative flex cursor-pointer items-center justify-between rounded-lg border"
    :class="
      variant === 'compact'
        ? 'inline-flex h-8 min-w-28 gap-3 px-2.5 py-0'
        : 'text-text-primary h-10.5 rounded-xl px-3 py-2'
    "
  >
    <div class="flex flex-row items-center justify-start gap-1">
      <div :class="[getRoleBadgeClass(modelValue), badgeClass]" class="rounded-full"></div>
      <span>{{ modelValue }}</span>
    </div>

    <ChevronDown :size="14" class="shrink-0 opacity-70" />

    <select
      :aria-label="selectLabel"
      :value="modelValue"
      class="absolute inset-0 size-full cursor-pointer opacity-0"
      @click.stop
      @change="onChange"
    >
      <option v-for="level in levels" :key="level" :value="level">
        {{ level }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

import { getRoleBadgeClass } from '../../utils/clearance'

import type { ClearanceLevel } from '@/types'

withDefaults(
  defineProps<{
    badgeClass?: string
    levels: ClearanceLevel[]
    modelValue: ClearanceLevel
    selectLabel?: string
    variant?: 'compact' | 'default'
  }>(),
  {
    badgeClass: 'h-4 w-1.5',
    selectLabel: undefined,
    variant: 'default',
  },
)

const emit = defineEmits<{
  (e: 'change', value: ClearanceLevel): void
  (e: 'update:modelValue', value: ClearanceLevel): void
}>()

function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value as ClearanceLevel
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
