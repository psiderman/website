<template>
  <div class="bg-surface-secondary flex size-full items-center justify-center overflow-hidden">
    <div
      v-if="isLoading"
      class="bg-surface-secondary flex size-full flex-col items-center justify-center gap-2"
    >
      <GenericLoader />
    </div>
    <div
      v-else-if="error"
      class="bg-surface-secondary flex size-full flex-col items-center justify-center gap-2"
    >
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>
    <template v-else>
      <img
        v-lazy="{
          src: getStorageUrl('webp', 'home', 'writing.webp'),
          placeholder: getStorageUrl('webp', 'thumb/home', 'writing.webp'),
        }"
        alt="a picture of me writing on a desk"
        class="size-full object-cover"
      />
      <p v-if="latestDate" class="text-light/30 text-mono absolute top-0 left-0 p-4">
        Last published <br />
        {{ formatDistanceToNowStrict(latestDate) }} ago
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { formatDistanceToNowStrict } from 'date-fns'
import { computed } from 'vue'

import { useBlogPosts } from '@/composables/useBlog'
import { useQuotes } from '@/composables/useQuotes'
import { getStorageUrl } from '@/supabase'

import GenericLoader from '../GenericLoader.vue'

const { error: blogError, isLoading: isLoadingBlog, posts } = useBlogPosts()
const { error: quotesError, isLoading: isLoadingQuotes, quotes } = useQuotes()

const isLoading = computed(() => isLoadingBlog.value || isLoadingQuotes.value)
const error = computed(() => blogError.value || quotesError.value)

const latestDate = computed(() => {
  const timestamps: number[] = []
  if (posts.value?.[0]?.date) {
    const t = new Date(posts.value[0].date).getTime()
    if (!Number.isNaN(t)) timestamps.push(t)
  }
  if (quotes.value?.[0]?.date) {
    const t = new Date(quotes.value[0].date).getTime()
    if (!Number.isNaN(t)) timestamps.push(t)
  }
  if (!timestamps.length) return null
  return new Date(Math.max(...timestamps))
})
</script>
