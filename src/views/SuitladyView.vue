<template>
  <TabGroup
    :selected-index="selectedTab"
    as="div"
    class="flex h-screen w-screen flex-col"
    @change="(index: number) => (selectedTab = index)"
  >
    <div
      class="bg-surface-inverted text-text-inverted-primary text-ui flex items-center justify-center border-b border-transparent p-2"
    >
      suitlady v1.1
    </div>
    <TabList
      class="border-border-primary noscrollbar flex w-full flex-row gap-1 overflow-scroll border-b"
    >
      <Tab v-for="tab in tabs" :key="tab.name" v-slot="{ selected }" as="template">
        <button
          class="text-ui flex cursor-pointer flex-row items-center justify-center gap-2 border-b-2 p-2 transition-colors outline-none"
          :class="
            selected
              ? 'border-surface-inverted text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary border-transparent'
          "
        >
          <component :is="tab.icon" :size="16" />
          <span>{{ tab.name }}</span>
        </button>
      </Tab>
    </TabList>

    <TabPanels
      ref="scrollContainer"
      class="relative h-full w-full overflow-auto"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Pull to Refresh Indicator -->
      <div
        class="pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center justify-center transition-all duration-150 ease-out"
        :style="{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? Math.min(pullDistance / pullThreshold, 1) : 0,
          transform: `translateY(${Math.min(pullDistance, pullThreshold * 1.5)}px)`,
        }"
      >
        <div
          class="bg-surface-primary border-border-primary flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
        >
          <Loader
            :size="16"
            :class="['text-text-primary', isRefreshing ? 'animate-spin' : '']"
            :style="{
              transform: !isRefreshing ? `rotate(${pullDistance * 3}deg)` : undefined,
            }"
          />
          <span class="text-ui-small text-text-secondary">
            {{
              isRefreshing
                ? 'Refreshing...'
                : pullDistance > pullThreshold
                  ? 'Release to refresh'
                  : 'Pull to refresh'
            }}
          </span>
        </div>
      </div>

      <!-- Roles Tab Panel -->
      <TabPanel class="outline-none">
        <div v-for="user in userRolesList" :key="user.user_id" class="px-4">
          <!-- User / Image + Name -->
          <div
            class="border-border-primary relative flex w-full flex-row items-center justify-between gap-4 border-b py-4"
          >
            <div class="relative flex min-w-0 flex-1 flex-row items-center gap-2">
              <div
                class="border-border-primary bg-surface-secondary size-8 shrink-0 overflow-hidden rounded-full border"
              >
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.full_name || 'User avatar'"
                  class="size-full object-cover"
                  @error="user.avatar_url = undefined"
                />
                <div
                  v-else
                  class="text-text-tertiary flex size-full items-center justify-center font-medium uppercase"
                >
                  {{ (user.full_name || user.email || 'U').charAt(0) }}
                </div>
              </div>
              <div class="flex min-w-0 flex-1 flex-col">
                <p class="text-text-primary truncate font-medium">
                  {{ user.full_name }}
                </p>
                <p class="text-text-tertiary text-mono truncate" :title="user.user_id">
                  {{ user.email }}
                </p>
              </div>
            </div>
            <div
              class="text-ui border-border-primary bg-surface-primary relative inline-flex h-8 min-w-28 cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-0"
            >
              <div class="flex flex-row items-center justify-start gap-1">
                <div
                  :class="getRoleBadgeClass(pendingRoles[user.user_id] || user.role)"
                  class="h-4 w-1.5 rounded-full"
                ></div>
                <span>{{ pendingRoles[user.user_id] || user.role }}</span>
              </div>

              <ChevronDown :size="14" class="shrink-0 opacity-70" />

              <select
                v-model="pendingRoles[user.user_id]"
                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                @change="saveRole(user)"
              >
                <option v-for="role in clearanceLevels" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- People Tab Panel -->
      <TabPanel class="outline-none">
        <div class="flex snap-x snap-mandatory overflow-x-auto p-4 pb-24">
          <div
            v-for="org in orgsWithPeople"
            :key="org.id"
            class="flex w-full shrink-0 snap-start scroll-m-4 flex-col gap-1 p-4"
          >
            <h3 class="text-ui-small text-text-tertiary tracking-wider uppercase">
              {{ org.name }}
            </h3>

            <Disclosure
              v-for="person in org.people"
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
                      <a v-if="person.linkedin" :href="person.linkedin" target="_blank" @click.stop>
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
        <div
          class="bg-surface-secondary border-border-high-contrast fixed bottom-0 w-full border-t p-4"
        >
          <button class="btn primary w-full" type="button" @click="openAddPersonModal">
            <Plus :size="16" /> Add person
          </button>
        </div>
      </TabPanel>

      <!-- Trip Tab Panel -->
      <TabPanel class="outline-none">
        <!-- Content for trip -->
      </TabPanel>

      <!-- Images Tab Panel -->
      <TabPanel class="outline-none">
        <!-- Content for images -->
      </TabPanel>

      <!-- Guestbook Tab Panel -->
      <TabPanel class="outline-none">
        <div class="flex flex-col gap-4 p-4">
          <div v-for="entry in guestbookEntries" :key="entry.id" class="flex flex-col gap-2">
            <div class="flex flex-row justify-between">
              <span class="text-text-secondary text-ui-small uppercase">{{
                format(new Date(entry.updated_at ?? ''), 'dd MMMM, yy HH:mm')
              }}</span>
              <button
                class="text-ui-small text-red-700 uppercase"
                @click="deleteGuestbookEntry(entry.id)"
              >
                Delete
              </button>
              <!-- <button
                type="button"
                class="btn primary h-6 cursor-pointer"
                title="Delete drawing"
              ></button> -->
            </div>
            <div class="drawing-board relative h-80! w-full">
              <svg class="h-full w-full">
                <path
                  v-for="(points, idx) in parseStrokes(entry.strokes)"
                  :key="idx"
                  :d="getSvgPathFromStroke(points)"
                  class="fill-surface-inverted"
                />
              </svg>
              <div
                class="bg-surface-secondary text-ui text-text-tertiary border-border-high-contrast absolute right-0 bottom-0 flex flex-row items-center justify-center gap-1.5 rounded-tl-xl border-t border-l px-2 py-1"
              >
                <img
                  v-if="entry.avatar_url"
                  :src="entry.avatar_url"
                  :alt="entry.display_name || 'User avatar'"
                  class="border-border-primary size-5 rounded-full border object-cover"
                  @error="entry.avatar_url = undefined"
                />
                <span class="max-w-60 truncate">
                  {{ entry.email || entry.display_name || 'Anonymous' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabPanels>
  </TabGroup>

  <!-- Add Person Bottom Sheet Modal -->
  <TransitionRoot appear :show="isAddPersonModalOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="isAddPersonModalOpen = false">
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
        <div class="flex min-h-full items-end justify-center sm:items-center sm:p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="bg-surface-primary border-border-primary text-text-primary flex w-full max-w-lg flex-col gap-4 rounded-t-2xl border p-6 shadow-2xl sm:rounded-2xl"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-h3 font-semibold">Add Person</h3>
                <button
                  type="button"
                  aria-label="Close modal"
                  class="hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                  @click="isAddPersonModalOpen = false"
                >
                  <X :size="18" />
                </button>
              </div>

              <form class="flex flex-col gap-3" @submit.prevent="addPerson">
                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Organization</span>
                  <div
                    class="bg-surface-primary border-border-primary text-text-primary text-ui relative flex h-[42px] cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                  >
                    <span>
                      {{
                        availableOrgs.find((o) => o.id === newPersonForm.orgId)?.name ||
                        'Select organization'
                      }}
                    </span>
                    <ChevronDown :size="14" class="shrink-0 opacity-70" />
                    <select
                      v-model="newPersonForm.orgId"
                      class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      required
                    >
                      <option v-for="org in availableOrgs" :key="org.id" :value="org.id">
                        {{ org.name }}
                      </option>
                    </select>
                  </div>
                </label>

                <div class="flex items-center gap-4">
                  <div
                    class="bg-surface-secondary border-border-primary flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                  >
                    <img
                      v-if="imagePreviewUrl"
                      :src="imagePreviewUrl"
                      alt="Preview"
                      class="size-full object-cover"
                    />
                    <span v-else class="text-ui-small text-text-tertiary uppercase">
                      {{ newPersonForm.name ? newPersonForm.name.charAt(0) : '?' }}
                    </span>
                  </div>

                  <div class="flex flex-1 flex-col gap-1">
                    <span class="text-ui-small text-text-tertiary pl-1.5">Profile Picture</span>
                    <label
                      class="btn stroke text-ui-small flex w-fit cursor-pointer items-center gap-2"
                    >
                      <Upload :size="14" />
                      <span>{{
                        isConvertingImage
                          ? 'Converting...'
                          : selectedImageFile
                            ? 'Change image'
                            : 'Select image'
                      }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        :disabled="isConvertingImage"
                        @change="onImageFileSelected"
                      />
                    </label>
                    <p v-if="selectedImageFile" class="text-ui-small text-text-secondary truncate">
                      {{ selectedImageFile.name }} (400×400 .webp)
                    </p>
                  </div>
                </div>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Name</span>
                  <input
                    v-model="newPersonForm.name"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    type="text"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">LinkedIn URL</span>
                  <input
                    v-model="newPersonForm.linkedin"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                  />
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Quote</span>
                  <textarea
                    v-model="newPersonForm.quote"
                    rows="2"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    placeholder="Optional quote"
                  ></textarea>
                </label>

                <div class="flex gap-2 pt-2">
                  <button
                    class="btn primary"
                    type="submit"
                    :disabled="isAddingPerson || !newPersonForm.name || !newPersonForm.orgId"
                  >
                    {{ isAddingPerson ? 'Adding...' : 'Add Person' }}
                  </button>
                  <button class="btn stroke" type="button" @click="isAddPersonModalOpen = false">
                    Cancel
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  BriefcaseBusiness,
  ChevronDown,
  ExternalLink,
  GalleryHorizontal,
  KeyRound,
  Loader,
  Luggage,
  Pencil,
  Pin,
  Plus,
  Repeat,
  Star,
  Upload,
  X,
} from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { getStroke } from 'perfect-freehand'
import { computed, reactive, ref, watch } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { type ClearanceLevel, isHighClearance } from '@/composables/useTravel'
import { workHistory } from '@/data/work'
import { getStorageUrl, supabase } from '@/supabase'

interface UserRoleRecord {
  avatar_url?: string
  created_at?: string
  email?: string
  full_name?: string
  last_sign_in_at?: string
  role: ClearanceLevel
  user_id: string
}

const selectedTab = ref(1)
const tabs = [
  { icon: KeyRound, name: 'roles' },
  { icon: BriefcaseBusiness, name: 'people' },
  { icon: Luggage, name: 'trip' },
  { icon: GalleryHorizontal, name: 'images' },
  { icon: Pencil, name: 'guestbook' },
]

const tabQueryKeys: Record<number, string[]> = {
  0: ['admin-user-roles'],
  1: ['admin-work-people'],
  2: ['admin-trips'],
  3: ['admin-images'],
  4: ['admin-guestbook'],
}

const clearanceLevels: ClearanceLevel[] = ['auth', 'known', 'friends', 'close']

const queryClient = useQueryClient()
const pendingRoles = reactive<Record<string, ClearanceLevel>>({})

// Pull to refresh state & handlers
const pullDistance = ref(0)
const pullThreshold = 60
const isRefreshing = ref(false)

let startY = 0
let isPulling = false

async function handleRefresh() {
  const queryKey = tabQueryKeys[selectedTab.value]
  if (queryKey) {
    await queryClient.invalidateQueries({ queryKey })
  }
}

async function onTouchEnd() {
  if (!isPulling || isRefreshing.value) return
  isPulling = false

  if (pullDistance.value >= pullThreshold) {
    isRefreshing.value = true
    pullDistance.value = pullThreshold
    await handleRefresh()
    isRefreshing.value = false
  }
  pullDistance.value = 0
}

function onTouchMove(e: TouchEvent) {
  if (!isPulling || isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  const currentY = e.touches[0].clientY
  const diffY = currentY - startY

  if (diffY > 0 && (!target || target.scrollTop <= 0)) {
    pullDistance.value = Math.min(diffY * 0.45, 120)
  } else {
    pullDistance.value = 0
    isPulling = false
  }
}

function onTouchStart(e: TouchEvent) {
  if (isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  if (!target || target.scrollTop <= 0) {
    startY = e.touches[0].clientY
    isPulling = true
  }
}

const { data: userRolesList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    // Query view with auth profile joined
    const { data: viewData, error: viewError } = await supabase
      .from('admin_user_roles_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (viewError) {
      console.warn('admin_user_roles_view query failed, falling back:', viewError)
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as UserRoleRecord[]
    }

    return (viewData || []) as UserRoleRecord[]
  },
  queryKey: ['admin-user-roles'],
})

// Sync pending roles when data loads
watch(
  userRolesList,
  (list) => {
    if (list) {
      list.forEach((u) => {
        if (!pendingRoles[u.user_id]) {
          pendingRoles[u.user_id] = u.role
        }
      })
    }
  },
  { immediate: true },
)

const roleBadgeClasses: Record<ClearanceLevel, string> = {
  admin: '',
  auth: 'bg-yellow-500 dark:text-yellow-400',
  close: 'bg-green-500 dark:text-green-400',
  friends: 'bg-purple-500 dark:text-purple-400',
  known: 'bg-blue-500 dark:text-blue-400',
  public: '',
}

interface PersonForm {
  imageName: string
  linkedin: string
  name: string
  quote: string
}

// ----------------------------------------------------
// PEOPLE TAB
// ----------------------------------------------------
interface WorkPersonRecord {
  imageName: string
  linkedin: null | string
  name: string
  orgId: string
  quote: null | string
}

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
  queryKey: ['admin-work-people'],
})

