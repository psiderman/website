<template>
  <GlobalHeader />
  <main class="flex w-screen flex-col items-center justify-center">
    <RouterView />
  </main>
  <GlobalFooter />
  <VueQueryDevtools />
  <AuthModal v-model:is-open="isAuthModalOpen" />
  <LiveCursors />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { RouterView } from 'vue-router'

import AuthModal from './components/AuthModal.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import GlobalHeader from './components/HeaderBar.vue'
import LiveCursors from './components/LiveCursors.vue'
import { isAuthModalOpen } from './composables/useAuth'
import { useLive } from './composables/useLive'

useLive()
</script>
