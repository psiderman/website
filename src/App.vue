<template>
  <component :is="layout">
    <RouterView />
  </component>
  <VueQueryDevtools />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import { initTheme } from './composables/useTheme'
import BlankLayout from './layouts/BlankLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

const route = useRoute()
const layout = computed(() => (route.meta.layout === 'blank' ? BlankLayout : DefaultLayout))

initTheme()
</script>
