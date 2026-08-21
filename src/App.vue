<template>
  <GlobalHeader />
  <main class="flex w-screen flex-col items-center justify-center">
    <RouterView />
  </main>
  <GlobalFooter />
  <VueQueryDevtools />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { RouterView } from 'vue-router'

import GlobalFooter from './components/GlobalFooter.vue'
import GlobalHeader from './components/HeaderBar.vue'
</script>
