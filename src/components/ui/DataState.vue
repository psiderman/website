<template>
  <div v-if="loading" :class="[defaultWrapperClass, wrapperClass]" v-bind="$attrs">
    <GenericLoader />
  </div>

  <div v-else-if="error" :class="[defaultWrapperClass, wrapperClass]" v-bind="$attrs">
    <component :is="errorIcon || CloudAlert" :size="32" class="text-text-tertiary" />
    <p class="text-mono text-text-tertiary">{{ errorLabel || 'Error loading content.' }}</p>
  </div>

  <div v-else-if="empty" :class="[defaultWrapperClass, wrapperClass]" v-bind="$attrs">
    <component :is="emptyIcon || Ghost" :size="32" class="text-text-tertiary" />
    <p class="text-mono text-text-tertiary">{{ emptyLabel || 'nothing published yet.' }}</p>
  </div>
</template>

<script setup lang="ts">
import { CloudAlert, Ghost } from '@lucide/vue'

import GenericLoader from '@/components/GenericLoader.vue'

import type { Component } from 'vue'

// Multi-root component: prevent implicit fallthrough (which Vue drops for
// multi-root) so $attrs is forwarded explicitly to the active branch.
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    empty?: boolean
    emptyIcon?: Component
    emptyLabel?: string
    error?: boolean
    errorIcon?: Component
    errorLabel?: string
    loading?: boolean
    wrapperClass?: string
  }>(),
  {
    empty: false,
    emptyIcon: undefined,
    emptyLabel: 'nothing published yet.',
    error: false,
    errorIcon: undefined,
    errorLabel: 'Error loading content.',
    loading: false,
    wrapperClass: '',
  },
)

const defaultWrapperClass =
  'bg-surface-secondary flex flex-col items-center justify-center gap-4 rounded-xl min-h-40'
</script>
