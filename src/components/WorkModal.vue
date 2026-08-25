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
              class="bg-surface-primary border-border-primary relative flex h-fit w-180 flex-col items-center justify-center gap-0 overflow-hidden rounded-xl border"
            >
              <template v-if="work">
                <div
                  class="bg-background border-border-primary flex h-20 w-full flex-row items-center justify-between border-b px-6 py-5"
                >
                  <div class="flex flex-row gap-2 text-left">
                    <img
                      :src="getWorkLogoUrl(work.orgId)"
                      class="rounded-special dark:border-border-primary size-10 border border-transparent"
                      width="128"
                      height="128"
                    />
                    <div class="flex flex-col">
                      <h2 class="text-h2 text-text-primary">{{ work.orgName }}</h2>
                      <p class="text-ui-small text-text-tertiary">
                        {{ formatDuration(work.startDate, work.endDate) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="border-border-primary flex w-full flex-row gap-10 border-b p-10">
                  <div
                    class="bg-surface-secondary border-border-primary relative z-0 h-90 w-72 shrink-0 overflow-hidden rounded-lg border"
                  >
                    <div
                      class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
                    >
                      <p class="text-ui-small text-text-tertiary/20 text-center lowercase">
                        photos from my time at <br />
                        {{ work.orgName }}
                      </p>
                    </div>
                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="transform scale-95 opacity-0"
                      enter-to-class="transform scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="transform scale-100 opacity-100"
                      leave-to-class="transform scale-95 opacity-0"
                    >
                      <button
                        v-if="isMoved"
                        class="bg-surface-primary/80 border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary absolute top-2 right-2 z-10 cursor-pointer rounded-full border p-1.5 shadow-sm backdrop-blur-sm transition-all"
                        @click="resetImages"
                      >
                        <Undo :size="16" />
                      </button>
                    </Transition>
                    <img
                      v-for="(img, idx) in work.data?.galleryImages"
                      :key="idx"
                      ref="imageRefs"
                      draggable="false"
                      :src="getWorkImageUrl(work.orgId, img.src)"
                      class="image-polaroid absolute inset-0 m-auto object-cover select-none"
                      :class="img.landscape ? 'h-60 w-80' : 'h-80 w-60'"
                      :height="img.landscape ? 240 : 320"
                      :width="img.landscape ? 320 : 240"
                      :style="{ transform: `rotate(${[-5, 7, 1][idx % 3]}deg)` }"
                    />
                  </div>
                  <div
                    class="text-text-secondary text-p flex h-auto w-full grow flex-col items-start justify-center gap-6 text-left italic"
                  >
                    <p v-for="(p, idx) in work.data?.description" :key="idx">
                      {{ p }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="work.data?.people || work.data?.projects"
                  class="border-border-primary flex w-full flex-row gap-6 border-b p-10 text-left"
                >
                  <div
                    v-if="work.data?.projects"
                    class="text-text-primary text-ui flex w-full flex-col gap-2"
                  >
                    <p class="text-ui-small text-text-tertiary tracking-wider uppercase">
                      Projects I worked on
                    </p>
                    <component
                      :is="project.link ? 'a' : 'div'"
                      v-for="project in work.data?.projects"
                      :key="project.name"
                      :href="project.link"
                      :target="project.link ? '_blank' : undefined"
                      class="-mx-2 -my-1 flex w-fit flex-row items-center gap-2 rounded-lg px-2 py-1"
                      :class="
                        project.link
                          ? 'hover:bg-hover cursor-pointer text-blue-700 underline visited:text-purple-700 dark:text-blue-600 dark:visited:text-purple-600'
                          : ''
                      "
                    >
                      <p>{{ project.name }}</p>
                      <ArrowUpRight v-if="project.link" :size="16" />
                    </component>
                  </div>

                  <div
                    v-if="work.data?.people"
                    class="text-text-primary text-ui-small flex w-full flex-col gap-2"
                  >
                    <p class="text-text-tertiary tracking-wider uppercase">People I worked with</p>
                    <div class="flex flex-row flex-wrap gap-1">
                      <component
                        :is="person.linkedin ? 'a' : 'div'"
                        v-for="person in sortedPeople"
                        :key="person.name"
                        v-tooltip="{ content: person.name, trigger: 'mouseenter' }"
                        :href="person.linkedin"
                        :target="person.linkedin ? '_blank' : undefined"
                      >
                        <img
                          :src="getWorkPersonUrl(work.orgId, person.imageName)"
                          class="border-border-primary size-10 rounded-full border object-cover outline-0 transition-transform hover:scale-110"
                          height="128"
                          width="128"
                        />
                      </component>
                    </div>
                  </div>
                </div>

                <div
                  v-if="work.data?.companyInfo"
                  class="bg-background text-text-secondary flex w-full flex-row items-center justify-between p-10"
                >
                  <div class="text-ui-small flex flex-col text-left">
                    <p>{{ work.data.companyInfo.legalName }}</p>
                    <p>{{ work.data.companyInfo.details }}</p>
                  </div>
                  <a
                    :href="work.data.companyInfo.website"
                    target="_blank"
                    class="bg-surface-secondary border-border-primary text-text-secondary text-ui hover:text-text-primary hover:border-border-hover flex cursor-pointer flex-row items-center justify-center gap-0.5 rounded-full border px-3 py-0.5 transition-colors"
                  >
                    {{ work.data.companyInfo.websiteLabel }}
                    <ArrowUpRight :size="16" />
                  </a>
                </div>
              </template>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ArrowUpRight, Undo } from '@lucide/vue'
import { animate, createDraggable } from 'animejs'
import { format } from 'date-fns'
import { computed, nextTick, ref, watch } from 'vue'

import { global } from '@/composables/useGlobal'
import { getStorageUrl } from '@/supabase'

import type { WorkDetail } from '@/data/work'

const props = defineProps<{
  isOpen: boolean
  work: null | WorkDetail
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

const sortedPeople = computed(() => {
  if (!props.work?.data?.people) return []
  return [...props.work.data.people].sort((a, b) => a.name.localeCompare(b.name))
})

const imageRefs = ref<HTMLElement[]>([])
let draggables: any[] = []
const isMoved = ref(false)

const resetImages = () => {
  isMoved.value = false
  draggables.forEach((d) => {
    animate(d, {
      duration: 600,
      ease: 'outBack',
      x: 0,
      y: 0,
    })
  })
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      global.activeModal.value = 'work'
      document.body.style.overflow = 'hidden'
      await nextTick()

      draggables.forEach((d) => d.stop?.())
      draggables = imageRefs.value.map((img) =>
        createDraggable(img, {
          onDrag: () => {
            isMoved.value = true
          },
          releaseDamping: 5,
          releaseStiffness: 0,
          velocityMultiplier: 1.5,
        }),
      )
    } else {
      if (global.activeModal.value === 'work') {
        global.activeModal.value = null
      }
      document.body.style.overflow = 'auto'
      draggables.forEach((d) => d.stop?.())
      draggables = []
      isMoved.value = false
    }
  },
)

const formatDuration = (start: string, end: null | string) => {
  const startFmt = format(new Date(start), 'MMMM yyyy')
  const endFmt = end ? format(new Date(end), 'MMMM yyyy') : 'Present'
  return `${startFmt}–${endFmt}`
}

const getWorkLogoUrl = (orgId: string) => {
  return new URL(`../assets/logos/${orgId}.webp`, import.meta.url).href
}

const getWorkImageUrl = (orgId: string, filename: string) => {
  const name = filename.replace(/\.[^/.]+$/, '')
  return getStorageUrl('webp', orgId, `${name}.webp`)
}

const getWorkPersonUrl = (orgId: string, filename: string) => {
  const name = filename.replace(/\.[^/.]+$/, '')
  return getStorageUrl('webp', orgId, `${name}.webp`)
}
</script>

<style scoped>
@reference "@/style.css";
</style>
