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
        <div class="flex min-h-full items-start justify-center p-10 text-center">
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
              class="bg-surface-primary border-border-primary relative flex h-fit w-180 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border p-2"
            >
              <div class="bg-dark group relative h-fit min-h-80 w-full rounded-lg">
                <div
                  ref="scrollContainer"
                  class="noscrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
                  @scroll="handleScroll"
                >
                  <div
                    v-for="(img, idx) in images"
                    :key="idx"
                    class="my-auto flex h-full w-full shrink-0 snap-center items-center justify-center"
                  >
                    <img :src="img" class="max-h-[calc(70svh)] object-contain" />
                  </div>
                </div>

                <!-- Custom Side Indicator -->
                <CarouselIndicator
                  class="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100"
                  :active-index="activeIndex"
                  :count="images.length"
                  orientation="horizontal"
                  fast-animation
                />

                <button
                  class="btn icon-only inverted bg-dark/50 absolute top-1/2 left-4 -translate-y-1/2 transition-opacity"
                  :class="
                    activeIndex === 0
                      ? 'pointer-events-none opacity-0'
                      : 'opacity-0 group-hover:opacity-100'
                  "
                  @click="scrollToPrev"
                >
                  <ArrowLeft :size="16" />
                </button>

                <button
                  class="btn icon-only inverted bg-dark/50 absolute top-1/2 right-4 -translate-y-1/2 transition-opacity"
                  :class="
                    activeIndex === images.length - 1
                      ? 'pointer-events-none opacity-0'
                      : 'opacity-0 group-hover:opacity-100'
                  "
                  @click="scrollToNext"
                >
                  <ArrowRight :size="16" />
                </button>
              </div>
              <div class="flex flex-col items-start gap-6 p-4">
                <div class="flex w-full flex-col gap-2 text-left">
                  <h2 class="text-h2 text-text-primary">{{ title }}</h2>
                  <p class="text-ui text-text-secondary">
                    {{ description }}
                  </p>
                </div>
                <div v-if="tags && tags.length > 0" class="flex flex-row gap-2">
                  <component
                    :is="tag.link ? 'a' : 'div'"
                    v-for="(tag, idx) in tags"
                    :key="idx"
                    :href="tag.link"
                    :target="tag.link ? '_blank' : undefined"
                    class="bg-surface-secondary border-border-primary text-text-secondary text-ui hover:text-text-primary flex flex-row items-center justify-center gap-0.5 rounded-full border px-3 py-0.5 transition-colors"
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
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@lucide/vue'
import { ref, watch } from 'vue'

import CarouselIndicator from '@/components/CarouselIndicator.vue'
import { global } from '@/composables/useGlobal'

export interface LightBoxTag {
  link?: string
  value: string
}

const props = defineProps<{
  description: string
  images: string[]
  isOpen: boolean
  tags?: LightBoxTag[]
  title: string
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      global.activeModal.value = 'lightbox'
    } else if (global.activeModal.value === 'lightbox') {
      global.activeModal.value = null
    }
  },
)

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
