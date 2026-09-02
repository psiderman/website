<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="desktop:px-20 flex flex-col px-4">
      <div class="flex min-h-[calc(100svh-5rem)] flex-col gap-20 py-20">
        <div class="text-p mx-auto -mb-12 w-full max-w-prose">
          <h1 v-reveal class="text-display text-left">words</h1>
        </div>

        <div v-if="isLoading" class="text-p mx-auto -mb-12 w-full max-w-prose">
          <div class="bg-surface-secondary h-10 w-full rounded-xl"></div>
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
          v-else-if="!hasItems"
          data-sync="empty-posts"
          class="bg-surface-secondary text-p mx-auto flex w-full max-w-prose grow flex-col items-center justify-center gap-4 rounded-xl"
        >
          <Ghost :size="32" class="text-text-tertiary" />
          <p class="text-mono text-text-tertiary">nothing published yet.</p>
        </div>

        <div v-else class="text-p mx-auto flex w-full max-w-prose grow flex-col gap-12">
          <TabGroup
            :selected-index="selectedTabIndex"
            as="div"
            class="flex grow flex-col gap-12"
            @change="(index: number) => (selectedTabIndex = index)"
          >
            <div class="w-full">
              <SegmentedTabs :options="tabOptions" :selected-index="selectedTabIndex" />
            </div>

            <div
              v-if="itemsByYear.length === 0"
              class="bg-surface-secondary flex w-full grow flex-col items-center justify-center gap-4 rounded-xl py-16"
            >
              <Ghost :size="32" class="text-text-tertiary" />
              <p class="text-mono text-text-tertiary">{{ emptyMessage }}</p>
            </div>

            <div v-else class="flex flex-col gap-24">
              <div v-for="group in itemsByYear" :key="group.year" class="flex flex-col gap-12">
                <p
                  v-reveal="group.yearReveal"
                  class="text-ui text-text-tertiary -mb-4 tracking-wider uppercase"
                >
                  {{ group.year }}
                </p>

                <template
                  v-for="(item, idx) in group.items"
                  :key="item.feedType === 'post' ? item.slug : item.id"
                >
                  <hr v-if="idx > 0" v-reveal="item.revealDelay" class="border-border-primary" />

                  <!-- Long-form Essay / Blog Post -->
                  <router-link
                    v-if="item.feedType === 'post'"
                    v-reveal="item.revealDelay"
                    :to="`/words/${item.slug}`"
                    :data-sync="item.slug"
                    class="group hover:bg-hover relative -m-4 cursor-pointer rounded-xl p-4 transition-colors"
                  >
                    <div class="flex flex-col gap-2">
                      <p class="text-h2 text-text-primary group-hover:underline">
                        {{ item.title }}
                      </p>
                      <p
                        v-if="item.hasAccess && item.excerpt"
                        class="text-p desktop:text-p-large desktop:leading-7 text-text-secondary line-clamp-2"
                      >
                        {{ item.excerpt }}…
                      </p>
                      <p class="text-ui-small text-text-tertiary flex flex-row items-center gap-2">
                        <Lock
                          v-if="!item.hasAccess"
                          :size="12"
                          class="dark:text-light shrink-0 dark:opacity-50"
                          aria-label="locked post"
                        />
                        <span> {{ format(new Date(item.date), 'dd MMMM, yyyy') }} </span>
                        <span> • </span>
                        <span> {{ item.minutes }} min read </span>
                        <span v-if="item.hasAccess && isHighClearance(item.clearance)"> • </span>
                        <TheListIndicator
                          v-if="item.hasAccess && isHighClearance(item.clearance)"
                          size="sm"
                          tooltip
                        />
                      </p>
                    </div>
                  </router-link>

                  <!-- Short Fragment / Quote -->
                  <div
                    v-else
                    :ref="(el) => observeFragment(el, item)"
                    v-reveal="item.revealDelay"
                    :data-sync="item.id"
                    class="relative -m-4 rounded-xl p-4"
                  >
                    <div class="flex flex-col gap-4">
                      <p
                        v-if="item.title"
                        class="text-h2 text-text-primary"
                        v-html="renderMarkdownInline(item.title)"
                      ></p>
                      <div
                        class="text-p desktop:text-p-large text-text-primary border-border-high-contrast desktop:leading-7 -ml-3 flex flex-col items-start gap-4 border-l-4 pl-3"
                        v-html="renderMarkdown(item.content)"
                      ></div>
                      <p class="text-ui-small text-text-tertiary flex flex-row items-center gap-2">
                        <span> {{ format(new Date(item.date), 'dd MMMM, yyyy') }} </span>
                        <span v-if="isHighClearance(item.clearance)"> • </span>
                        <TheListIndicator
                          v-if="isHighClearance(item.clearance)"
                          size="sm"
                          tooltip
                        />
                      </p>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </TabGroup>
        </div>
        <ContactForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TabGroup } from '@headlessui/vue'
