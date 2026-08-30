<template>
  <a
    href="#main-content"
    class="bg-surface-inverted text-text-inverted-primary focus:bg-surface-inverted focus:text-text-inverted-primary sr-only rounded-lg focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100"
  >
    <span class="px-2"> Skip to main content </span>
  </a>
  <main id="main-content" class="flex w-screen flex-col items-center justify-center" tabindex="-1">
    <GlobalHeader />
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
  <PhotoLightBox
    v-model:is-open="isPhotoLightBoxOpen"
    :current-trip-slug="photoLightBoxData.currentTripSlug"
    :images="photoLightBoxData.images"
    :initial-index="photoLightBoxData.initialIndex"
    :trip-title="photoLightBoxData.tripTitle"
  />
</template>

<script setup lang="ts">
import AuthModal from '@/components/AuthModal.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
import GlobalHeader from '@/components/HeaderBar.vue'
import LightBox from '@/components/LightBox.vue'
import LiveCursors from '@/components/LiveCursors.vue'
import PhotoLightBox from '@/components/PhotoLightBox.vue'
import WorkModal from '@/components/WorkModal.vue'
import { isAuthModalOpen } from '@/composables/useAuth'
import {
  isLightBoxOpen,
  isPhotoLightBoxOpen,
  isWorkModalOpen,
  lightBoxData,
  photoLightBoxData,
  workData,
} from '@/composables/useGlobal'
import { useLive } from '@/composables/useLive'

useLive()
</script>
