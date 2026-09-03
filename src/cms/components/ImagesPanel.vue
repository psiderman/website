<template>
  <div class="h-full">
    <div
      v-if="currentVisibleTrip"
      class="bg-surface-primary/95 border-border-primary fixed bottom-0 left-1/2 z-20 flex w-full max-w-120 -translate-x-1/2 items-center justify-between gap-2 border-t p-4 backdrop-blur-xs"
    >
      <div class="flex min-w-0 flex-col gap-0.5">
        <h3 class="text-ui text-text-primary truncate font-medium">
          {{ currentVisibleTrip.title }}
        </h3>
        <p class="text-ui-small text-text-tertiary truncate">
          {{ currentVisibleTrip.subtitle || formatTripDate(currentVisibleTrip.date) }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <button
          class="btn stroke icon-only"
          :disabled="activeImageTripIndex <= 0"
          aria-label="Previous trip"
          type="button"
          @click="scrollToTripIndex(activeImageTripIndex - 1)"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          class="btn stroke icon-only"
          :disabled="activeImageTripIndex >= tripsWithImagesGrouped.length - 1"
          aria-label="Next trip"
          type="button"
          @click="scrollToTripIndex(activeImageTripIndex + 1)"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <div
      ref="imagesScrollContainer"
      class="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      @scroll.passive="onImagesScroll"
    >
      <div
        v-for="trip in tripsWithImagesGrouped"
        :key="trip.slug"
        class="flex size-full shrink-0 snap-start scroll-m-4 flex-col gap-4 overflow-y-auto p-4 pb-28"
      >
        <!-- Public & Private Image Groups -->
        <div
          v-for="group in [
            { title: 'Public Images', images: trip.publicImages, isPublic: true },
            { title: 'Private Images', images: trip.privateImages, isPublic: false },
          ]"
          :key="group.title"
          class="flex flex-col gap-2"
          :class="{ 'pt-2': !group.isPublic }"
        >
          <span class="text-ui-small text-text-tertiary tracking-wider uppercase">
            {{ group.title }} ({{ group.images.length }})
          </span>

          <p v-if="group.images.length === 0" class="text-ui-small text-text-tertiary italic">
            No {{ group.isPublic ? 'public' : 'private' }} images
          </p>

          <div class="grid grid-cols-3 gap-2">
            <Disclosure
              v-for="img in group.images"
              :key="img.id"
              v-slot="{ close, open }"
              as="template"
            >
              <div
                :class="[
                  open ? 'col-span-3' : 'col-span-1',
                  savingImageId === img.id ? 'pointer-events-none opacity-50' : '',
                ]"
                class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border transition-opacity"
              >
                <DisclosureButton
                  class="relative aspect-square w-full cursor-pointer overflow-hidden text-left"
                >
                  <img
                    :src="getTripThumbnailUrl(img.storage_path)"
                    :alt="img.caption || img.storage_path"
                    class="size-full object-cover"
                  />
                  <!-- Clearance overlay circle -->
                  <div
                    class="bg-light absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full p-0.5 backdrop-blur-xs"
                  >
                    <div
                      :class="getRoleBadgeClass(img.clearance)"
                      class="size-2.5 rounded-full"
                    ></div>
                  </div>
                  <!-- Truncated caption overlay -->
                  <div
                    v-if="img.caption"
                    class="from-dark/80 via-dark/40 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent p-1.5 pt-4"
                  >
                    <p class="text-ui-small text-light truncate leading-tight italic">
                      “{{ img.caption }}”
                    </p>
                  </div>
                </DisclosureButton>

                <DisclosurePanel
                  class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
                >
                  <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                    <span class="pl-1.5">Clearance</span>
                    <ClearanceSelect
                      v-model="getEditImageForm(img).clearance"
                      :levels="clearanceLevels"
                      badge-class="h-5 w-1.5"
                    />
                  </label>

                  <div class="grid grid-cols-1 gap-3">
                    <div class="text-ui-small flex flex-col gap-1">
                      <span class="text-text-tertiary pl-1.5">Date Taken</span>
                      <div
                        class="bg-surface-primary border-border-primary text-text-secondary text-ui flex h-10.5 items-center gap-2 rounded-xl border px-3 py-2"
                      >
                        <Calendar :size="14" class="text-text-tertiary shrink-0" />
                        <span class="truncate">{{ formatImageDate(img.date_taken) }}</span>
                      </div>
                    </div>

                    <div class="text-ui-small flex flex-col gap-1">
                      <span class="text-text-tertiary pl-1.5">GPS Coordinates</span>
                      <div
                        class="bg-surface-primary border-border-primary text-text-secondary text-ui flex h-10.5 items-center justify-between gap-2 rounded-xl border px-3 py-2"
                      >
                        <div class="flex min-w-0 items-center gap-2">
                          <MapPin :size="14" class="text-text-tertiary shrink-0" />
                          <span class="text-mono truncate text-xs">
                            {{ formatImageGps(img.lat, img.lng) }}
                          </span>
                        </div>
                        <a
                          v-if="
                            img.lat !== null &&
                            img.lat !== undefined &&
                            img.lng !== null &&
                            img.lng !== undefined
                          "
                          :href="`https://www.google.com/maps?q=${img.lat},${img.lng}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-text-tertiary hover:text-text-primary shrink-0 transition-colors"
                          aria-label="Open location in Google Maps"
                          title="Open in Google Maps"
                        >
                          <ExternalLink :size="14" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                    <div class="flex items-center justify-between pl-1.5">
                      <span>Caption</span>
                      <span class="text-ui-small text-text-tertiary">
                        {{ getEditImageForm(img).caption.length }}/150
                      </span>
                    </div>
                    <textarea
                      v-model="getEditImageForm(img).caption"
                      rows="3"
                      maxlength="150"
                      class="bg-surface-primary font-handwriting border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2 font-normal"
                      placeholder="Enter caption..."
                      @keydown.enter.exact.prevent="saveImage(img, close)"
                      @input="
                        (e) =>
                          handleSmartApostrophes(e, (val) => (getEditImageForm(img).caption = val))
                      "
                    ></textarea>
                  </label>

                  <div class="flex items-center justify-between gap-2 pt-1">
                    <div class="flex gap-2">
                      <button
                        class="btn primary"
                        type="button"
                        :disabled="savingImageId === img.id"
                        @click="saveImage(img, close)"
                      >
                        {{ savingImageId === img.id ? 'Saving...' : 'Save' }}
                      </button>
                      <button class="btn stroke" type="button" @click="resetImage(img)">
                        Reset
                      </button>
                    </div>
                    <button
                      class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                      type="button"
                      @click="deleteImage(img)"
                    >
                      Delete
                    </button>
                  </div>
                </DisclosurePanel>
              </div>
            </Disclosure>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, MapPin } from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { sortTripImages } from '@/composables/useTravel'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import { clearanceLevels, getRoleBadgeClass } from '../utils/clearance'
