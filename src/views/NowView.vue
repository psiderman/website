<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="desktop:px-20 flex flex-col px-4">
      <div class="flex min-h-[calc(100svh-5rem)] flex-col gap-20 pt-20">
        <div class="text-p mx-auto w-full max-w-prose text-left">
          <h1
            v-reveal
            v-tooltip="{ content: 'you don’t have a now page?', placement: 'right' }"
            class="text-display -mb-14 w-fit"
          >
            /<a href="https://nownownow.com/about" target="_blank" class="underline">now</a>
          </h1>
        </div>

        <div
          v-if="images.length > 0"
          class="noscrollbar desktop:mx-0 desktop:w-full desktop:overflow-visible desktop:px-0 -mx-4 flex w-[calc(100%+2rem)] overflow-x-auto px-4"
        >
          <div
            class="desktop:grid desktop:w-full desktop:min-w-full desktop:mx-0 mx-auto flex w-fit gap-4"
            :style="{ gridTemplateColumns: `repeat(${images.length}, minmax(0, 1fr))` }"
          >
            <button
              v-for="(img, idx) in images"
              :key="img.name"
              v-reveal="idx * 70 + 70"
              type="button"
              :aria-label="`Open ${img.name}`"
              class="bg-dark desktop:h-full desktop:w-full desktop:shrink aspect-3/5 h-72 w-auto shrink-0 cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-95"
              @click="triggerLightbox(idx)"
            >
              <img
                v-lazy="img.url"
                class="aspect-3/5 h-full w-full rounded-xl object-cover"
                :alt="img.name"
                width="300"
                height="500"
              />
            </button>
          </div>
        </div>

        <div
          v-reveal="100"
          class="text-p text-text-secondary mx-auto -mb-12 w-full max-w-prose text-left"
        >
          <h2 class="text-h1">{{ updatedLabel }}</h2>
        </div>

        <!-- Render parsed markdown -->
        <div
          v-if="parsedMarkdown"
          v-reveal="150"
          class="text-p markdown-content text-text-primary mx-auto max-w-prose overflow-hidden"
          v-html="parsedMarkdown"
        ></div>
      </div>
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { format, parse } from 'date-fns'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed } from 'vue'

import ContactForm from '@/components/home/ContactForm.vue'
import { isPhotoLightBoxOpen, photoLightBoxData } from '@/composables/useGlobal'
import { nowImages, nowMarkdown, nowUpdated } from '@/data/now'

const images = nowImages

const updatedLabel = nowUpdated
  ? format(parse(`${nowUpdated}-01`, 'yyyy-MM-dd', new Date()), 'MMM ’yy').toLowerCase()
  : ''

const parsedMarkdown = computed(() => {
  const raw = marked.parse(nowMarkdown, { breaks: true })
  return DOMPurify.sanitize(raw as string)
})

const triggerLightbox = (clickedIdx: number) => {
  if (images.length === 0) return

  const allImages = images.map((img) => ({
    caption: null,
    thumbnailUrl: img.url,
    url: img.url,
  }))

  const orderedImages = [...allImages.slice(clickedIdx), ...allImages.slice(0, clickedIdx)]

  photoLightBoxData.value = {
    currentTripSlug: '',
    images: orderedImages,
    initialIndex: 0,
    tripTitle: updatedLabel || 'now',
  }
  isPhotoLightBoxOpen.value = true
}
</script>

<style scoped>
@reference "@/style.css";
</style>
