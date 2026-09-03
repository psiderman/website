<template>
  <div class="flex flex-col gap-3 p-4">
    <Disclosure
      v-for="trip in tripsList"
      :key="trip.slug"
      v-slot="{ close }"
      as="div"
      class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
    >
      <DisclosureButton
        class="flex w-full cursor-pointer flex-row items-center justify-between p-3 text-left"
      >
        <div class="flex min-w-0 flex-col gap-0">
          <p class="text-ui text-text-primary truncate font-medium">{{ trip.title }}</p>
          <p class="text-ui-small text-text-secondary truncate">
            {{ trip.subtitle || formatTripDate(trip.date) }}
          </p>
        </div>

        <div class="flex shrink-0 flex-row items-center gap-2">
          <!-- Close Friends -->
          <TheListIndicator
            v-if="isHighClearance(trip.clearance)"
            size="md"
            :border="false"
            tooltip
          />

          <!-- Repeat status -->
          <div
            v-if="trip.repeat_visit"
            v-tooltip="{ content: 'Revisited' }"
            class="text-text-secondary flex size-6 items-center justify-center"
          >
            <Repeat :size="16" />
          </div>

          <!-- Instagram Link Button -->
          <a
            v-if="trip.instagram_link"
            v-tooltip="{ content: 'Instagram' }"
            :href="trip.instagram_link"
            target="_blank"
            :aria-label="`${trip.title} Instagram`"
            class="text-text-secondary hover:text-text-primary flex size-6 items-center justify-center"
            @click.stop
          >
            <FA :icon="['fab', 'instagram']" class="text-ui" />
          </a>

          <!-- Google Maps list link button -->
          <a
            v-if="trip.maps_list_link"
            v-tooltip="{ content: 'Maps' }"
            :href="trip.maps_list_link"
            target="_blank"
            :aria-label="`${trip.title} Maps`"
            class="text-text-secondary hover:text-text-primary flex size-6 items-center justify-center"
            @click.stop
          >
            <Pin :size="16" />
          </a>
        </div>
      </DisclosureButton>

      <DisclosurePanel
        class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
      >
        <div class="flex flex-col gap-2">
          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Clearance</span>
            <ClearanceSelect
              v-model="getEditTripForm(trip).clearance"
              :levels="tripClearanceLevels"
              badge-class="h-6 w-1.5"
            />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Title</span>
            <input
              v-model="getEditTripForm(trip).title"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Subtitle</span>
            <input
              v-model="getEditTripForm(trip).subtitle"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
              placeholder="e.g. November 2024"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Slug</span>
            <input
              v-model="getEditTripForm(trip).slug"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Date</span>
            <input
              v-model="getEditTripForm(trip).date"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="date"
            />
          </label>
        </div>

        <ToggleSwitch v-model="getEditTripForm(trip).repeat_visit" label="Repeat Visit" />

        <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
          <span class="pl-1.5">Description (one line per paragraph)</span>
          <textarea
            v-model="getEditTripForm(trip).descriptionText"
            rows="3"
            class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
            @input="
              (e) =>
                handleSmartApostrophes(e, (val) => (getEditTripForm(trip).descriptionText = val))
            "
          ></textarea>
        </label>

        <div class="flex flex-col gap-2">
          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Instagram Link</span>
            <input
              v-model="getEditTripForm(trip).instagram_link"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Maps Link</span>
            <input
              v-model="getEditTripForm(trip).maps_list_link"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
            />
          </label>
        </div>

        <div class="flex items-center justify-between gap-2 pt-2">
          <div class="flex gap-2">
            <button
              class="btn primary"
              type="button"
              :disabled="savingTripSlug === trip.slug"
              @click="saveTrip(trip, close)"
            >
              {{ savingTripSlug === trip.slug ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn stroke" type="button" @click="resetTrip(trip)">Reset</button>
          </div>
          <button
            class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
            type="button"
            @click="deleteTrip(trip.slug)"
          >
            Delete
          </button>
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { Pin, Repeat } from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'

import TheListIndicator from '@/components/TheListIndicator.vue'
import { isAdmin } from '@/composables/useAuth'
import { isHighClearance } from '@/composables/useTravel'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import { clearanceLevels } from '../utils/clearance'
import { formatTripDate } from '../utils/format'
import { handleSmartApostrophes } from '../utils/text'
import ClearanceSelect from './ui/ClearanceSelect.vue'
import ToggleSwitch from './ui/ToggleSwitch.vue'

import type { TripForm, TripRecord } from '../types'
import type { ClearanceLevel } from '@/types'

const queryClient = useQueryClient()

const tripClearanceLevels: ClearanceLevel[] = [...clearanceLevels, 'public']

const editTripForms = reactive<Record<string, TripForm>>({})
const savingTripSlug = ref<null | string>(null)

const { data: tripsList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []) as TripRecord[]
  },
  queryKey: queryKeys.admin.trips,
})

