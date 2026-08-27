<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="flex flex-col px-20">
      <div class="flex flex-col gap-20 pt-10">
        <!-- <div class="text-ui flex flex-row items-center justify-start gap-2">
          <router-link to="/" class="breadcrumb main">home</router-link>
          <ChevronRight class="text-text-secondary" :size="16" />
          <router-link to="/now" class="breadcrumb level">now</router-link>
        </div> -->

        <div v-if="isLoadingSlug || isLoadingMarkdown || isLoadingImages" class="aspect-4/1 w-full">
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
          <div class="text-p mx-auto w-full max-w-prose text-left">
            <h1
              v-tooltip="{ content: 'you don’t have a now page?', placement: 'right' }"
              class="text-display -mb-14 w-fit"
            >
              /<a href="https://nownownow.com/about" target="_blank" class="underline">now</a>
            </h1>
          </div>

          <div
            v-if="images && images.length > 0"
            class="mx-auto grid min-w-full grow gap-4"
            :style="{ gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))` }"
          >
            <div
              v-for="(img, idx) in images"
              :key="img.name"
              class="bg-dark aspect-3/5 h-full w-full cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-95"
              @click="triggerLightbox(idx)"
            >
              <img
                v-lazy="img.url"
                class="aspect-3/5 h-full w-full rounded-xl object-cover"
                :alt="img.name"
                width="300"
                height="500"
              />
            </div>
          </div>

          <div class="text-p text-text-secondary mx-auto -mb-12 w-full max-w-prose text-left">
            <h2 class="text-h2">
              {{ format(new Date(slug + '-01'), 'MMM ’yy').toLocaleLowerCase() }}
            </h2>
          </div>

          <!-- Render parsed markdown -->
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
import { format } from 'date-fns'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed } from 'vue'

import GenericLoader from '@/components/GenericLoader.vue'
import ContactForm from '@/components/home/ContactForm.vue'
import { isLightBoxOpen, lightBoxData } from '@/composables/useGlobal'
import { useNow } from '@/composables/useNow'

const {
  images,
  isLoadingImages,
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
  const raw = marked.parse(markdownContent.value)
  return DOMPurify.sanitize(raw as string)
})

const triggerLightbox = (clickedIdx: number) => {
  if (!images.value || images.value.length === 0) return

  const allImages = images.value.map((img) => ({
    url: img.url,
  }))

  const orderedImages = [
    allImages[clickedIdx],
    ...allImages.slice(0, clickedIdx),
    ...allImages.slice(clickedIdx + 1),
  ]

  lightBoxData.value = {
    images: orderedImages,
  }
  isLightBoxOpen.value = true
}
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
