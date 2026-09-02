<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="desktop:px-20 flex flex-col px-4">
      <div class="flex min-h-[calc(100svh-5rem)] flex-col gap-20 py-20">
        <div
          v-reveal
          data-sync="post-breadcrumbs"
          class="text-p mx-auto flex w-full max-w-prose flex-row items-center justify-start gap-2"
        >
          <router-link to="/" class="breadcrumb text-ui main">home</router-link>
          <ChevronRight class="text-text-secondary" :size="16" />
          <router-link to="/words" class="breadcrumb text-ui main">words</router-link>
          <template v-if="post?.title">
            <ChevronRight class="text-text-secondary" :size="16" />
            <p class="breadcrumb text-ui level">{{ post.title }}</p>
          </template>
        </div>

        <DataState
          v-if="isLoading || isNotFound || error"
          :loading="isLoading"
          :error="!!error"
          error-label="Error loading post."
          :error-icon="FileExclamationPoint"
          :empty="isNotFound"
          empty-label="The post you're trying to find doesn't exist."
          :empty-icon="FileX"
          wrapper-class="text-p mx-auto w-full max-w-prose grow"
        />

        <!-- Login / clearance required to read this post -->
        <div
          v-else-if="content?.access === 'denied'"
          data-sync="post-denied"
          class="bg-surface-secondary text-p mx-auto mt-10 flex min-h-120 w-full max-w-prose grow flex-col items-center justify-center gap-4 rounded-xl p-10 text-center"
        >
          <Lock
            :size="32"
            aria-hidden="true"
            class="text-text-tertiary dark:text-light dark:opacity-50"
          />
          <h2 class="text-h2">{{ post?.title }}</h2>
          <p class="text-p text-text-tertiary max-w-sm text-center text-balance">
            {{
              currentUser
                ? 'this post isn’t public yet. if you think you should have access, DM me.'
                : 'log in to see if you have access.'
            }}
          </p>
          <button
            v-if="!currentUser"
            class="btn primary mt-8"
            type="button"
            @click="isAuthModalOpen = true"
          >
            Log in
          </button>
          <router-link v-else to="/words" class="btn primary mt-8">
            <ArrowLeft :size="16" /> Back to words
          </router-link>
        </div>

        <!-- Render parsed markdown -->
        <div
          v-else-if="parsedMarkdown"
          v-reveal="150"
          :data-sync="post?.slug"
          class="text-p markdown-content text-text-primary mx-auto w-full max-w-prose"
          v-html="parsedMarkdown"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, FileExclamationPoint, FileX, Lock } from '@lucide/vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import DataState from '@/components/ui/DataState.vue'
import { currentUser, isAuthModalOpen } from '@/composables/useAuth'
import { useBlogPost } from '@/composables/useBlog'

const route = useRoute()

const slug = computed(() => (typeof route.params.slug === 'string' ? route.params.slug : ''))

const { content, error, isLoading, isNotFound, post } = useBlogPost(slug)

// Override the router title once the post resolves (post titles aren't known at route meta time)
watch(
  post,
  (p) => {
    if (p) document.title = `${p.title} · Words | Karan Sanas`
  },
  { immediate: true },
)

const parsedMarkdown = computed(() => {
  if (!content.value?.markdown) return ''
  const raw = marked.parse(content.value.markdown, { breaks: true })
  return DOMPurify.sanitize(raw as string)
})
</script>

<style scoped>
@reference "@/style.css";

.breadcrumb {
  @apply hover:bg-hover active:bg-press -mx-2 line-clamp-1 w-full max-w-fit rounded-lg px-2 py-1;

  &.main {
    @apply text-text-tertiary;
  }

  &.level {
    @apply text-text-secondary;
  }
}
</style>