import { formatImageDate, formatImageGps, formatTripDate } from '../utils/format'
import { getTripThumbnailUrl } from '../utils/media'
import { handleSmartApostrophes } from '../utils/text'
import ClearanceSelect from './ui/ClearanceSelect.vue'

import type { ImageEditForm, TripImageRecord, TripRecord } from '../types'
import type { ClearanceLevel } from '@/types'

const queryClient = useQueryClient()

const editImageForms = reactive<Record<string, ImageEditForm>>({})
const savingImageId = ref<null | string>(null)

const { data: adminTripsImagesData } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*, trip_images(*)')
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },
  queryKey: queryKeys.admin.images,
})

interface TripsWithImagesGroup {
  date: string
  privateImages: TripImageRecord[]
  publicImages: TripImageRecord[]
  slug: string
  subtitle: null | string
  title: string
}

const tripsWithImagesGrouped = computed<TripsWithImagesGroup[]>(() => {
  const list = (adminTripsImagesData.value || []) as Array<
    TripRecord & { trip_images?: TripImageRecord[] }
  >
  return list.map((trip) => {
    const images: TripImageRecord[] = sortTripImages(trip.trip_images || [])

    return {
      date: trip.date,
      privateImages: images.filter((img) => img.clearance !== 'public'),
      publicImages: images.filter((img) => img.clearance === 'public'),
      slug: trip.slug,
      subtitle: trip.subtitle,
      title: trip.title,
    }
  })
})

const activeImageTripIndex = ref(0)
const imagesScrollContainer = ref<HTMLElement | null>(null)
let scrollRafId: null | number = null

