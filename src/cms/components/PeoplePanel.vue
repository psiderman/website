<template>
  <div class="relative h-full">
    <!-- Org navigation bar -->
    <div
      v-if="currentVisibleOrg"
      class="bg-surface-primary/95 border-border-primary fixed bottom-0 left-1/2 z-20 flex w-full max-w-120 -translate-x-1/2 items-center justify-between gap-2 border-t p-4 backdrop-blur-xs"
    >
      <div class="flex min-w-0 flex-col gap-0.5">
        <h3 class="text-ui text-text-primary truncate font-medium">
          {{ currentVisibleOrg.name }}
        </h3>
        <p class="text-ui-small text-text-tertiary truncate">
          {{ currentVisibleOrg.peopleCount }} people
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <button class="btn stroke text-ui-small" type="button" @click="isAddPersonModalOpen = true">
          <Plus :size="16" /> Add person
        </button>
        <button
          class="btn stroke icon-only"
          :disabled="activeOrgIndex <= 0"
          aria-label="Previous org"
          type="button"
          @click="scrollToOrgIndex(activeOrgIndex - 1)"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          class="btn stroke icon-only"
          :disabled="activeOrgIndex >= orgsWithPeople.length - 1"
          aria-label="Next org"
          type="button"
          @click="scrollToOrgIndex(activeOrgIndex + 1)"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- Org slides -->
    <div
      ref="scrollContainer"
      class="h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      @scroll.passive="onScroll"
    >
      <div
        v-for="org in orgsWithPeople"
        :key="org.id"
        class="flex size-full shrink-0 snap-start scroll-m-4 flex-col gap-4 overflow-y-auto p-4 pb-28"
      >
        <h3 class="text-ui-small text-text-tertiary tracking-wider uppercase">
          {{ org.name }}
        </h3>

        <div v-for="group in org.groups" :key="group.dept" class="flex flex-col gap-2">
          <span class="text-ui-small text-text-tertiary tracking-wider uppercase">
            {{ group.dept }} ({{ group.people.length }})
          </span>

          <Disclosure
            v-for="person in group.people"
            :key="`${person.orgId}:${person.name}`"
            v-slot="{ close }"
            as="div"
            class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
          >
            <DisclosureButton class="w-full p-2 text-left">
              <div class="flex items-center gap-2 not-last:pb-3">
                <img
                  :src="getWorkPersonUrl(person.orgId, person.imageName)"
                  :alt="person.name"
                  class="size-8 rounded-full object-cover"
                  @error="(e: Event) => ((e.target as HTMLElement).style.display = 'none')"
                />
                <div class="flex min-w-0 flex-col gap-0">
                  <p class="text-ui text-text-primary">{{ person.name }}</p>
                  <div class="inline-flex shrink-0 flex-row items-center justify-center gap-1">
                    <p
                      v-if="person.linkedin"
                      class="text-ui-small text-text-secondary w-full truncate"
                    >
                      {{ person.linkedin }}
                    </p>
                    <a
                      v-if="person.linkedin"
                      :href="person.linkedin"
                      target="_blank"
                      :aria-label="`${person.name} LinkedIn profile`"
                      @click.stop
                    >
                      <ExternalLink :size="12" class="text-text-tertiary" />
                    </a>
                  </div>
                </div>
              </div>
              <div v-if="person.quote" class="border-border-primary border-t pt-3">
                <p class="text-p-small text-text-secondary border-l-2 pl-2 italic">
                  {{ person.quote }}
                </p>
              </div>
            </DisclosureButton>

            <DisclosurePanel
              class="border-border-primary bg-surface-secondary flex flex-col gap-2 border-t p-4"
            >
              <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                <span class="pl-1.5">Name</span>
                <input
                  v-model="getEditForm(person).name"
                  class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                  type="text"
                />
              </label>
              <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                <span class="pl-1.5">Image Name</span>
                <input
                  v-model="getEditForm(person).imageName"
                  class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                  type="text"
                />
              </label>
              <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                <span class="pl-1.5">LinkedIn URL</span>
                <input
                  v-model="getEditForm(person).linkedin"
                  class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                  type="text"
                />
              </label>
              <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                <span class="pl-1.5">Quote</span>
                <textarea
                  v-model="getEditForm(person).quote"
                  rows="2"
                  class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                ></textarea>
              </label>
              <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                <span class="pl-1.5">Department</span>
                <select
                  v-model="getEditForm(person).dept"
                  class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                >
                  <option v-for="dept in DEPARTMENTS" :key="dept" :value="dept">
                    {{ dept }}
                  </option>
                </select>
              </label>
              <div class="flex items-center justify-between gap-2 p-2">
                <div class="flex gap-2">
                  <button
                    class="btn primary"
                    type="button"
                    :disabled="savingPersonKey === `${person.orgId}:${person.name}`"
                    @click="savePerson(person, close)"
                  >
                    {{
                      savingPersonKey === `${person.orgId}:${person.name}` ? 'Saving...' : 'Save'
                    }}
                  </button>
                  <button class="btn stroke" type="button" @click="resetPerson(person)">
                    Reset
                  </button>
                </div>
                <button
                  class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                  type="button"
                  @click="deletePerson(person)"
                >
                  Delete
                </button>
              </div>
            </DisclosurePanel>
          </Disclosure>
        </div>
      </div>
    </div>

    <AddPersonModal v-model:is-open="isAddPersonModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronLeft, ChevronRight, ExternalLink, Plus } from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { workHistory } from '@/data/work'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'
