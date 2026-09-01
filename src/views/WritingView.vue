<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="desktop:px-20 flex flex-col px-4">
      <div class="flex min-h-[calc(100svh-5rem)] flex-col gap-20 py-20">
        <div class="text-p mx-auto -mb-12 w-full max-w-prose">
          <h1 v-reveal class="text-display text-left">words</h1>
        </div>

        <div v-if="isLoading" class="text-p mx-auto -mb-12 w-full max-w-prose">
          <div class="desktop:max-w-60 bg-surface-secondary h-8 w-full rounded-xl"></div>
        </div>

        <div
          v-if="isLoading"
          class="bg-surface-secondary text-p mx-auto flex w-full max-w-prose grow items-center justify-center rounded-xl"
        >
          <GenericLoader />
        </div>

        <div
          v-else-if="error"
          class="bg-surface-secondary text-p mx-auto flex w-full max-w-prose grow flex-col items-center justify-center gap-4 rounded-xl"
        >
          <CloudAlert :size="32" class="text-text-tertiary" />
          <p class="text-mono text-text-tertiary">Error loading writing.</p>
        </div>

        <div
          v-else-if="!posts || posts.length === 0"
          data-sync="empty-posts"
          class="bg-surface-secondary text-p mx-auto flex w-full max-w-prose grow flex-col items-center justify-center gap-4 rounded-xl"
        >
          <Ghost :size="32" class="text-text-tertiary" />
          <p class="text-mono text-text-tertiary">nothing published yet.</p>
        </div>

        <div v-else class="text-p mx-auto flex w-full max-w-prose grow flex-col gap-8">
          <div class="flex flex-col gap-20">
            <div v-for="group in postsByYear" :key="group.year" class="flex flex-col gap-8">
              <p
                v-reveal="group.yearReveal"
                class="text-ui text-text-tertiary -mb-4 tracking-wider uppercase"
              >
                {{ group.year }}
              </p>
              <router-link
                v-for="post in group.posts"
                :key="post.slug"
                v-reveal="post.revealDelay"
                :to="`/words/${post.slug}`"
                :data-sync="post.slug"
                class="group hover:bg-hover relative -m-4 cursor-pointer rounded-xl p-4 transition-colors"
              >
                <div class="flex flex-col gap-2">
                  <p class="text-h2 text-text-primary group-hover:underline">
                    {{ post.title }}
                  </p>
                  <p
                    v-if="post.hasAccess && post.excerpt"
                    class="text-p text-text-secondary line-clamp-1"
                  >
                    {{ post.excerpt }}…
                  </p>
                  <p class="text-ui-small text-text-tertiary flex flex-row items-center gap-2">
                    <Lock
                      v-if="!post.hasAccess"
                      :size="12"
                      class="dark:text-light shrink-0 dark:opacity-50"
                      aria-label="locked post"
                    />
                    <TheListIndicator
                      v-if="post.hasAccess && isHighClearance(post.clearance)"
                      size="sm"
                      tooltip
                    />
                    <span> {{ format(new Date(post.date), 'dd MMMM, yyyy') }} </span>
                    <span> • </span>
                    <span> {{ post.minutes }} min read </span>
                  </p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloudAlert, Ghost, Lock } from '@lucide/vue'
import { format } from 'date-fns'
import { computed } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import TheListIndicator from '@/components/TheListIndicator.vue'
import { useBlogPosts } from '@/composables/useBlog'
import { isHighClearance } from '@/composables/useTravel'

import type { BlogPost } from '@/composables/useBlog'

const { error, isLoading, posts } = useBlogPosts()

function groupPostsByYear(postList: BlogPost[]) {
  if (!postList?.length) return []

  const groups = new Map<number, BlogPost[]>()

  for (const post of postList) {
    const date = post?.date ? new Date(post.date) : new Date()
    const year = Number.isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear()
    const group = groups.get(year)
    if (group) {
      group.push(post)
    } else {
      groups.set(year, [post])
    }
  }

  let cumulativeIndex = 1

  return Array.from(groups.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, groupPosts]) => {
      const yearReveal = Math.min(cumulativeIndex++ * 50, 400)
      const postsWithReveal = groupPosts.map((post) => ({
        ...post,
        revealDelay: Math.min(cumulativeIndex++ * 50, 400),
      }))

      return {
        posts: postsWithReveal,
        year,
        yearReveal,
      }
    })
}

const postsByYear = computed(() => groupPostsByYear(posts.value ?? []))
</script>