const orgsWithPeople = computed(() => {
  const people = peopleList.value || []
  const orgMap = new Map<string, { id: string; name: string; people: WorkPersonRecord[] }>()

  workHistory.forEach((w) => {
    if (w.orgId && !orgMap.has(w.orgId)) {
      orgMap.set(w.orgId, { id: w.orgId, name: w.orgName, people: [] })
    }
  })

  people.forEach((p) => {
    if (!orgMap.has(p.orgId)) {
      orgMap.set(p.orgId, { id: p.orgId, name: p.orgId, people: [] })
    }
    orgMap.get(p.orgId)!.people.push(p)
  })

  return Array.from(orgMap.values())
    .filter((org) => org.people.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const isAddPersonModalOpen = ref(false)
const isAddingPerson = ref(false)
const isConvertingImage = ref(false)
const selectedImageFile = ref<File | null>(null)
const imagePreviewUrl = ref<null | string>(null)

async function convertToSquareWebp(file: File, size = 400, quality = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  const minDim = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - minDim) / 2
  const sy = (bitmap.height - minDim) / 2
  ctx.drawImage(bitmap, sx, sy, minDim, minDim, 0, 0, size, size)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas conversion failed'))
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }))
      },
      'image/webp',
      quality,
    )
  })
}

const newPersonForm = reactive({
  linkedin: '',
  name: '',
  orgId: '',
  quote: '',
})

