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

      <div
        ref="scrollContainerRef"
        class="fixed inset-0 overflow-y-auto overscroll-y-contain"
        :style="{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }"
        @touchstart.passive="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      >
        <div class="desktop:p-10 flex min-h-full items-start justify-center p-0 pt-8 text-center">
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
              :style="
                translateY > 0
                  ? {
                      transform: `translateY(${translateY}px)`,
                      transition: isDraggingDown ? 'none' : 'transform 0.2s ease-out',
                    }
                  : undefined
              "
            >
              <template v-if="work">
                <div
                  class="bg-background border-border-primary relative flex h-20 w-full flex-row items-center justify-between border-b px-6 py-5"
                >
                  <div
                    class="desktop:hidden bg-border-primary/80 absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full"
                  />
                  <div class="flex flex-row gap-2 text-left">
                    <img
                      v-lazy="getWorkLogoUrl(work.orgId)"
                      :alt="`${work.orgName} logo`"
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
                  <button
                    type="button"
                    aria-label="Close modal"
                    class="hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors"
                    @click="closeModal"
                  >
                    <X :size="20" />
                  </button>
                </div>

                <div
                  class="border-border-primary desktop:flex-row flex w-full flex-col items-center gap-10 border-b p-10"
                >
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
                      v-lazy="getWorkImageUrl(work.orgId, img.src)"
                      draggable="false"
                      :alt="`${work.orgName} photo ${idx + 1}`"
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
                  v-if="sortedPeople.length > 0 || work.data?.projects"
                  class="border-border-primary desktop:flex-row desktop:gap-6 desktop:p-10 flex w-full flex-col border-b text-left"
                >
                  <div
                    v-if="work.data?.projects"
                    class="text-text-primary text-ui border-border-primary desktop:p-0 desktop:border-b-0 desktop:border-transparent flex w-full flex-col gap-2 border-b p-10"
                  >
                    <p class="text-ui-small text-text-tertiary tracking-wider uppercase">
                      Projects I worked on
                    </p>
                    <component
                      :is="project.link ? 'a' : 'div'"
                      v-for="(project, idx) in work.data?.projects"
                      :key="project.name"
                      v-reveal="idx * 50"
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
                    v-if="sortedPeople.length > 0"
                    class="text-text-primary text-ui border-border-primary desktop:p-0 desktop:border-b-0 desktop:border-transparent flex w-full flex-col gap-2 border-b p-10"
                  >
                    <p class="text-text-tertiary text-ui-small tracking-wider uppercase">
                      People I worked with
                    </p>
                    <template v-if="peopleByDept.length > 1">
                      <div
                        v-for="group in peopleByDept"
                        :key="group.dept"
                        class="flex flex-col gap-1"
                      >
                        <p class="text-text-tertiary text-ui-small">{{ group.dept }}</p>
                        <div class="flex flex-row flex-wrap gap-1">
                          <component
                            :is="person.linkedin ? 'a' : 'div'"
                            v-for="(person, idx) in group.people"
                            :key="person.name"
                            v-reveal="(group.startIndex + idx) * 50"
                            v-tooltip="{
                              content: personTooltip(person),
                              trigger: 'mouseenter',
                              allowHTML: true,
                            }"
                            :href="person.linkedin"
                            :target="person.linkedin ? '_blank' : undefined"
                          >
                            <img
                              v-lazy="getWorkPersonUrl(work.orgId, person.imageName)"
                              :alt="person.name"
                              class="border-border-primary size-10 rounded-full border object-cover outline-0 transition-transform hover:scale-110"
                              height="128"
                              width="128"
                            />
                          </component>
                        </div>
                      </div>
                    </template>
                    <div v-else class="flex flex-row flex-wrap gap-1">
                      <component
                        :is="person.linkedin ? 'a' : 'div'"
                        v-for="(person, idx) in sortedPeople"
                        :key="person.name"
                        v-reveal="idx * 50"
                        v-tooltip="{
                          content: personTooltip(person),
                          trigger: 'mouseenter',
                          allowHTML: true,
                        }"
                        :href="person.linkedin"
                        :target="person.linkedin ? '_blank' : undefined"
                      >
                        <img
                          v-lazy="getWorkPersonUrl(work.orgId, person.imageName)"
                          :alt="person.name"
                          class="border-border-primary size-10 rounded-full border object-cover outline-0 transition-transform hover:scale-110"
                          height="128"
                          width="128"
                        />
                      </component>
                    </div>
                    <p
                      v-reveal="sortedPeople.length * 50"
                      class="text-ui-small text-text-tertiary mt-auto text-left"
                    >
                      DM me if you'd like me to make changes to your picture, link, or tooltip text.
                    </p>
                  </div>
                </div>

                <div
                  v-if="work.data?.companyInfo"
                  class="bg-background text-text-secondary desktop:flex-row desktop:items-center desktop:gap-0 flex w-full flex-col items-start justify-between gap-8 p-10"
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
import { ArrowUpRight, Undo, X } from '@lucide/vue'
import { useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'
import DOMPurify from 'dompurify'
import { computed, nextTick, ref, watch } from 'vue'

import { queryKeys } from '@/queryKeys'
import { getStorageUrl, supabase } from '@/supabase'
import { type Department, DEPARTMENTS } from '@/types'

import type { WorkDetail, WorkPerson } from '@/data/work'

// People names/quotes are DB-supplied — reduce them to plain text before
// they're interpolated into the allowHTML tooltip.
const TEXT_CLEAN = { ALLOWED_ATTR: [], ALLOWED_TAGS: [] }

const personTooltip = (person: WorkPerson) => {
  const name = DOMPurify.sanitize(person.name, TEXT_CLEAN)
  if (!person.quote) return name
  const quote = DOMPurify.sanitize(person.quote, TEXT_CLEAN)
  return `<blockquote>“${quote}”</blockquote>–${name}`
}

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

const scrollContainerRef = ref<HTMLElement | null>(null)
const translateY = ref(0)
const isDraggingDown = ref(false)
const touchStartY = ref(0)
const touchStartX = ref(0)
const isTouching = ref(false)

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length !== 1) return
  const target = e.target as HTMLElement
  if (target.closest('.image-polaroid') || target.closest('button') || target.closest('a')) return

  const container = scrollContainerRef.value
  const atTop = !container || container.scrollTop <= 0

  if (atTop) {
    touchStartY.value = e.touches[0].clientY
    touchStartX.value = e.touches[0].clientX
    isTouching.value = true
    isDraggingDown.value = false
  }
}

