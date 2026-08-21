<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="flex flex-col px-20">
      <div class="flex flex-col gap-20 pt-10">
        <div class="text-ui flex flex-row items-center justify-start gap-2">
          <router-link to="/" class="breadcrumb main">home</router-link>
          <ChevronRight class="text-text-secondary" :size="16" />
          <router-link to="/now" class="breadcrumb level">now</router-link>
        </div>

        <div v-if="isLoadingSlug || isLoadingMarkdown" class="aspect-4/1 w-full">
          <GenericLoader />
        </div>

        <div
          v-else-if="slugError || markdownError"
          class="bg-surface-secondary flex aspect-4/1 h-full w-full items-center justify-center rounded-xl"
        >
          <p class="text-mono text-text-tertiary">Error loading post.</p>
        </div>

        <template v-else-if="slug">
          <!-- Render images at the top -->
          <div
            v-if="images && images.length > 0"
            class="mx-auto -mt-10 grid grow grid-cols-4 gap-4"
          >
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
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { marked } from 'marked'
import { computed } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import { supabase } from '@/supabase'

// 1. Fetch latest post slug
const {
  data: posts,
  error: slugError,
  isLoading: isLoadingSlug,
} = useQuery({
  queryFn: async () => {
    const { data, error } = await supabase
      .from('now')
      .select('date')
      .eq('is_active', true)
      .order('date', { ascending: false })
      .limit(1)

    if (error) throw error
    return data
  },
  queryKey: ['now-posts'],
})

const slug = computed(() => {
  return posts.value && posts.value.length > 0 ? posts.value[0].date.substring(0, 7) : null
})

// 2. Fetch images (only runs if slug is available)
const { data: images } = useQuery({
  enabled: computed(() => !!slug.value),
  queryFn: async () => {
    const { data, error } = await supabase.storage.from('now').list(slug.value!)
    if (error) throw error

    return data
      .filter((file) => !file.name.endsWith('.md'))
      .map((file) => {
        const { data: urlData } = supabase.storage
          .from('now')
          .getPublicUrl(`${slug.value}/${file.name}`)
        return {
          name: file.name,
          url: urlData.publicUrl,
        }
      })
  },
  queryKey: ['now-images', slug],
})

// 3. Fetch markdown content (only runs if slug is available)
const {
  data: markdownContent,
  error: markdownError,
  isLoading: isLoadingMarkdown,
} = useQuery({
  enabled: computed(() => !!slug.value),
  queryFn: async () => {
    if (import.meta.env.DEV) {
      const { data: urlData } = supabase.storage
        .from('now')
        .getPublicUrl(`${slug.value}/${slug.value}.md`)
      const response = await fetch(`${urlData.publicUrl}?t=${new Date().getTime()}`)
      if (!response.ok) throw new Error('Failed to fetch markdown')
      return await response.text()
    } else {
      const { data, error } = await supabase.storage
        .from('now')
        .download(`${slug.value}/${slug.value}.md`)
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
}
</style>