function onImagesScroll(e: Event) {
  if (scrollRafId !== null) return
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null
    const el = e.target as HTMLElement
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (
      index !== activeImageTripIndex.value &&
      index >= 0 &&
      index < tripsWithImagesGrouped.value.length
    ) {
      activeImageTripIndex.value = index
    }
  })
}

function scrollToTripIndex(index: number) {
  if (!imagesScrollContainer.value) return
  const targetIndex = Math.max(0, Math.min(index, tripsWithImagesGrouped.value.length - 1))
  const containerWidth = imagesScrollContainer.value.clientWidth
  imagesScrollContainer.value.scrollTo({
    behavior: 'smooth',
    left: targetIndex * containerWidth,
  })
}

const currentVisibleTrip = computed(() => {
  const list = tripsWithImagesGrouped.value
  return list[activeImageTripIndex.value] || null
})

async function deleteImage(img: TripImageRecord) {
  if (!confirm('Are you sure you want to delete this image?')) return

  try {
    const { error } = await supabase.from('trip_images').delete().eq('id', img.id)
    if (error) throw error

    if (img.storage_path) {
      await supabase.storage.from('travel').remove([img.storage_path, `thumb/${img.storage_path}`])
    }

    delete editImageForms[img.id]

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.images })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.tripsWithImages })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.tripImages })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete image: ${errorMsg}`)
  }
}

function getEditImageForm(img: TripImageRecord): ImageEditForm {
  if (!editImageForms[img.id]) {
    editImageForms[img.id] = {
      caption: img.caption || '',
      clearance: img.clearance,
    }
  }
  return editImageForms[img.id]
}

function resetImage(img: TripImageRecord) {
  editImageForms[img.id] = {
    caption: img.caption || '',
    clearance: img.clearance,
  }
}

async function saveImage(img: TripImageRecord, close?: () => void) {
  const form = getEditImageForm(img)
  savingImageId.value = img.id

  try {
    const isMovingFromPublicToPrivate = img.clearance === 'public' && form.clearance !== 'public'
    const isMovingFromPrivateToPublic = img.clearance !== 'public' && form.clearance === 'public'
    let newStoragePath: null | string = null

    if (isMovingFromPublicToPrivate && !img.storage_path.includes('/pvt/')) {
      const fileName = img.storage_path.split('/').pop() || img.storage_path
      const fromPath = img.storage_path
      const toPath = `${img.trip_slug}/pvt/${fileName}`

      const fromThumbPath = `thumb/${fromPath}`
      const toThumbPath = `thumb/${toPath}`

      // Move full image
      const { error: moveError } = await supabase.storage.from('travel').move(fromPath, toPath)
      if (moveError) throw moveError

      // Move thumbnail image
      const { error: moveThumbError } = await supabase.storage
        .from('travel')
        .move(fromThumbPath, toThumbPath)

      if (moveThumbError) {
        console.warn('Failed to move thumbnail image:', moveThumbError)
      }

      newStoragePath = toPath
    } else if (isMovingFromPrivateToPublic && img.storage_path.includes('/pvt/')) {
      const fileName = img.storage_path.split('/').pop() || img.storage_path
      const fromPath = img.storage_path
      const toPath = `${img.trip_slug}/${fileName}`

      const fromThumbPath = `thumb/${fromPath}`
      const toThumbPath = `thumb/${toPath}`

      // Move full image
      const { error: moveError } = await supabase.storage.from('travel').move(fromPath, toPath)
      if (moveError) throw moveError

      // Move thumbnail image
      const { error: moveThumbError } = await supabase.storage
        .from('travel')
        .move(fromThumbPath, toThumbPath)

      if (moveThumbError) {
        console.warn('Failed to move thumbnail image:', moveThumbError)
      }

      newStoragePath = toPath
    }

    const updatePayload: {
      caption: null | string
      clearance: ClearanceLevel
      storage_path?: string
    } = {
      caption: form.caption.trim() || null,
      clearance: form.clearance,
    }

    if (newStoragePath) {
      updatePayload.storage_path = newStoragePath
    }

    const { error } = await supabase.from('trip_images').update(updatePayload).eq('id', img.id)

    if (error) throw error

    if (newStoragePath) {
      img.storage_path = newStoragePath
    }
    img.caption = form.caption.trim() || null
    img.clearance = form.clearance

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.images })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.tripsWithImages })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.tripImages })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save image: ${errorMsg}`)
  } finally {
    savingImageId.value = null
  }
}
</script>