import { type Department, DEPARTMENTS } from '@/types'

import { getWorkPersonUrl } from '../utils/media'
import AddPersonModal from './modals/AddPersonModal.vue'

import type { PersonForm, WorkPersonRecord } from '../types'

const queryClient = useQueryClient()

const editForms = reactive<Record<string, PersonForm>>({})
const savingPersonKey = ref<null | string>(null)

const { data: peopleList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('work_people')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []) as WorkPersonRecord[]
  },
  queryKey: queryKeys.admin.workPeople,
})

interface OrgSlide {
  groups: Array<{ dept: Department; people: WorkPersonRecord[] }>
  id: string
  name: string
  peopleCount: number
}

const orgsWithPeople = computed<OrgSlide[]>(() => {
  const people = peopleList.value || []
  const orgMap = new Map<string, OrgSlide & { people: WorkPersonRecord[] }>()

  workHistory.forEach((w) => {
    if (w.orgId && !orgMap.has(w.orgId)) {
      orgMap.set(w.orgId, {
        groups: [],
        id: w.orgId,
        name: w.orgName,
        people: [],
        peopleCount: 0,
      })
    }
  })

  people.forEach((p) => {
    if (!orgMap.has(p.orgId)) {
      orgMap.set(p.orgId, {
        groups: [],
        id: p.orgId,
        name: p.orgId,
        people: [],
        peopleCount: 0,
      })
    }
    orgMap.get(p.orgId)!.people.push(p)
  })

  return Array.from(orgMap.values())
    .filter((org) => org.people.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((org) => {
      const groupsMap = new Map<Department, WorkPersonRecord[]>()
      for (const person of org.people) {
        const dept = person.dept || 'Design'
        if (!groupsMap.has(dept)) groupsMap.set(dept, [])
        groupsMap.get(dept)!.push(person)
      }
      return {
        groups: DEPARTMENTS.filter((d) => groupsMap.has(d)).map((dept) => ({
          dept,
          people: groupsMap.get(dept)!,
        })),
        id: org.id,
        name: org.name,
        peopleCount: org.people.length,
      }
    })
})

const isAddPersonModalOpen = ref(false)

const activeOrgIndex = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)
let scrollRafId: null | number = null

function onScroll(e: Event) {
  if (scrollRafId !== null) return
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null
    const el = e.target as HTMLElement
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (index !== activeOrgIndex.value && index >= 0 && index < orgsWithPeople.value.length) {
      activeOrgIndex.value = index
    }
  })
}

function scrollToOrgIndex(index: number) {
  if (!scrollContainer.value) return
  const targetIndex = Math.max(0, Math.min(index, orgsWithPeople.value.length - 1))
  const containerWidth = scrollContainer.value.clientWidth
  scrollContainer.value.scrollTo({
    behavior: 'smooth',
    left: targetIndex * containerWidth,
  })
}

const currentVisibleOrg = computed(() => {
  const list = orgsWithPeople.value
  return list[activeOrgIndex.value] || null
})

async function deletePerson(person: WorkPersonRecord) {
  if (!confirm(`Are you sure you want to delete ${person.name}?`)) return

  try {
    const { error } = await supabase
      .from('work_people')
      .delete()
      .eq('orgId', person.orgId)
      .eq('name', person.name)

    if (error) throw error

    delete editForms[getPersonKey(person)]

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.workPeople })
    await queryClient.invalidateQueries({ queryKey: queryKeys.workPeople.list })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete person: ${errorMsg}`)
  }
}

function getEditForm(person: WorkPersonRecord): PersonForm {
  const key = getPersonKey(person)
  if (!editForms[key]) {
    editForms[key] = {
      dept: person.dept || 'Design',
      imageName: person.imageName || '',
      linkedin: person.linkedin || '',
      name: person.name || '',
      quote: person.quote || '',
    }
  }
  return editForms[key]
}

function getPersonKey(person: { name: string; orgId: string }) {
  return `${person.orgId}:${person.name}`
}

function resetPerson(person: WorkPersonRecord) {
  const key = getPersonKey(person)
  editForms[key] = {
    dept: person.dept || 'Design',
    imageName: person.imageName || '',
    linkedin: person.linkedin || '',
    name: person.name || '',
    quote: person.quote || '',
  }
}

async function savePerson(person: WorkPersonRecord, close?: () => void) {
  const key = getPersonKey(person)
  const form = getEditForm(person)
  savingPersonKey.value = key

  try {
    const { error } = await supabase
      .from('work_people')
      .update({
        dept: form.dept,
        imageName: form.imageName,
        linkedin: form.linkedin || null,
        name: form.name,
        quote: form.quote || null,
      })
      .eq('orgId', person.orgId)
      .eq('name', person.name)

    if (error) throw error

    person.name = form.name
    person.dept = form.dept
    person.imageName = form.imageName
    person.linkedin = form.linkedin || null
    person.quote = form.quote || null

    if (form.name !== person.name) {
      delete editForms[key]
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.workPeople })
    await queryClient.invalidateQueries({ queryKey: queryKeys.workPeople.list })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save person: ${errorMsg}`)
  } finally {
    savingPersonKey.value = null
  }
}
</script>