const availableOrgs = computed(() => {
  const map = new Map<string, string>()
  workHistory.forEach((w) => {
    if (w.orgId) map.set(w.orgId, w.orgName)
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})
})

// ----------------------------------------------------
// GUESTBOOK TAB
// ----------------------------------------------------
interface GuestbookEntry {
  avatar_url?: string
  created_at?: string
  display_name?: string
  email?: string
  id: string
  strokes: number[][][]
  updated_at?: string
  user_id?: string
}

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

    await queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
    await queryClient.invalidateQueries({ queryKey: ['work-people'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete person: ${errorMsg}`)
  }
}

async function deleteTrip(slug: string) {
  if (!confirm(`Are you sure you want to delete trip "${slug}"?`)) return

  try {
    const { error } = await supabase.from('trips').delete().eq('slug', slug)
    if (error) throw error

    delete editTripForms[slug]

    await queryClient.invalidateQueries({ queryKey: ['admin-trips'] })
    await queryClient.invalidateQueries({ queryKey: ['trips'] })
    await queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete trip: ${errorMsg}`)
  }
}

function formatTripDate(dateStr?: null | string) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'MMMM yyyy')
  } catch {
    return dateStr
  }
}

function getEditForm(person: WorkPersonRecord): PersonForm {
  const key = getPersonKey(person)
  if (!editForms[key]) {
    editForms[key] = {
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

function getRoleBadgeClass(role: ClearanceLevel) {
  return roleBadgeClasses[role] || roleBadgeClasses.public
}

function getWorkPersonUrl(orgId: string, filename?: string) {
  if (!filename) return ''
  const name = filename.replace(/\.[^/.]+$/, '')
  return getStorageUrl('webp', orgId, `${name}.webp`)
}

function resetPerson(person: WorkPersonRecord) {
  const key = getPersonKey(person)
  editForms[key] = {
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
        imageName: form.imageName,
        linkedin: form.linkedin || null,
        name: form.name,
        quote: form.quote || null,
      })
      .eq('orgId', person.orgId)
      .eq('name', person.name)

    if (error) throw error

    person.name = form.name
    person.imageName = form.imageName
    person.linkedin = form.linkedin || null
    person.quote = form.quote || null

    if (form.name !== person.name) {
      delete editForms[key]
    }

    await queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
    await queryClient.invalidateQueries({ queryKey: ['work-people'] })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save person: ${errorMsg}`)
  } finally {
    savingPersonKey.value = null
  }
}

async function saveRole(user: UserRoleRecord) {
  const newRole = pendingRoles[user.user_id]
  if (!newRole) return

  user.role = newRole

  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ role: newRole, user_id: user.user_id })

    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to update role: ${errorMsg}`)
    await queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  }
}

