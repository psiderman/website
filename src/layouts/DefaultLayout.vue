<template>
  <GlobalHeader />
  <main class="flex w-screen flex-col items-center justify-center">
    <slot />
  </main>
  <GlobalFooter />
  <AuthModal v-model:is-open="isAuthModalOpen" />
  <LiveCursors />
  <WorkModal v-model:is-open="isWorkModalOpen" :work="workData" />
  <LightBox
    v-model:is-open="isLightBoxOpen"
    :title="lightBoxData.title"
    :description="lightBoxData.description"
    :images="lightBoxData.images"
    :videos="lightBoxData.videos"
    :tags="lightBoxData.tags"
  />
</template>

<script setup lang="ts">
import AuthModal from '@/components/AuthModal.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import GlobalHeader from '@/components/HeaderBar.vue'
import LightBox from '@/components/LightBox.vue'
import LiveCursors from '@/components/LiveCursors.vue'
import WorkModal from '@/components/WorkModal.vue'
import { isAuthModalOpen } from '@/composables/useAuth'
import { isLightBoxOpen, isWorkModalOpen, lightBoxData, workData } from '@/composables/useGlobal'
import { useLive } from '@/composables/useLive'

useLive()
</script>
