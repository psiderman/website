<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="desktop:px-20 flex flex-col px-4">
      <div class="flex min-h-[calc(100svh-5rem)] flex-col gap-20 pt-20">
        <div
          v-reveal
          data-sync="post-breadcrumbs"
          class="text-ui flex flex-row items-center justify-start gap-2"
        >
          <router-link to="/" class="breadcrumb main">home</router-link>
          <ChevronRight class="text-text-secondary" :size="16" />
          <router-link to="/words" class="breadcrumb main">words</router-link>
          <template v-if="post?.title">
            <ChevronRight class="text-text-secondary" :size="16" />
            <p class="breadcrumb level">{{ post.title }}</p>
          </template>
        </div>

        <div
          v-if="isLoading"
          class="bg-surface-secondary flex w-full grow flex-col items-center justify-center"
        >
          <GenericLoader />
        </div>

        <div
          v-else-if="isNotFound"
          class="bg-surface-secondary flex w-full grow flex-col items-center justify-center gap-4 rounded-xl"
        >
          <FileX :size="32" class="text-text-tertiary" />
          <p class="text-mono text-text-tertiary">The post you're trying to find doesn't exist.</p>
        </div>

        <div
          v-else-if="error"
          class="bg-surface-secondary flex w-full grow flex-col items-center justify-center gap-4 rounded-xl"
        >
          <FileExclamationPoint :size="32" class="text-text-tertiary" />
          <p class="text-mono text-text-tertiary">Error loading post.</p>
        </div>

        <!-- Login / clearance required to read this post -->
        <div
          v-else-if="content?.access === 'denied'"
          data-sync="post-denied"
          class="bg-surface-secondary flex w-full grow flex-col items-center justify-center gap-4 rounded-xl"
        >
          <Lock :size="32" aria-hidden="true" class="text-text-tertiary" />
          <h2 class="text-h2">{{ post?.title }}</h2>
          <p class="text-p text-text-tertiary max-w-sm text-center">
            this post isn’t public yet. if you think you should have access, DM me.
          </p>
          <button
            v-if="!currentUser"
            class="btn primary"
            type="button"
            @click="isAuthModalOpen = true"
          >
            log in
          </button>
          <router-link v-else to="/words" class="btn primary">
            <ArrowLeft :size="16" /> Back to words
          </router-link>
        </div>

        <template v-else-if="post">
          <!-- Render parsed markdown -->
          <div
            v-if="parsedMarkdown"
            v-reveal="150"
            :data-sync="post.slug"
            class="text-p markdown-content text-text-primary mx-auto w-full max-w-prose"
            v-html="parsedMarkdown"
          ></div>
        </template>
      </div>
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, FileExclamationPoint, FileX, Lock } from '@lucide/vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import GenericLoader from '@/components/GenericLoader.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import { currentUser, isAuthModalOpen } from '@/composables/useAuth'
import { useBlogPost } from '@/composables/useBlog'

const route = useRoute()

const slug = computed(() => (typeof route.params.slug === 'string' ? route.params.slug : ''))

const { content, error, isLoading, isNotFound, post } = useBlogPost(slug)

// Auto-prompt for login when a logged-out user lands on a gated post
watch(
  content,
  (c) => {
    if (c?.access === 'denied' && !currentUser.value) {
      isAuthModalOpen.value = true
    }
  },
  { immediate: true },
)

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
  @apply hover:bg-hover active:bg-press rounded-lg px-2 py-1;

  &.main {
    @apply text-text-tertiary;
  }

  &.level {
    @apply text-text-secondary;
  }
}
</style>
