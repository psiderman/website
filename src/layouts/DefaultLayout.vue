<template>
  <main class="flex w-full flex-col items-center justify-center" tabindex="-1">
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
import PhotoLightBox from '@/components/photo-lightbox/PhotoLightBox.vue'
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
import { useLive } from '@/live'

useLive()
</script>