const onTouchMove = (e: TouchEvent) => {
  if (!isTouching.value) return
  const currentY = e.touches[0].clientY
  const currentX = e.touches[0].clientX
  const deltaY = currentY - touchStartY.value
  const deltaX = currentX - touchStartX.value

  const container = scrollContainerRef.value
  const atTop = !container || container.scrollTop <= 0

  if (!isDraggingDown.value) {
    if (atTop && deltaY > 10 && deltaY > Math.abs(deltaX) * 1.2) {
      isDraggingDown.value = true
    } else if (deltaY < 0 || Math.abs(deltaX) > deltaY) {
      isTouching.value = false
      return
    }
  }

  if (isDraggingDown.value) {
    if (deltaY > 0) {
      if (e.cancelable) e.preventDefault()
      translateY.value = Math.pow(deltaY, 0.9)
    } else {
      translateY.value = 0
    }
  }
}

const onTouchEnd = () => {
  if (isDraggingDown.value) {
    if (translateY.value > 80) {
      closeModal()
    }
  }
  isTouching.value = false
  isDraggingDown.value = false
  translateY.value = 0
}

const activeOrgId = computed(() => props.work?.orgId)

const { data: peopleData } = useQuery({
  enabled: computed(() => !!activeOrgId.value && props.isOpen),
  queryFn: async () => {
    const orgId = activeOrgId.value
    if (!orgId) return []
    const { data, error } = await supabase
      .from('work_people')
      .select('name, imageName, linkedin, quote, dept')
      .eq('orgId', orgId)

    if (error) throw error
    return data as WorkPerson[]
  },
  queryKey: queryKeys.workPeople.byOrg(activeOrgId),
})

const sortedPeople = computed(() => {
  const list = peopleData.value || []
  return [...list].sort((a, b) => a.name.localeCompare(b.name))
})

const peopleByDept = computed(() => {
  const groups = new Map<Department, WorkPerson[]>()
  for (const person of sortedPeople.value) {
    const dept = person.dept ?? 'Design'
    if (!groups.has(dept)) groups.set(dept, [])
    groups.get(dept)!.push(person)
  }
  let offset = 0
  return DEPARTMENTS.filter((d) => groups.has(d)).map((dept) => {
    const people = groups.get(dept)!
    const group = { dept, people, startIndex: offset }
    offset += people.length
    return group
  })
})

const imageRefs = ref<HTMLElement[]>([])
let draggables: { stop?: () => void }[] = []
const isMoved = ref(false)

const resetImages = () => {
  isMoved.value = false
  draggables.forEach((d) => {
    void import('animejs').then(({ animate }) => {
      animate(d, {
        duration: 600,
        ease: 'outBack',
        x: 0,
        y: 0,
      })
    })
  })
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()

      draggables.forEach((d) => d.stop?.())
      const { createDraggable } = await import('animejs')
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
