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
import { format } from 'date-fns'
import { marked } from 'marked'
import { computed } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import { useNow } from '@/composables/useNow'

const {
  images,
  isLoadingMarkdown,
  isLoadingSlug,
  markdownContent,
  markdownError,
  slug,
  slugError,
} = useNow()

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
