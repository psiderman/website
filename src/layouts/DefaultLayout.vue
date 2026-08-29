<template>
  <a
    href="#main-content"
    class="bg-surface-inverted text-text-inverted-primary focus:bg-surface-inverted focus:text-text-inverted-primary sr-only rounded-lg focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100"
  >
    <span class="px-2"> Skip to main content </span>
  </a>
  <GlobalHeader />
  <main id="main-content" class="flex w-screen flex-col items-center justify-center" tabindex="-1">
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