import { CloudAlert, Ghost, Lock } from '@lucide/vue'
import { format } from 'date-fns'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed, onBeforeUnmount, ref } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import SegmentedTabs, { type TabOption } from '@/components/SegmentedTabs.vue'
import TheListIndicator from '@/components/TheListIndicator.vue'
import { useBlogPosts } from '@/composables/useBlog'
import { useQuotes } from '@/composables/useQuotes'
import { isHighClearance } from '@/composables/useTravel'
import { trackEvent } from '@/utils/analytics'

import type { BlogPost } from '@/composables/useBlog'
import type { Quote } from '@/composables/useQuotes'

type PostWithReveal = BlogPost & {
  feedType: 'post'
  revealDelay?: number
}

type QuoteWithReveal = Quote & {
  feedType: 'quote'
  revealDelay?: number
}

type WritingFeedItem = PostWithReveal | QuoteWithReveal

const viewedFragmentIds = new Set<string>()
const fragmentElementMap = new WeakMap<Element, QuoteWithReveal>()

let sharedFragmentObserver: IntersectionObserver | null = null

function getFragmentObserver() {
  if (typeof window === 'undefined') return null
  if (!sharedFragmentObserver) {
    sharedFragmentObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const item = fragmentElementMap.get(entry.target)
            if (item && !viewedFragmentIds.has(item.id)) {
              viewedFragmentIds.add(item.id)
              trackEvent('view_fragment', {
                fragment_id: item.id,
                title: item.title || 'untitled',
              })
            }
            sharedFragmentObserver?.unobserve(entry.target)
            fragmentElementMap.delete(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px 20% 0px' },
    )
  }
  return sharedFragmentObserver
}

function observeFragment(el: unknown, item: QuoteWithReveal) {
  if (!el || !(el instanceof HTMLElement) || viewedFragmentIds.has(item.id)) return

  fragmentElementMap.set(el, item)
  getFragmentObserver()?.observe(el)
}

onBeforeUnmount(() => {
  if (sharedFragmentObserver) {
    sharedFragmentObserver.disconnect()
    sharedFragmentObserver = null
  }
})

function renderMarkdown(raw: string) {
  if (!raw) return ''
  const parsed = marked.parse(raw, { breaks: true })
  return DOMPurify.sanitize(parsed as string)
}

function renderMarkdownInline(raw: string) {
  if (!raw) return ''
  const parsed = marked.parseInline(raw)
  return DOMPurify.sanitize(parsed as string)
}

const selectedTabIndex = ref(0)

const { error: blogError, isLoading: isLoadingBlog, posts } = useBlogPosts()
const { error: quotesError, isLoading: isLoadingQuotes, quotes } = useQuotes()

const isLoading = computed(() => isLoadingBlog.value || isLoadingQuotes.value)
const error = computed(() => blogError.value || quotesError.value)
const hasItems = computed(() => (posts.value?.length || 0) + (quotes.value?.length || 0) > 0)

const tabOptions = computed<TabOption[]>(() => [
  {
    count: (posts.value?.length ?? 0) + (quotes.value?.length ?? 0),
    id: 'all',
    label: 'all',
  },
  {
    count: quotes.value?.length ?? 0,
    id: 'fragments',
    label: 'fragments',
  },
  {
    count: posts.value?.length ?? 0,
    id: 'essays',
    label: 'essays',
  },
])

const emptyMessage = computed(() => {
  if (selectedTabIndex.value === 1) return 'no fragments yet.'
  if (selectedTabIndex.value === 2) return 'no essays yet.'
  return 'nothing published yet.'
})

const activeFeedItems = computed<WritingFeedItem[]>(() => {
  const postItems: PostWithReveal[] = (posts.value ?? []).map((p) => ({ ...p, feedType: 'post' }))
  const quoteItems: QuoteWithReveal[] = (quotes.value ?? []).map((q) => ({
    ...q,
    feedType: 'quote',
  }))

  if (selectedTabIndex.value === 1) return quoteItems
  if (selectedTabIndex.value === 2) return postItems

  return [...postItems, ...quoteItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
})

const itemsByYear = computed(() => {
  if (!activeFeedItems.value.length) return []

  const groups = new Map<number, WritingFeedItem[]>()

  for (const item of activeFeedItems.value) {
    const date = item?.date ? new Date(item.date) : new Date()
    const year = Number.isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear()
    const group = groups.get(year)
    if (group) {
      group.push(item)
    } else {
      groups.set(year, [item])
    }
  }

  let cumulativeIndex = 1

  return Array.from(groups.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, groupItems]) => ({
      items: groupItems.map((item) => ({
        ...item,
        revealDelay: Math.min(cumulativeIndex++ * 50, 200),
      })),
      year,
      yearReveal: Math.min(cumulativeIndex++ * 50, 400),
    }))
})
</script>
