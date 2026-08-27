<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-overlay fixed inset-0 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full justify-center p-10 text-center"
          :class="title && description ? 'items-start' : 'items-center'"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="bg-surface-primary relative flex h-full w-180 flex-col items-center justify-center gap-2 overflow-hidden border"
              :class="
                title && description
                  ? 'border-border-primary rounded-xl p-2'
                  : 'border-dark rounded-special p-0'
              "
            >
              <div class="bg-dark group desktop:min-h-80 relative h-full w-full rounded-lg">
                <div
                  ref="scrollContainer"
                  class="noscrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
                  @scroll="handleScroll"
                >
                  <div
                    v-for="(item, idx) in mediaItems"
                    :key="idx"
                    class="my-auto flex h-full w-full shrink-0 snap-center items-center justify-center overflow-hidden rounded-lg"
                  >
                    <div
                      v-if="item.type === 'image'"
                      class="relative flex max-h-full max-w-full items-center justify-center"
                    >
                      <img
                        v-lazy="{ src: item.src, placeholder: item.placeholder }"
                        :alt="`${title}-${idx}`"
                        :width="item.width ?? undefined"
                        :height="item.height ?? undefined"
                        :style="
                          item.width && item.height
                            ? { aspectRatio: `${item.width}/${item.height}` }
                            : {}
                        "
                        class="desktop:max-h-[calc(75svh)] w-auto object-contain"
                      />
                      <div class="absolute top-2 right-2 flex flex-row gap-2">
                        <div
                          v-if="item.caption"
                          v-tooltip="{ content: item.caption }"
                          class="border-light bg-dark/50 text-light flex size-8 items-center justify-center rounded-full border-3 font-mono shadow-md"
                        >
                          i
                        </div>
                        <div
                          v-if="isHighClearance(item.clearance)"
                          v-tooltip="{ content: 'you’re on “the list”' }"
                          class="border-light flex size-8 items-center justify-center rounded-full border-3 bg-green-500 shadow-md"
                        >
                          <Star :size="20" fill="#fff" stroke-width="0" />
                        </div>
                      </div>
                    </div>
                    <video
                      v-else-if="item.type === 'video'"
                      :alt="`${title}-${idx}`"
                      :src="item.src"
                      class="desktop:max-h-[calc(75svh)] w-auto object-contain"
                      playsinline
                      :autoplay="!prefersReducedMotion"
                      :loop="!prefersReducedMotion"
                      muted
                      controls
                    />
                  </div>
                </div>

                <!-- Custom Side Indicator -->
                <CarouselIndicator
                  v-if="mediaItems.length > 1"
                  class="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100"
                  :class="{ 'opacity-50': activeIndex === 0 }"
                  :active-index="activeIndex"
                  :count="mediaItems.length"
                  orientation="horizontal"
                />

                <button
                  class="btn icon-only inverted bg-dark/50 absolute top-1/2 left-4 -translate-y-1/2 transition-opacity"
                  :class="
                    activeIndex === 0
                      ? 'pointer-events-none opacity-0'
                      : 'opacity-0 group-hover:opacity-100'
                  "
                  aria-label="Previous"
                  @click="scrollToPrev"
                >
                  <ArrowLeft :size="16" />
                </button>

                <button
                  class="btn icon-only inverted bg-dark/50 absolute top-1/2 right-4 -translate-y-1/2 transition-opacity"
                  :class="[
                    activeIndex === mediaItems.length - 1
                      ? 'pointer-events-none opacity-0'
                      : 'opacity-0 group-hover:opacity-100',
                    activeIndex === 0 && mediaItems.length > 1 ? 'opacity-50' : '',
                  ]"
                  aria-label="Next"
                  @click="scrollToNext"
                >
                  <ArrowRight :size="16" />
                </button>
              </div>
              <div v-if="title && description" class="flex w-full flex-col items-start gap-6 p-4">
                <div class="flex w-full flex-col gap-2 text-left">
                  <h2 class="text-h2 text-text-primary">{{ title }}</h2>
                  <p class="text-ui text-text-secondary">
                    {{ description }}
                  </p>
                </div>
                <div v-if="tags && tags.length > 0" class="desktop:flex-row flex flex-col gap-2">
                  <component
                    :is="tag.link ? 'a' : 'div'"
                    v-for="(tag, idx) in tags"
                    :key="idx"
                    :href="tag.link"
                    :target="tag.link ? '_blank' : undefined"
                    class="bg-surface-secondary border-border-primary text-text-secondary text-ui hover:text-text-primary flex w-fit flex-row items-center justify-center gap-0.5 rounded-full border px-3 py-0.5 transition-colors"
                    :class="{ 'hover:border-border-hover cursor-pointer': tag.link }"
                  >
                    {{ tag.value }}
                    <ArrowUpRight v-if="tag.link" :size="16" />
                  </component>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from '@lucide/vue'
import { computed, ref } from 'vue'

import CarouselIndicator from '@/components/CarouselIndicator.vue'
import { isHighClearance } from '@/composables/useTravel'

import type { ClearanceLevel } from '@/composables/useTravel'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export interface LightBoxTag {
  link?: string
  value: string
}

const props = defineProps<{
  description?: string
  images: {
    caption?: null | string
    clearance?: ClearanceLevel
    height?: null | number
    thumbnailUrl?: string
    url: string
    width?: null | number
  }[]
  isOpen: boolean
  tags?: LightBoxTag[]
  title?: string
  videos?: string[]
}>()

const mediaItems = computed(() => {
  const items = []
  if (props.images) {
    items.push(
      ...props.images.map((img) => ({
        caption: img.caption,
        clearance: img.clearance,
        height: img.height,
        placeholder: img.thumbnailUrl,
        src: img.url,
        type: 'image' as const,
        width: img.width,
      })),
    )
  }
  if (props.videos) {
    items.push(...props.videos.map((vid) => ({ src: vid, type: 'video' as const })))
  }
  return items
})

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

const activeIndex = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)

const scrollToNext = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ behavior: 'smooth', left: scrollContainer.value.clientWidth })
  }
}

const scrollToPrev = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ behavior: 'smooth', left: -scrollContainer.value.clientWidth })
  }
}

const handleScroll = () => {
  if (scrollContainer.value) {
    const index = Math.round(scrollContainer.value.scrollLeft / scrollContainer.value.clientWidth)
    activeIndex.value = index
  }
}
</script>

<style scoped>
@reference "@/style.css";
</style>
