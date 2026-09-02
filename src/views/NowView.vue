<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="desktop:px-20 flex flex-col px-4">
      <div class="flex min-h-[calc(100svh-5rem)] flex-col gap-20 py-20">
        <div class="text-p mx-auto w-full max-w-prose text-left">
          <h1
            v-reveal
            v-tooltip="{ content: 'you don’t have a now page?', placement: 'right' }"
            class="text-display w-fit"
          >
            /<a href="https://nownownow.com/about" target="_blank" class="underline">now</a>
          </h1>
        </div>

        <DataState
          :loading="isLoading"
          :error="!!error"
          error-label="Error loading now page."
          :empty="!nowEntries || nowEntries.length === 0"
          empty-label="nothing published yet."
          data-sync="empty-now"
          wrapper-class="text-p mx-auto w-full max-w-prose grow"
        />

        <div
          v-if="!isLoading && !error && nowEntries && nowEntries.length > 0"
          class="flex flex-col"
        >
          <section
            v-for="(entry, eId) in nowEntries"
            :key="entry.date"
            class="flex flex-col gap-10"
          >
            <hr v-if="eId > 0" class="border-border-high-contrast my-20 block" />

            <!-- Gallery -->
            <div
              v-if="entry.images.length > 0"
              class="noscrollbar desktop:mx-0 desktop:w-full desktop:overflow-visible desktop:px-0 mx-auto flex w-full overflow-x-auto px-0"
            >
              <div
                class="desktop:grid desktop:w-full desktop:min-w-full desktop:mx-0 mx-auto flex w-fit gap-4"
                :style="{ gridTemplateColumns: `repeat(${entry.images.length}, minmax(0, 1fr))` }"
              >
                <button
                  v-for="(img, idx) in entry.images"
                  :key="img.name"
                  v-reveal="idx * 70 + 70"
                  type="button"
                  :aria-label="`Open ${img.name}`"
                  class="bg-dark desktop:h-full desktop:w-full desktop:shrink aspect-3/5 h-72 w-auto shrink-0 cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-95"
                  @click="triggerLightbox(entry, idx)"
                >
                  <img
                    v-lazy="img.url"
                    class="aspect-3/5 size-full rounded-xl object-cover"
                    :alt="img.caption || img.name"
                    width="300"
                    height="500"
                  />
                </button>
              </div>
            </div>

            <!-- Parsed markdown body -->
            <div
              v-if="entry.markdown"
              v-reveal="150"
              class="text-p markdown-content text-text-primary mx-auto max-w-prose overflow-hidden"
              v-html="renderMarkdown(entry.markdown)"
            ></div>
          </section>
        </div>
      </div>
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { format, parse } from 'date-fns'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

import ContactForm from '@/components/home/ContactForm.vue'
import DataState from '@/components/ui/DataState.vue'
import { openPhotoLightbox } from '@/composables/useGlobal'
import { useNow } from '@/composables/useNow'

import type { NowEntry } from '@/data/now'

const { entries: nowEntries, error, isLoading } = useNow()

const entryLabel = (entry: NowEntry) => {
  if (!entry.date) return ''
  try {
    const parsed = parse(entry.date, 'yyyy-MM-dd', new Date())
    if (isNaN(parsed.getTime())) return entry.date
    return format(parsed, 'MMM ’yy').toLowerCase()
  } catch {
    return entry.date
  }
}

const renderMarkdown = (raw: string) => {
  const parsed = marked.parse(raw, { breaks: true })
  return DOMPurify.sanitize(parsed as string)
}

const triggerLightbox = (entry: NowEntry, clickedIdx: number) => {
  if (entry.images.length === 0) return

  openPhotoLightbox(
    entry.images.map((img) => ({
      caption: img.caption || null,
      thumbnailUrl: img.url,
      url: img.url,
    })),
    { initialIndex: clickedIdx, title: entryLabel(entry) || 'now' },
  )
}
</script>

<style scoped>
@reference "@/style.css";
</style>
