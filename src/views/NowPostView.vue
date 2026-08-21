<template>
  <div class="flex flex-col gap-20 pt-10">
    <div class="text-ui flex flex-row items-center justify-start gap-2">
      <router-link to="/" class="breadcrumb main">home</router-link>
      <ChevronRight class="text-text-secondary" :size="16" />
      <router-link to="/now" class="breadcrumb level">now</router-link>
      <ChevronRight class="text-text-secondary" :size="16" />
      <router-link to="#" class="breadcrumb current">{{
        format(slug, 'MMM ’yy').toLocaleLowerCase()
      }}</router-link>
    </div>

    <div v-if="isLoading" class="aspect-4/1 w-full">
      <GenericLoader />
    </div>

    <div
      v-else-if="error"
      class="bg-surface-secondary flex aspect-4/1 h-full w-full items-center justify-center rounded-xl"
    >
      <p class="text-mono text-text-tertiary">Error loading post.</p>
    </div>

    <template v-else>
      <!-- Render images at the top -->
      <div v-if="images && images.length > 0" class="mx-auto -mt-10 grid grow grid-cols-4 gap-4">
        <div
          v-for="img in images"
          :key="img.name"
          class="aspect-3/5 h-full w-full rounded-xl object-cover"
        >
          <img
            class="aspect-3/5 h-full w-full rounded-xl object-cover"
            :src="img.url"
            :alt="img.name"
          />
        </div>
      </div>

      <!-- Render parsed markdown -->
      <div class="text-p mx-auto w-full max-w-prose text-left">
        <h1 class="text-display -mb-14">{{ format(slug, 'MMM ’yy').toLocaleLowerCase() }}</h1>
      </div>
      <div
        v-if="parsedMarkdown"
        class="text-p markdown-content text-text-primary mx-auto max-w-prose overflow-hidden"
        v-html="parsedMarkdown"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { marked } from 'marked'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import GenericLoader from '@/components/GenericLoader.vue'
import { supabase } from '@/supabase'

const route = useRoute()
const slug = route.params.slug as string

// Fetch images
const { data: images } = useQuery({
  queryFn: async () => {
    const { data, error } = await supabase.storage.from('now').list(slug)
    if (error) throw error

    // Filter out the markdown file and return public URLs
    return data
      .filter((file) => !file.name.endsWith('.md'))
      .map((file) => {
        const { data: urlData } = supabase.storage.from('now').getPublicUrl(`${slug}/${file.name}`)
        return {
          name: file.name,
          url: urlData.publicUrl,
        }
      })
  },
  queryKey: ['now-images', slug],
})

// Fetch markdown content
const {
  data: markdownContent,
  error,
  isLoading,
} = useQuery({
  queryFn: async () => {
    if (import.meta.env.DEV) {
      // Dev: bypass edge/browser caching for instant updates
      const { data: urlData } = supabase.storage.from('now').getPublicUrl(`${slug}/${slug}.md`)
      const response = await fetch(`${urlData.publicUrl}?t=${new Date().getTime()}`)
      if (!response.ok) throw new Error('Failed to fetch markdown')
      return await response.text()
    } else {
      // Prod: utilize Supabase download and aggressive edge caching
      const { data, error } = await supabase.storage.from('now').download(`${slug}/${slug}.md`)
      if (error) throw error
      return await data.text()
    }
  },
  queryKey: ['now-markdown', slug],
})

// Parse markdown to HTML
const parsedMarkdown = computed(() => {
  if (!markdownContent.value) return ''
  return marked.parse(markdownContent.value)
})
</script>

<style scoped>
@reference "@/style.css";

.breadcrumb {
  @apply hover:bg-hover active:bg-press rounded-lg px-2 py-1;

  &.main {
    @apply text-text-tertiary;
  }

  &.level {
    @apply text-text-secondary;
  }

  &.current {
    @apply text-text-primary pointer-events-none;
  }
}
</style>