const { data: guestbookEntries } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data: viewData, error: viewError } = await supabase
      .from('admin_guestbook_view')
      .select('*')
      .order('updated_at', { ascending: false })

    if (viewError) {
      console.warn('admin_guestbook_view query failed, falling back:', viewError)
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return (data || []) as GuestbookEntry[]
    }

    return (viewData || []) as GuestbookEntry[]
  },
  queryKey: ['admin-guestbook'],
})

async function deleteGuestbookEntry(id: string) {
  if (!confirm('Are you sure you want to delete this drawing?')) return

  try {
    const { error } = await supabase.from('guestbook').delete().eq('id', id)
    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['admin-guestbook'] })
    await queryClient.invalidateQueries({ queryKey: ['guestbook', 'latest'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete drawing: ${errorMsg}`)
  }
}

function getSvgPathFromStroke(points: number[][]) {
  if (!points?.length) return ''
  const outline = getStroke(points, {
    simulatePressure: false,
    size: 6,
    smoothing: 0.7,
    streamline: 0.3,
    thinning: 0.5,
  })
  if (!outline.length) return ''

  const d = outline.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...outline[0], 'Q'],
  )
  d.push('Z')
  return d.join(' ')
}

function parseStrokes(raw: unknown): number[][][] {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  return raw as number[][][]
}
</script>

<style scoped>
@reference "@/style.css";

.drawing-board {
  @apply border-border-primary relative h-full w-full overflow-hidden rounded-lg border;
  background: url('@/assets/patterns/dot_grid.webp');
  background-size: 2.5%;
  @apply bg-repeat;
}

.dark .drawing-board {
  background: url('@/assets/patterns/dot_grid_dark.webp');
  background-size: 2.5%;
}

.canvas {
  @apply absolute inset-0 h-full w-full cursor-crosshair touch-none;
}

.keyboard-key {
  @apply bg-surface-primary border-border-high-contrast rounded-special text-text-primary flex h-8 w-8.5 items-center justify-center border;
  box-shadow: 0 4px 0 0 var(--color-border-high-contrast);
}
</style>
