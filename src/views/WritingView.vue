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

        <div v-else class="text-p mx-auto flex w-full max-w-prose grow flex-col gap-8">
          <TabGroup
            :selected-index="selectedTabIndex"
            as="div"
            class="flex grow flex-col gap-8"
            @change="(index: number) => (selectedTabIndex = index)"
          >
            <div class="flex flex-col gap-6">
              <div class="desktop:max-w-60 w-full">
                <SegmentedTabs :options="tabOptions" :selected-index="selectedTabIndex" />
              </div>
            </div>

            <TabPanels class="flex w-full grow flex-col outline-none">
              <!-- Public Tab Panel -->
              <TabPanel class="flex grow flex-col outline-none">
                <div
                  v-if="publicPosts.length === 0"
                  data-sync="empty-public-posts"
                  class="bg-surface-secondary flex w-full grow flex-col items-center justify-center gap-4 rounded-xl py-16"
                >
                  <Ghost :size="32" class="text-text-tertiary" />
                  <p class="text-mono text-text-tertiary">nothing published yet.</p>
                </div>

                <div v-else class="flex flex-col gap-20">
                  <div
                    v-for="group in publicPostsByYear"
                    :key="group.year"
                    class="flex flex-col gap-8"
                  >
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
                        <p v-if="post.excerpt" class="text-p text-text-secondary line-clamp-1">
                          {{ post.excerpt }}…
                        </p>
                        <p
                          class="text-ui-small text-text-tertiary flex flex-row items-center gap-2"
                        >
                          <TheListIndicator
                            v-if="isHighClearance(post.clearance)"
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
              </TabPanel>

              <!-- Private Tab Panel -->
              <TabPanel class="flex grow flex-col outline-none">
                <div
                  v-if="privatePosts.length === 0"
                  data-sync="empty-private-posts"
                  class="bg-surface-secondary flex w-full grow flex-col items-center justify-center gap-4 rounded-xl py-16"
                >
                  <template v-if="!currentUser">
                    <Lock :size="32" class="text-text-tertiary dark:text-light dark:opacity-50" />
                    <p class="text-mono text-text-tertiary">you'll have to log in first.</p>
                  </template>
                  <template v-else>
                    <Ghost :size="32" class="text-text-tertiary dark:text-light dark:opacity-50" />
                    <p class="text-mono text-text-tertiary">nothing published yet.</p>
                  </template>
                </div>

                <div v-else class="flex flex-col gap-24">
                  <div
                    v-for="group in privatePostsByYear"
                    :key="group.year"
                    class="flex flex-col gap-12"
                  >
                    <p
                      v-reveal="group.yearReveal"
                      class="text-ui text-text-tertiary -mb-4 tracking-wider uppercase"
                    >
                      {{ group.year }}
                    </p>
                    <template v-for="post in group.posts" :key="post.slug">
                      <div
                        class="bg-border-primary pointer-events-none h-px w-full first-of-type:hidden"
                      ></div>
                      <router-link
                        v-reveal="post.revealDelay"
                        :to="`/words/${post.slug}`"
                        :data-sync="post.slug"
                        class="group hover:bg-hover relative -m-4 cursor-pointer rounded-xl p-4 transition-colors"
                      >
                        <div class="flex flex-col gap-2">
                          <p class="text-h2 text-text-primary group-hover:underline">
                            {{ post.title }}
                          </p>
                          <p v-if="post.excerpt" class="text-p text-text-secondary line-clamp-1">
                            {{ post.excerpt }}…
                          </p>
                          <p
                            class="text-ui-small text-text-tertiary flex flex-row items-center gap-2"
                          >
                            <TheListIndicator
                              v-if="isHighClearance(post.clearance)"
                              size="sm"
                              tooltip
                            />
                            <span> {{ format(new Date(post.date), 'dd MMMM, yyyy') }} </span>
                            <span> • </span>
                            <span> {{ post.minutes }} min read </span>
                          </p>
                        </div>
                      </router-link>
                    </template>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TabGroup, TabPanel, TabPanels } from '@headlessui/vue'
import { CloudAlert, Ghost, Globe, Lock } from '@lucide/vue'
import { format } from 'date-fns'
import { computed, ref } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import SegmentedTabs, { type TabOption } from '@/components/SegmentedTabs.vue'
import TheListIndicator from '@/components/TheListIndicator.vue'
import { currentUser } from '@/composables/useAuth'
import { useBlogPosts } from '@/composables/useBlog'
import { isHighClearance } from '@/composables/useTravel'

import type { BlogPost } from '@/composables/useBlog'

const { error, isLoading, posts } = useBlogPosts()

const selectedTabIndex = ref(0)

const publicPosts = computed(() => (posts.value ?? []).filter((p) => p.clearance === 'public'))
const privatePosts = computed(() => (posts.value ?? []).filter((p) => p.clearance !== 'public'))

const tabOptions = computed<TabOption[]>(() => [
  { count: publicPosts.value.length, icon: Globe, id: 'public', label: 'Public' },
  { count: privatePosts.value.length, icon: Lock, id: 'private', label: 'Private' },
])

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

const publicPostsByYear = computed(() => groupPostsByYear(publicPosts.value))
const privatePostsByYear = computed(() => groupPostsByYear(privatePosts.value))
</script>
