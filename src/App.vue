<template>
  <GlobalHeader />
  <main class="flex w-screen flex-col items-center justify-center">
    <RouterView />
  </main>
  <GlobalFooter />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import GlobalFooter from './components/GlobalFooter.vue'
import GlobalHeader from './components/HeaderBar.vue'
</script>