async function deleteTrip(slug: string) {
  if (!confirm(`Are you sure you want to delete trip "${slug}"?`)) return

  try {
    const { error } = await supabase.from('trips').delete().eq('slug', slug)
    if (error) throw error

    delete editTripForms[slug]

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.trips })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.tripsWithImages })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete trip: ${errorMsg}`)
  }
}

function getEditTripForm(trip: TripRecord): TripForm {
  if (!editTripForms[trip.slug]) {
    editTripForms[trip.slug] = {
      clearance: trip.clearance || 'public',
      date: trip.date ? (trip.date.length >= 10 ? trip.date.slice(0, 10) : trip.date) : '',
      descriptionText: (trip.description || []).join('\n'),
      instagram_link: trip.instagram_link || '',
      maps_list_link: trip.maps_list_link || '',
      repeat_visit: !!trip.repeat_visit,
      slug: trip.slug,
      subtitle: trip.subtitle || '',
      title: trip.title || '',
    }
  }
  return editTripForms[trip.slug]
}

function resetTrip(trip: TripRecord) {
  editTripForms[trip.slug] = {
    clearance: trip.clearance || 'public',
    date: trip.date ? (trip.date.length >= 10 ? trip.date.slice(0, 10) : trip.date) : '',
    descriptionText: (trip.description || []).join('\n'),
    instagram_link: trip.instagram_link || '',
    maps_list_link: trip.maps_list_link || '',
    repeat_visit: !!trip.repeat_visit,
    slug: trip.slug,
    subtitle: trip.subtitle || '',
    title: trip.title || '',
  }
}

async function saveTrip(trip: TripRecord, close?: () => void) {
  const form = getEditTripForm(trip)
  savingTripSlug.value = trip.slug

  const descArray = form.descriptionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  try {
    const { error } = await supabase
      .from('trips')
      .update({
        clearance: form.clearance,
        date: form.date,
        description: descArray,
        instagram_link: form.instagram_link || null,
        maps_list_link: form.maps_list_link || null,
        repeat_visit: form.repeat_visit,
        slug: form.slug,
        subtitle: form.subtitle || null,
        title: form.title,
      })
      .eq('slug', trip.slug)

    if (error) throw error

    trip.title = form.title
    trip.subtitle = form.subtitle || null
    trip.slug = form.slug
    trip.date = form.date
    trip.description = descArray
    trip.instagram_link = form.instagram_link || null
    trip.maps_list_link = form.maps_list_link || null
    trip.repeat_visit = form.repeat_visit
    trip.clearance = form.clearance

    if (form.slug !== trip.slug) {
      delete editTripForms[trip.slug]
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.trips })
    await queryClient.invalidateQueries({ queryKey: queryKeys.travel.tripsWithImages })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save trip: ${errorMsg}`)
  } finally {
    savingTripSlug.value = null
  }
}
</script>
