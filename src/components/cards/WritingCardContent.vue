<template>
  <div class="bg-surface-secondary flex h-full w-full items-center justify-center overflow-hidden">
    <div
      v-if="isLoading"
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <GenericLoader />
    </div>
    <div
      v-else-if="error"
      class="bg-surface-secondary flex h-full w-full flex-col items-center justify-center gap-2"
    >
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>
    <img
      src="@/assets/home/writing.webp"
      alt="a picture of me writing on a desk"
      class="h-full w-full object-cover"
    />
    <template v-if="visiblePosts && visiblePosts.length > 0">
      <p class="text-light/30 text-mono absolute top-0 left-0 p-4">
        Last published <br />
        {{ formatDistanceToNowStrict(visiblePosts[0].date) }} ago
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { formatDistanceToNowStrict } from 'date-fns'
import { computed } from 'vue'

import { currentUserRole } from '@/composables/useAuth.ts'
import { hasBlogAccess, useBlogPosts } from '@/composables/useBlog'

import GenericLoader from '../GenericLoader.vue'

const { error, isLoading, posts } = useBlogPosts()

const visiblePosts = computed(() => {
  return posts.value?.filter((a) => hasBlogAccess(a.clearance, currentUserRole.value))
})
</script>
